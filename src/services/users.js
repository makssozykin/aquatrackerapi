import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { SessionsCollection } from '../db/models/session.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';
import {
  THIRTY_DAYS,
  THIRTY_MINUTES,
  APP_DOMAIN,
  JWT_SECRET,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';

export const signupUser = async ({ email, password, ...rest }) => {
  if (await UsersCollection.exists({ email })) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return UsersCollection.create({ email, password: hashedPassword, ...rest });
};

const generateSession = () => ({
  accessToken: randomBytes(30).toString('base64'),
  refreshToken: randomBytes(30).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + THIRTY_MINUTES),
  refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
});

export const signinUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const sessionData = generateSession();

  const session = await SessionsCollection.create({
    userId: user._id,
    ...sessionData,
  });

  if (!session.accessToken) {
    throw createHttpError(500, 'Failed to generate access token');
  }

  return {
    session,
    user,
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = generateSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
  return SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const updateUser = async (id, payload, options = {}) =>
  UsersCollection.findOneAndUpdate({ _id: id }, payload, {
    ...options,
    new: true,
  });

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found');

  const resetToken = jwt.sign({ sub: user._id, email }, JWT_SECRET, {
    expiresIn: '15m',
  });
  const templatePath = path.join(TEMPLATES_DIR, 'reset-password-email.html');
  const template = handlebars.compile(await fs.readFile(templatePath, 'utf-8'));

  await sendEmail({
    from: SMTP.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html: template({
      name: user.name,
      link: `${APP_DOMAIN}/reset-password?token=${resetToken}`,
    }),
  });
};

export const resetPassword = async ({ token, password }) => {
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Token is expired or invalid');
  }

  const user = await UsersCollection.findOne({
    _id: decoded.sub,
    email: decoded.email,
  });
  if (!user) throw createHttpError(404, 'User not found');

  const hashedPassword = await bcrypt.hash(password, 10);
  await UsersCollection.updateOne(
    { _id: user._id },
    { $set: { password: hashedPassword } },
  );
  await SessionsCollection.deleteMany({ userId: user._id });
};

export const getUsersCount = async () => {
  try {
    const usersCount = await UsersCollection.countDocuments({});

    // get three last avatars
    const lastUsers = await UsersCollection.find({}).sort({ createdAt: -1 }); //.limit(3);
    const lastUsersAvatars = lastUsers
      .map((user) => user.avatarUrl)
      .filter((url) => url && url.trim() !== '')
      .slice(0, 3);

    return {
      usersCount,
      lastUsersAvatars,
    };
  } catch (error) {
    console.error('Error fetching users data:', error);
    throw error;
  }
};

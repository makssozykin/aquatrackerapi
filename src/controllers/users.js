import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

import { THIRTY_DAYS } from '../constants/index.js';
import {
  signinUser,
  // logoutUser,
  refreshUsersSession,
  requestResetToken,
  resetPassword,
  getUsersCount,
  logoutUser,
} from '../services/users.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
// import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
// import { getEnvVar } from '../utils/getEnvVar.js';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

export const signupUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UsersCollection.findOne({ email });
    if (existingUser) {
      return next(createHttpError(409, 'Email already in use'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UsersCollection.create({
      email,
      password: hashedPassword,
    });

    // Генерация сессии и токенов для нового пользователя
    const { session } = await signinUser({ email, password });

    if (!session || !session.refreshToken) {
      return next(createHttpError(500, 'Failed to create session'));
    }

    setupSession(res, session);

    res.status(201).json({
      message: 'Successfully registered a user!',
      user: {
        email: newUser.email,
        name: newUser.name,
        gender: newUser.gender,
        avatar: newUser.avatarUrl,
        weight: newUser.weight,
        dailySportTime: newUser.dailySportTime,
        dailyNorm: newUser.dailyNorm,
      },
      accessToken: session.accessToken,
      sessionId: session._id,
      refreshToken: session.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const signinUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UsersCollection.findOne({ email });
    if (!user) {
      return next(createHttpError(401, 'Invalid email or password'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid email or password'));
    }

    const { session } = await signinUser({ email, password });

    if (!session || !session.accessToken) {
      return next(createHttpError(500, 'Failed to generate access token'));
    }

    setupSession(res, session);

    res.status(200).json({
      message: 'Successfully logged in!',
      user: {
        email: user.email,
        name: user.name,
        gender: user.gender,
        avatar: user.avatarUrl,
        weight: user.weight,
        dailySportTime: user.dailySportTime,
        dailyNorm: user.dailyNorm,
      },
      accessToken: session.accessToken,
      sessionId: session._id,
      refreshToken: session.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshUserSessionController = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;
    if (!sessionId || !refreshToken) {
      return next(createHttpError(401, 'Refresh token missing'));
    }
    const session = await refreshUsersSession({ sessionId, refreshToken });
    if (!session) {
      return next(createHttpError(401, 'Invalid refresh token'));
    }
    const user = await UsersCollection.findById(session.userId);
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }
    setupSession(res, session);
    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed session!',
      sessionId: session._id,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: {
        email: user.email,
        name: user.name,
        gender: user.gender,
        avatar: user.avatarUrl,
        weight: user.weight,
        dailySportTime: user.dailySportTime,
        dailyNorm: user.dailyNorm,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUserController = async (req, res, next) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const getCurrentUserController = async (req, res, next) => {
  try {
    const {
      _id,
      name,
      email,
      gender,
      weight,
      dailySportTime,
      dailyNorm,
      avatarUrl,
    } = req.user;
    res.status(200).json({
      status: 200,
      message: 'Current user retrieved successfully!',
      data: {
        _id,
        name,
        email,
        gender,
        weight,
        dailySportTime,
        dailyNorm,
        avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserController = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { email, ...updateData } = req.body;

    if (email) {
      const existingUser = await UsersCollection.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return next(createHttpError(409, 'Email already in use'));
      }
      updateData.email = email;
    }

    const updatedUser = await UsersCollection.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return next(createHttpError(404, 'User not found or not updated'));
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated user information!',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserAvatarController = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const photo = req.file;

    if (!photo) {
      return next(createHttpError(400, 'No file uploaded'));
    }

    const avatarUrl = await saveFileToCloudinary(photo.path);

    const updatedUser = await UsersCollection.findByIdAndUpdate(
      userId,
      { avatarUrl },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return next(createHttpError(404, 'User not found or not updated'));
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated user avatar!',
      data: { avatarUrl: updatedUser.avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const requestResetEmailController = async (req, res, next) => {
  try {
    await requestResetToken(req.body.email);
    res.json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    await resetPassword(req.body);
    res.json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const getUsersCounterController = async (req, res, next) => {
  try {
    const userData = await getUsersCount();
    const { usersCount, lastUsersAvatars } = userData;

    res.status(200).json({
      status: 200,
      message: 'Successfully got total count of registered users!',
      // data: {
      usersCount,
      lastUsersAvatars,
      // },
    });
  } catch (error) {
    next(error);
  }
};

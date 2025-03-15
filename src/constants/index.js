import path from 'node:path';
import dotenv from 'dotenv';

export const GENDER_TYPES = ['man', 'woman'];
export const THIRTY_MINUTES = 30 * 60 * 1000;
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
export const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
export const CLOUDINARY = {
  CLOUD_NAME: 'CLOUD_NAME',
  API_KEY: 'API_KEY',
  API_SECRET: 'API_SECRET',
};

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

dotenv.config();

export const SMTP = {
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
};

export const JWT_SECRET = process.env.JWT_SECRET;
export const APP_DOMAIN = process.env.APP_DOMAIN;
export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import createHttpError from 'http-errors';
import { getEnvVar } from './getEnvVar.js';
import { CLOUDINARY } from '../constants/index.js';

cloudinary.config({
  secure: true,
  cloud_name: getEnvVar(CLOUDINARY.CLOUD_NAME),
  api_key: getEnvVar(CLOUDINARY.API_KEY),
  api_secret: getEnvVar(CLOUDINARY.API_SECRET),
});

export const saveFileToCloudinary = async (filePath) => {
  if (!filePath) throw createHttpError(400, 'Invalid file path');

  try {
    const response = await cloudinary.uploader.upload(filePath, {
      folder: 'avatars',
      resource_type: 'image',
      transformation: [{ width: 300, height: 300, crop: 'fill' }],
    });

    return response.secure_url;
  } catch (error) {
    throw createHttpError(500, 'Failed to upload avatar');
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Failed to delete local file:', unlinkError);
    }
  }
};

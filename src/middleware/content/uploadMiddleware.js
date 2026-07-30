/**
 * @fileoverview Multer-Cloudinary middleware for uploading DigitalContent files.
 * Handles videos, audio, documents (PDFs), and images for the HopeLearn Digital Library.
 * Follows SOLID and service-oriented principles for reusability and maintainability.
 */

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import dotenv from 'dotenv'; 
dotenv.config();

/**
 * Configure Cloudinary with environment variables.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Allowed mime types and extensions for DigitalContent uploads.
 */
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const ALLOWED_EXTENSIONS = [
  '.mp4', '.mov', '.mp3', '.wav', '.pdf',
  '.jpg', '.jpeg', '.png', '.gif', '.webp'
];

/**
 * File filter to validate file type and extension.
 * @param {Request} req
 * @param {Express.Multer.File} file
 * @param {Function} cb
 */
export function digitalContentFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    ALLOWED_MIME_TYPES.includes(file.mimetype) &&
    ALLOWED_EXTENSIONS.includes(ext)
  ) {
    cb(null, true);
  } else {
    const error = new Error(
      'Invalid file type. Only MP4, MOV, MP3, WAV, PDF, JPG, JPEG, PNG, GIF, and WEBP files are allowed.'
    );
    error.statusCode = 400;
    cb(error, false);
  }
}

/**
 * Cloudinary storage configuration for DigitalContent.
 */
const digitalContentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto';
    if (file.mimetype.startsWith('video/')) resourceType = 'video';
    else if (file.mimetype.startsWith('audio/')) resourceType = 'video'; // Cloudinary treats audio as video resource
    else if (file.mimetype === 'application/pdf') resourceType = 'raw';
    else if (file.mimetype.startsWith('image/')) resourceType = 'image';

    return {
      folder: 'hopelearn/digital_library',
      resource_type: resourceType,
      public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
      format: path.extname(file.originalname).replace('.', ''),
    };
  },
});

/**
 * Multer middleware instance for DigitalContent uploads.
 * Handles single file upload with field name 'file'.
 */
const uploadDigitalContent = multer({
  storage: digitalContentStorage,
  fileFilter: digitalContentFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit, adjust as needed
}).single('file');

/**
 * Express middleware to handle file upload errors and return safe JSON responses.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
export function digitalContentUploadMiddleware(req, res, next) {
  uploadDigitalContent(req, res, function (err) {
    if (err) {
      let errorObj;
      if (typeof err === 'string') {
        errorObj = new Error(err);
        errorObj.statusCode = 400;
      } else if (err instanceof Error) {
        errorObj = err;
        errorObj.statusCode = err.statusCode || 500;
      } else {
        errorObj = new Error('Unknown upload error');
        errorObj.statusCode = 500;
      }
      return res.status(errorObj.statusCode).json({
        success: false,
        message: errorObj.message || 'File upload failed.',
      });
    }
    next();
  });
}
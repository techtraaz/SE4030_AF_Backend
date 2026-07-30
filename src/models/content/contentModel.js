/**
 * @fileoverview Mongoose schema and model definition for DigitalContent.
 * This model represents standalone educational resources in the HopeLearn Digital Library.
 * Follows SOLID principles and is compatible with Service-Repository Pattern architecture.
 */

import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

/**
 * DigitalContentSchema
 * Defines the structure for digital library resources.
 */
const DigitalContentSchema = new Schema(
  {
    uploaderId: {
      type: Types.ObjectId,
      ref: 'User',
      required: false, // Auth integration pending
    },
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required.'],
    },
    category: {
      type: String,
      required: [true, 'Category is required.'],
    },
    contentType: {
      type: String,
      required: [true, 'Content type is required.'],
      enum: {
        values: ['video', 'audio', 'document', 'image'],
        message: 'Content type must be one of: video, audio, document, image.',
      },
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required.'],
    },
    cloudinaryId: {
      type: String,
      required: [true, 'Cloudinary public ID is required.'],
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: 'Approval status must be Pending, Approved, or Rejected.',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'digital_contents',
  }
);

/**
 * DigitalContent Model
 * Exports the model using the Module Pattern for compatibility with
 * Service-Repository architectures and testability.
 */
export const DigitalContent = model('DigitalContent', DigitalContentSchema);
export { DigitalContentSchema };
/**
 * @fileoverview Controller for DigitalContent (Digital Library) module.
 * Handles creation, retrieval, updating, and deletion of digital library resources.
 */

import * as contentService from '../../service/content/contentService.js';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Create a new DigitalContent entry.
 * Assigns the currently authenticated user's ID as the uploader.
 */
export const createContent = async (req, res, next) => {
  try {
    const { title, description, category, contentType } = req.body;

    const fileUrl = req.file.path || req.file.secure_url;
    const cloudinaryId = req.file.filename || req.file.public_id;
    
    // Automatically extract the authenticated user's ID from the token payload
    const uploaderId = req.user._id;

    const contentData = {
      uploaderId,
      title,
      description,
      category,
      contentType,
      fileUrl,
      cloudinaryId,
    };

    const newContent = await contentService.createContent(contentData);

    return res.status(201).json({
      success: true,
      data: newContent,
      message: 'Digital content created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all DigitalContent entries, with an optional category filter. (Public Access)
 */
export const getAllContent = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const contents = await contentService.getAllContent(filter);

    return res.status(200).json({
      success: true,
      data: contents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a DigitalContent entry.
 * Strictly verifies ownership: Only the original uploader can perform modifications.
 */
export const updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // 1. Retrieve the existing content document from the database
    const existingContent = await contentService.getContentById(id);
      
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found.',
      });
    }

    // 2. Ownership Verification: Ensure the logged-in user matches the original uploader
    if (existingContent.uploaderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            code: 403,
            message: "Access Denied: You do not have permission to modify another user's content.",
            content: null
        });
    }

    // 3. Process new file upload and securely destroy the old file in Cloudinary
    if (req.file) {
      if (existingContent.cloudinaryId) {
        let resourceType = 'image';
        if (existingContent.contentType === 'video' || existingContent.contentType === 'audio') {
          resourceType = 'video';
        } else if (existingContent.contentType === 'document') {
          resourceType = 'raw';
        }
        await cloudinary.uploader.destroy(existingContent.cloudinaryId, { resource_type: resourceType }).catch(err => console.error(err));
      }

      updateData.fileUrl = req.file.path || req.file.secure_url;
      updateData.cloudinaryId = req.file.filename || req.file.public_id;
    }

    const updatedContent = await contentService.updateContentById(id, updateData);

    return res.status(200).json({
      success: true,
      data: updatedContent,
      message: 'Digital content updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a DigitalContent entry from Database AND Cloudinary.
 * Strictly verifies ownership: Only the original uploader can perform deletions.
 */
export const deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Retrieve the content document to verify its existence
    const content = await contentService.getContentById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found.',
      });
    }

    // 2. Ownership Verification: Ensure the logged-in user matches the original uploader
    if (content.uploaderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            code: 403,
            message: "Access Denied: You do not have permission to delete another user's content.",
            content: null
        });
    }

    // 3. Process secure deletion of the associated media file from Cloudinary
    if (content.cloudinaryId) {
      let resourceType = 'image';
      if (content.contentType === 'video' || content.contentType === 'audio') {
        resourceType = 'video';
      } else if (content.contentType === 'document') {
        resourceType = 'raw';
      }
      await cloudinary.uploader.destroy(content.cloudinaryId, { resource_type: resourceType }).catch(err => console.error(err));
    }

    // 4. Finally, remove the document from the database
    await contentService.deleteContentById(id);

    return res.status(200).json({
      success: true,
      message: 'Digital content and associated files deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
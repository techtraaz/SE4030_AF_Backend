/**
 * @fileoverview Custom Validation Middleware for Digital Content
 * Handles both POST (Create) and PUT (Update) request validations safely.
 */
import { v2 as cloudinary } from 'cloudinary';

export const validateDigitalContent = async (req, res, next) => {
  const { title, description, category, contentType } = req.body;
  let errors = [];

  // Helper function: Checks if the string contains at least one letter or number
  const hasValidChars = (str) => /[a-zA-Z0-9]/.test(str);
  
  // Helper function for Title: Allows only letters, numbers, and spaces (no symbols)
  const isValidTitle = (str) => /^[a-zA-Z0-9\s]+$/.test(str);

  // Helper function for Category: Allows only letters and spaces (no numbers or symbols)
  const isValidCategory = (str) => /^[a-zA-Z\s]+$/.test(str);

  // ---------------------------------------------------------
  // 1. POST Request (Create)
  // ---------------------------------------------------------
  if (req.method === 'POST') {
    if (!title || title.trim().length < 3 || !isValidTitle(title)) {
      errors.push("A valid title is required (min 3 characters, no symbols allowed).");
    }
    if (!description || description.trim().length < 10 || !hasValidChars(description)) {
      errors.push("A valid description is required (min 10 characters, cannot be only symbols).");
    }
    // Prevent symbols and numbers in category
    if (!category || category.trim() === "" || !isValidCategory(category)) {
      errors.push("Category is required and must contain only letters (no numbers or symbols allowed).");
    }
    if (!contentType || !['video', 'audio', 'document', 'image'].includes(contentType)) {
      errors.push("Valid content type is required (video, audio, document, image).");
    }
    if (!req.file) {
      errors.push("A content file is required for upload.");
    }
  }

  // ---------------------------------------------------------
  // 2. PUT Request (Update)
  // ---------------------------------------------------------
  if (req.method === 'PUT') {
    const hasFields = title || description || category || contentType;
    
    // Prevent completely empty update requests
    if (!hasFields && !req.file) {
      errors.push("Update request cannot be empty. Please provide at least one field or file to update.");
    } else {
      if (title !== undefined && (title.trim().length < 3 || !isValidTitle(title))) {
        errors.push("If title is provided, it must be at least 3 characters long and contain no symbols.");
      }
      if (description !== undefined && (description.trim().length < 10 || !hasValidChars(description))) {
        errors.push("If description is provided, it must be valid and at least 10 characters long.");
      }
      if (contentType !== undefined && !['video', 'audio', 'document', 'image'].includes(contentType)) {
        errors.push("If content type is provided, it must be valid.");
      }
      // Prevent symbols and numbers in category if updating
      if (category !== undefined && (category.trim() === "" || !isValidCategory(category))) {
        errors.push("If category is provided, it must contain only letters (no numbers or symbols allowed).");
      }
    }
  }

  // ---------------------------------------------------------
  // 3. Errors Handling & Cloudinary Cleanup
  // ---------------------------------------------------------
  if (errors.length > 0) {
    // If validation fails, safely delete the uploaded file from Cloudinary to prevent orphaned files
    if (req.file && req.file.filename) {
      let resourceType = 'image';
      if (req.file.mimetype.startsWith('video/') || req.file.mimetype.startsWith('audio/')) resourceType = 'video';
      else if (req.file.mimetype === 'application/pdf') resourceType = 'raw';
      
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: resourceType }).catch(err => console.error("Cloudinary cleanup failed:", err));
    }

    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors
    });
  }

  // Proceed to the next middleware or controller if no errors
  next();
};
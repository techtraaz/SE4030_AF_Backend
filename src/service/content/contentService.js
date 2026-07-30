/**
 * @fileoverview Service layer for DigitalContent (Digital Library) module.
 * Handles database operations for digital content.
 */

import { DigitalContent } from '../../models/content/contentModel.js';

/**
 * Create and save a new DigitalContent entry.
 * @param {Object} contentData - Data for the new digital content.
 * @returns {Promise<Object>} The created DigitalContent document.
 */
export const createContent = async (contentData) => {
  const content = new DigitalContent(contentData);
  return await content.save();
};

/**
 * Retrieve all DigitalContent entries matching the filter.
 * Sorted by createdAt in descending order.
 * @param {Object} filter - MongoDB filter object.
 * @returns {Promise<Array>} Array of DigitalContent documents.
 */
export const getAllContent = async (filter = {}) => {
  return await DigitalContent.find(filter).sort({ createdAt: -1 });
};

/**
 * Find a DigitalContent entry by ID.
 * @param {string} id - The MongoDB document ID.
 * @returns {Promise<Object>} The DigitalContent document.
 */
export const getContentById = async (id) => {
  return await DigitalContent.findById(id);
};

/**
 * Update an existing DigitalContent entry by ID.
 * @param {string} id - The MongoDB document ID.
 * @param {Object} updateData - Data to update.
 * @returns {Promise<Object>} The updated DigitalContent document.
 */
export const updateContentById = async (id, updateData) => {
  return await DigitalContent.findByIdAndUpdate(id, updateData, { 
    new: true, // Returns the updated document
    runValidators: true // Ensures model validations are checked
  });
};

/**
 * Delete a DigitalContent entry by ID.
 * @param {string} id - The MongoDB document ID.
 * @returns {Promise<Object>} The deleted DigitalContent document.
 */
export const deleteContentById = async (id) => {
  return await DigitalContent.findByIdAndDelete(id);
};
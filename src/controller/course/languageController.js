import * as languageService from '../../service/course/languageService.js';

/**
 * Get all languages
 */
export const getAllLanguages = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const activeOnly = includeInactive !== 'true';
    
    const languages = await languageService.getAllLanguages(activeOnly);
    return res.success('Languages retrieved successfully', languages);
  } catch (error) {
    return res.error(error.message);
  }
};

/**
 * Get language by ID
 */
export const getLanguageById = async (req, res) => {
  try {
    const language = await languageService.getLanguageById(req.params.id);
    return res.success('Language retrieved successfully', language);
  } catch (error) {
    return res.notFound(error.message);
  }
};

/**
 * Create a new language
 */
export const createLanguage = async (req, res) => {
  try {
    const language = await languageService.createLanguage(req.body);
    return res.created('Language created successfully', language);
  } catch (error) {
    return res.badRequest(error.message);
  }
};

/**
 * Update a language
 */
export const updateLanguage = async (req, res) => {
  try {
    const language = await languageService.updateLanguage(req.params.id, req.body);
    return res.success('Language updated successfully', language);
  } catch (error) {
    return res.badRequest(error.message);
  }
};

/**
 * Delete a language
 */
export const deleteLanguage = async (req, res) => {
  try {
    await languageService.deleteLanguage(req.params.id);
    return res.success('Language deleted successfully');
  } catch (error) {
    return res.badRequest(error.message);
  }
};



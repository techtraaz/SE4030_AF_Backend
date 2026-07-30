import Language from '../../models/language.js';

/**
 * Get all languages
 * @param {boolean} activeOnly - Filter for active languages only
 * @returns {Promise<Array>} - Array of languages
 */
export const getAllLanguages = async (activeOnly = true) => {
  try {
    const filter = activeOnly ? { isActive: true } : {};
    const languages = await Language.find(filter).sort({ name: 1 });
    return languages;
  } catch (error) {
    console.error('Error getting languages:', error);
    throw error;
  }
};

/**
 * Get language by ID
 * @param {string} id - Language ID
 * @returns {Promise<Object>} - Language object
 */
export const getLanguageById = async (id) => {
  try {
    const language = await Language.findById(id);
    if (!language) {
      throw new Error('Language not found');
    }
    return language;
  } catch (error) {
    console.error('Error getting language by ID:', error);
    throw error;
  }
};

/**
 * Create a new language
 * @param {Object} languageData - Language data
 * @returns {Promise<Object>} - Created language
 */
export const createLanguage = async (languageData) => {
  try {
    const language = new Language(languageData);
    await language.save();
    return language;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Language with this name or code already exists');
    }
    console.error('Error creating language:', error);
    throw error;
  }
};

/**
 * Update a language
 * @param {string} id - Language ID
 * @param {Object} updateData - Updated language data
 * @returns {Promise<Object>} - Updated language
 */
export const updateLanguage = async (id, updateData) => {
  try {
    const language = await Language.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!language) {
      throw new Error('Language not found');
    }
    return language;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Language with this name or code already exists');
    }
    console.error('Error updating language:', error);
    throw error;
  }
};

/**
 * Delete a language
 * @param {string} id - Language ID
 * @returns {Promise<Object>} - Deleted language
 */
export const deleteLanguage = async (id) => {
  try {
    // Check if language is being used by any courses
    const { default: Course } = await import('../../models/course/Course.js');
    const coursesUsingLanguage = await Course.countDocuments({ languageId: id });
    
    if (coursesUsingLanguage > 0) {
      throw new Error(`Cannot delete language. It is being used by ${coursesUsingLanguage} course(s)`);
    }

    const language = await Language.findByIdAndDelete(id);
    if (!language) {
      throw new Error('Language not found');
    }
    return language;
  } catch (error) {
    console.error('Error deleting language:', error);
    throw error;
  }
};



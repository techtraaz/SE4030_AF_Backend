import CourseLevel from '../../models/courseLevel.js';

/**
 * Get all course levels
 * @param {boolean} activeOnly - Filter for active levels only
 * @returns {Promise<Array>} - Array of course levels
 */
export const getAllCourseLevels = async (activeOnly = true) => {
  try {
    const filter = activeOnly ? { isActive: true } : {};
    const levels = await CourseLevel.find(filter).sort({ displayOrder: 1 });
    return levels;
  } catch (error) {
    console.error('Error getting course levels:', error);
    throw error;
  }
};

/**
 * Get course level by ID
 * @param {string} id - Level ID
 * @returns {Promise<Object>} - Course level object
 */
export const getCourseLevelById = async (id) => {
  try {
    const level = await CourseLevel.findById(id);
    if (!level) {
      throw new Error('Course level not found');
    }
    return level;
  } catch (error) {
    console.error('Error getting course level by ID:', error);
    throw error;
  }
};

/**
 * Create a new course level
 * @param {Object} levelData - Level data
 * @returns {Promise<Object>} - Created level
 */
export const createCourseLevel = async (levelData) => {
  try {
    const level = new CourseLevel(levelData);
    await level.save();
    return level;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Course level with this name already exists');
    }
    console.error('Error creating course level:', error);
    throw error;
  }
};

/**
 * Update a course level
 * @param {string} id - Level ID
 * @param {Object} updateData - Updated level data
 * @returns {Promise<Object>} - Updated level
 */
export const updateCourseLevel = async (id, updateData) => {
  try {
    const level = await CourseLevel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!level) {
      throw new Error('Course level not found');
    }
    return level;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Course level with this name already exists');
    }
    console.error('Error updating course level:', error);
    throw error;
  }
};

/**
 * Delete a course level
 * @param {string} id - Level ID
 * @returns {Promise<Object>} - Deleted level
 */
export const deleteCourseLevel = async (id) => {
  try {
    // Check if level is being used by any courses
    const { default: Course } = await import('../../models/course/Course.js');
    const coursesUsingLevel = await Course.countDocuments({ levelId: id });
    
    if (coursesUsingLevel > 0) {
      throw new Error(`Cannot delete level. It is being used by ${coursesUsingLevel} course(s)`);
    }

    const level = await CourseLevel.findByIdAndDelete(id);
    if (!level) {
      throw new Error('Course level not found');
    }
    return level;
  } catch (error) {
    console.error('Error deleting course level:', error);
    throw error;
  }
};



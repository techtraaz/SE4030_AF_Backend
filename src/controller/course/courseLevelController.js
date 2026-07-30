import * as courseLevelService from '../../service/course/courseLevelService.js';

/**
 * Get all course levels
 */
export const getAllCourseLevels = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const activeOnly = includeInactive !== 'true';
    
    const levels = await courseLevelService.getAllCourseLevels(activeOnly);
    return res.success('Course levels retrieved successfully', levels);
  } catch (error) {
    return res.error(error.message);
  }
};

/**
 * Get course level by ID
 */
export const getCourseLevelById = async (req, res) => {
  try {
    const level = await courseLevelService.getCourseLevelById(req.params.id);
    return res.success('Course level retrieved successfully', level);
  } catch (error) {
    return res.notFound(error.message);
  }
};

/**
 * Create a new course level
 */
export const createCourseLevel = async (req, res) => {
  try {
    const level = await courseLevelService.createCourseLevel(req.body);
    return res.created('Course level created successfully', level);
  } catch (error) {
    return res.badRequest(error.message);
  }
};

/**
 * Update a course level
 */
export const updateCourseLevel = async (req, res) => {
  try {
    const level = await courseLevelService.updateCourseLevel(req.params.id, req.body);
    return res.success('Course level updated successfully', level);
  } catch (error) {
    return res.badRequest(error.message);
  }
};

/**
 * Delete a course level
 */
export const deleteCourseLevel = async (req, res) => {
  try {
    await courseLevelService.deleteCourseLevel(req.params.id);
    return res.success('Course level deleted successfully');
  } catch (error) {
    return res.badRequest(error.message);
  }
};



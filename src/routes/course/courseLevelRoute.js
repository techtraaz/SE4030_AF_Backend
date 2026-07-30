import express from 'express';
import * as courseLevelController from '../../controller/course/courseLevelController.js';
import { authenticate, authorizeAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view available levels
router.get('/', courseLevelController.getAllCourseLevels);
router.get('/:id', courseLevelController.getCourseLevelById);

// Admin only routes
router.post('/', authenticate, authorizeAdmin, courseLevelController.createCourseLevel);
router.put('/:id', authenticate, authorizeAdmin, courseLevelController.updateCourseLevel);
router.delete('/:id', authenticate, authorizeAdmin, courseLevelController.deleteCourseLevel);

export default router;

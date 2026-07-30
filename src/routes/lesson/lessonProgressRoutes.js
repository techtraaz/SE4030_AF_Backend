import express from "express";
import * as lessonProgressController from "../../controller/lesson/lessonProgressController.js";
import { authenticate, authorizeRefugee } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Mark lesson as complete
router.post("/complete", authenticate, authorizeRefugee, lessonProgressController.markLessonComplete);

// Mark lesson as incomplete
router.post("/incomplete", authenticate, authorizeRefugee, lessonProgressController.markLessonIncomplete);

// Get lesson progress for a specific course
router.get("/course/:courseId", authenticate, authorizeRefugee, lessonProgressController.getLessonProgress);

// Get all lesson progress across all enrolled courses
router.get("/", authenticate, authorizeRefugee, lessonProgressController.getAllLessonProgress);

export default router;

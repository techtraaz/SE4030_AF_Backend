import express from "express";
import * as enrollmentController from "../../controller/course/enrollmentController.js";
import { authenticate, authorizeRefugee } from "../../middleware/authMiddleware.js";

const router = express.Router();

// All enrollment routes require authentication and REFUGEE role

// Enroll in a course
router.post("/", authenticate, authorizeRefugee, enrollmentController.enrollInCourse);

// Get my enrollments (with optional status filter)
router.get("/", authenticate, authorizeRefugee, enrollmentController.getMyEnrollments);

// Get my enrollment statistics
router.get("/statistics", authenticate, authorizeRefugee, enrollmentController.getMyEnrollmentStats);

// Check enrollment status for a specific course
router.get("/:courseId/status", authenticate, authorizeRefugee, enrollmentController.checkEnrollmentStatus);

// Get enrollment details for a specific course
router.get("/:courseId", authenticate, authorizeRefugee, enrollmentController.getEnrollmentDetails);

// Update enrollment progress
router.patch("/:courseId/progress", authenticate, authorizeRefugee, enrollmentController.updateEnrollmentProgress);

// Unenroll from a course
router.delete("/:courseId", authenticate, authorizeRefugee, enrollmentController.unenrollFromCourse);

export default router;

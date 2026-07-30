import express from "express";
import * as quizController from "../../controller/quiz/quizController.js";
import { authenticate, authorizeRoles } from "../../middleware/authMiddleware.js";
import { ROLES } from "../../utils/constants.js";

const router = express.Router();

// Create quiz
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), quizController.createQuiz);

//Get all quizzes with optional filters
router.get("/", authenticate, quizController.getAllQuizzes);

// Get quiz by ID
router.get("/:id", authenticate, quizController.getQuizById);

// Update quiz
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), quizController.updateQuiz);

// Delete quiz
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), quizController.deleteQuiz);

// Publish quiz
router.patch("/:id/publish", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), quizController.publishQuiz);

// Unpublish quiz
router.patch("/:id/unpublish", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), quizController.unpublishQuiz);

export default router;
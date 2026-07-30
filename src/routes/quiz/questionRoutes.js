import express from "express";
import * as questionController from "../../controller/quiz/questionController.js";
import { authenticate, authorizeRoles } from "../../middleware/authMiddleware.js";
import { ROLES } from "../../utils/constants.js";

const router = express.Router();

// Create question (with optional options)
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), questionController.createQuestion);

// Get all questions for a quiz
router.get("/quiz/:quizId", authenticate, questionController.getAllQuestionsByQuiz);

// Get question by ID with options
router.get("/:id", authenticate, questionController.getQuestionById);

// Update question
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), questionController.updateQuestion);

// Delete question
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), questionController.deleteQuestion);

// Reorder questions within a quiz
router.patch("/quiz/:quizId/reorder", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), questionController.reorderQuestions);

export default router;
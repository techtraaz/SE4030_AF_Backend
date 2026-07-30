import express from "express";
import * as distractorController from "../../controller/quiz/distractorController.js";
import { authenticate, authorizeRoles } from "../../middleware/authMiddleware.js";
import { ROLES } from "../../utils/constants.js";

const router = express.Router();

/**
 * Third-Party API Integration Routes (Datamuse API)
 * These endpoints provide AI-powered quiz enhancement features
 */

// Generate distractor options (wrong answers) for quiz questions
// Accessible by ADMIN and CONTENT_CONTRIBUTOR for quiz creation
router.post(
    "/generate", 
    authenticate, 
    authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), 
    distractorController.generateDistractors
);

// Generate contextual hints for quiz questions (for future hint feature)
// Accessible by authenticated users (refugees taking quizzes)
router.post(
    "/hints", 
    authenticate, 
    distractorController.generateHints
);

// Get educational context (synonyms, related words) for vocabulary enhancement
// Accessible by authenticated users
router.get(
    "/context/:word", 
    authenticate, 
    distractorController.getEducationalContext
);

export default router;

import express from "express";
import * as optionController from "../../controller/quiz/optionController.js";
import { authenticate, authorizeRoles } from "../../middleware/authMiddleware.js";
import { ROLES } from "../../utils/constants.js";

const router = express.Router();

// Create option
router.post("/", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), optionController.createOption);

// Get all options for a question
router.get("/question/:questionId", authenticate, optionController.getOptionsByQuestion);

// Update option
router.put("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), optionController.updateOption);

// Delete option
router.delete("/:id", authenticate, authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR), optionController.deleteOption);

export default router;
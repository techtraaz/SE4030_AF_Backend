import express from "express";
import quizRoutes from "./quizRoutes.js";
import questionRoutes from "./questionRoutes.js";
import optionRoutes from "./optionRoutes.js";
import quizAttemptRoutes from "./quizAttemptRoutes.js";
import distractorRoutes from "./distractorRoutes.js";

const router = express.Router();

router.use("/quizzes", quizRoutes);
router.use("/questions", questionRoutes);
router.use("/options", optionRoutes);
router.use("/attempts", quizAttemptRoutes);
router.use("/distractors", distractorRoutes);

export default router;
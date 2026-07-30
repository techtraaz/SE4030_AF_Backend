import express from "express";
import { castVote } from "../../controller/forum/voteController.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, castVote);

export default router;
import express from "express";
import {
    createAnswer, getAnswersByPost,
    updateAnswer, deleteAnswer, acceptAnswer
} from "../../controller/forum/answerController.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true }); // access :postId

router.get("/", authenticate, getAnswersByPost);
router.post("/", authenticate, createAnswer);
router.patch("/:answerId", authenticate, updateAnswer);
router.delete("/:answerId", authenticate, deleteAnswer);
router.patch("/:answerId/accept", authenticate, acceptAnswer);

export default router;
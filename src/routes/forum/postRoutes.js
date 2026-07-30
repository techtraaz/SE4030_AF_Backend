import express from "express";
import {
    createPost, getPostsByForum, getPostById,
    updatePost, deletePost
} from "../../controller/forum/postController.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true }); // mergeParams to access :forumId

// All authenticated users
router.get(
    "/", 
    authenticate,
    getPostsByForum
);

router.get(
    "/:postId", 
    authenticate, 
    getPostById
);

router.post(
    "/", 
    authenticate, 
    createPost
);

router.patch(
    "/:postId", 
    authenticate, 
    updatePost
);

router.delete(
    "/:postId", 
    authenticate, 
    deletePost
);

export default router;
import * as postService from "../../service/forum/postService.js";

const createPost = async (req, res) => {
    try {
        const post = await postService.createPost(req.user._id, req.params.forumId, req.body);
        return res.created("Post created successfully", post);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        if (error.message.includes("banned") || error.message.includes("join")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

const getPostsByForum = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await postService.getPostsByForum(req.params.forumId, Number(page), Number(limit));
        return res.success("Posts fetched successfully", result);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        return res.error(error.message);
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await postService.getPostById(req.params.postId);
        return res.success("Post fetched successfully", post);
    } catch (error) {
        if (error.message === "Post not found") return res.notFound(error.message);
        return res.error(error.message);
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await postService.updatePost(req.user._id, req.params.postId, req.body);
        return res.success("Post updated successfully", post);
    } catch (error) {
        if (error.message === "Post not found") return res.notFound(error.message);
        if (error.message.startsWith("Unauthorized")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

const deletePost = async (req, res) => {
    try {
        await postService.deletePost(req.user._id, req.user.role, req.params.postId);
        return res.success("Post deleted successfully", null);
    } catch (error) {
        if (error.message === "Post not found") return res.notFound(error.message);
        if (error.message.startsWith("Unauthorized")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

export { createPost, getPostsByForum, getPostById, updatePost, deletePost };
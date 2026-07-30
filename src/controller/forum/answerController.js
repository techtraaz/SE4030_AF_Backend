import * as answerService from "../../service/forum/answerService.js";

const createAnswer = async (req, res) => {
    try {
        const answer = await answerService.createAnswer(req.user._id, req.params.postId, req.body.content);
        return res.created("Answer created successfully", answer);
    } catch (error) {
        if (error.message === "Post not found") return res.notFound(error.message);
        if (error.message.includes("banned") || error.message.includes("join")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

const getAnswersByPost = async (req, res) => {
    try {
        const answers = await answerService.getAnswersByPost(req.params.postId);
        return res.success("Answers fetched successfully", answers);
    } catch (error) {
        if (error.message === "Post not found") return res.notFound(error.message);
        return res.error(error.message);
    }
};

const updateAnswer = async (req, res) => {
    try {
        const answer = await answerService.updateAnswer(req.user._id, req.params.answerId, req.body.content);
        return res.success("Answer updated successfully", answer);
    } catch (error) {
        if (error.message === "Answer not found") return res.notFound(error.message);
        if (error.message.startsWith("Unauthorized")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

const deleteAnswer = async (req, res) => {
    try {
        await answerService.deleteAnswer(req.user._id, req.user.role, req.params.answerId);
        return res.success("Answer deleted successfully", null);
    } catch (error) {
        if (error.message === "Answer not found") return res.notFound(error.message);
        if (error.message.startsWith("Unauthorized")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

const acceptAnswer = async (req, res) => {
    try {
        const answer = await answerService.acceptAnswer(req.user._id, req.params.answerId);
        return res.success("Answer accepted successfully", answer);
    } catch (error) {
        if (error.message === "Answer not found" || error.message === "Post not found") return res.notFound(error.message);
        if (error.message.startsWith("Only")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

export { createAnswer, getAnswersByPost, updateAnswer, deleteAnswer, acceptAnswer };
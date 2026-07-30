import * as quizService from "../../service/quiz/quizService.js";

const createQuiz = async (req, res) => {
    try {
        const quiz = await quizService.createQuiz(req.body);
        return res.created("Quiz created successfully", quiz);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getAllQuizzes = async (req, res) => {
    try {
        const filters = {
            courseId: req.query.courseId,
            lessonId: req.query.lessonId,
            isPublished: req.query.isPublished
        };
        const quizzes = await quizService.getAllQuizzes(filters);
        return res.success("Quizzes retrieved successfully", quizzes);
    } catch (error) {
        return res.error(error.message);
    }
};

const getQuizById = async (req, res) => {
    try {
        const quiz = await quizService.getQuizById(req.params.id);
        return res.success("Quiz retrieved successfully", quiz);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const updateQuiz = async (req, res) => {
    try {
        const quiz = await quizService.updateQuiz(req.params.id, req.body);
        return res.success("Quiz updated successfully", quiz);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const deleteQuiz = async (req, res) => {
    try {
        await quizService.deleteQuiz(req.params.id);
        return res.success("Quiz deleted successfully");
    } catch (error) {
        return res.notFound(error.message);
    }
};

const publishQuiz = async (req, res) => {
    try {
        const quiz = await quizService.publishQuiz(req.params.id);
        return res.success("Quiz published successfully", quiz);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const unpublishQuiz = async (req, res) => {
    try {
        const quiz = await quizService.unpublishQuiz(req.params.id);
        return res.success("Quiz unpublished successfully", quiz);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    publishQuiz,
    unpublishQuiz
};
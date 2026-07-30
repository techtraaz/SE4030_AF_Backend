import * as questionService from "../../service/quiz/questionService.js";

const createQuestion = async (req, res) => {
    try {
        const { options, ...questionData } = req.body;
        
        if (options && options.length > 0) {
            const result = await questionService.createQuestionWithOptions(questionData, options);
            return res.created("Question created with options successfully", result);
        } else {
            const question = await questionService.createQuestion(questionData);
            return res.created("Question created successfully", question);
        }
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getAllQuestionsByQuiz = async (req, res) => {
    try {
        const questions = await questionService.getAllQuestionsByQuiz(req.params.quizId);
        return res.success("Questions retrieved successfully", questions);
    } catch (error) {
        return res.error(error.message);
    }
};

const getQuestionById = async (req, res) => {
    try {
        const result = await questionService.getQuestionWithOptions(req.params.id);
        return res.success("Question retrieved successfully", result);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const updateQuestion = async (req, res) => {
    try {
        const question = await questionService.updateQuestion(req.params.id, req.body);
        return res.success("Question updated successfully", question);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const deleteQuestion = async (req, res) => {
    try {
        await questionService.deleteQuestion(req.params.id);
        return res.success("Question deleted successfully");
    } catch (error) {
        return res.notFound(error.message);
    }
};

const reorderQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { questionOrders } = req.body; // [{ questionId, order }, ...]
        
        const questions = await questionService.reorderQuestions(quizId, questionOrders);
        return res.success("Questions reordered successfully", questions);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export {
    createQuestion,
    getAllQuestionsByQuiz,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    reorderQuestions
};
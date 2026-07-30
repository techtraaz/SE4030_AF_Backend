import * as quizAttemptService from "../../service/quiz/quizAttemptService.js";

const submitQuizAttempt = async (req, res) => {
    try {
        const attempt = await quizAttemptService.submitQuizAttempt(req.body);
        return res.created("Quiz attempt submitted successfully", attempt);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getAttemptById = async (req, res) => {
    try {
        const result = await quizAttemptService.getAttemptWithResponses(req.params.id);
        return res.success("Attempt retrieved successfully", result);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const getUserQuizAttempts = async (req, res) => {
    try {
        const { refugeeId } = req.params;
        const { quizId } = req.query;
        
        // Validate that the refugeeId matches the authenticated user's ID
        if (req.user._id.toString() !== refugeeId) {
            return res.forbidden("You can only view your own quiz attempts");
        }
        
        const attempts = await quizAttemptService.getUserQuizAttempts(refugeeId, quizId);
        return res.success("User attempts retrieved successfully", attempts);
    } catch (error) {
        return res.error(error.message);
    }
};

const getQuizStatistics = async (req, res) => {
    try {
        const statistics = await quizAttemptService.getQuizStatistics(req.params.quizId);
        return res.success("Quiz statistics retrieved successfully", statistics);
    } catch (error) {
        return res.error(error.message);
    }
};

export {
    submitQuizAttempt,
    getAttemptById,
    getUserQuizAttempts,
    getQuizStatistics
};
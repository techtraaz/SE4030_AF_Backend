import QuizAttempt from "../../models/quiz/QuizAttempt.js";
import QuizResponse from "../../models/quiz/QuizResponse.js";
import Quiz from "../../models/quiz/Quiz.js";
import Question from "../../models/quiz/Question.js";
import Option from "../../models/quiz/Option.js";

const submitQuizAttempt = async (attemptData) => {
    const { refugeeId, quizId, responses, timeTakenSeconds } = attemptData;

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
        throw new Error("Quiz not found");
    }

    if (!quiz.isPublished) {
        throw new Error("Cannot attempt unpublished quiz");
    }

    // Check max attempts per user
    if (quiz.maxAttempts) {
        const previousAttempts = await QuizAttempt.countDocuments({
            refugeeId,
            quizId
        });

        if (previousAttempts >= quiz.maxAttempts) {
            throw new Error(`Maximum attempts (${quiz.maxAttempts}) reached for this quiz`);
        }
    }

    // Validate time limit
    if (quiz.timeLimit && timeTakenSeconds) {
        const timeLimitSeconds = quiz.timeLimit * 60;
        if (timeTakenSeconds > timeLimitSeconds) {
            throw new Error(`Time limit exceeded. Maximum time allowed: ${quiz.timeLimit} minutes`);
        }
    }

    // Get all questions for this quiz
    const questions = await Question.find({ quizId });
    const totalQuestions = questions.length;

    // Validate all questions answered
    if (responses.length < totalQuestions) {
        throw new Error(`All questions must be answered. Expected: ${totalQuestions}, Received: ${responses.length}`);
    }

    // Validate no duplicate question responses
    const questionIds = responses.map(r => r.questionId);
    const uniqueQuestionIds = new Set(questionIds);
    if (questionIds.length !== uniqueQuestionIds.size) {
        throw new Error("Duplicate responses for the same question are not allowed");
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    // Score the attempt
    let correctAnswers = 0;
    let earnedPoints = 0;
    const responseRecords = [];

    for (const response of responses) {
        const question = questions.find(q => q._id.toString() === response.questionId);
        if (!question) {
            throw new Error(`Question ${response.questionId} not found in this quiz`);
        }

        let isCorrect = false;

        // Validate response format matches question type
        if (question.type === 'multiple_select') {
            if (!response.selectedOptionIds || response.selectedOptionIds.length === 0) {
                throw new Error(`Question ${response.questionId} requires multiple selections`);
            }

            // For multiple select, check if all selected options are correct
            const correctOptions = await Option.find({
                questionId: question._id,
                isCorrect: true
            });
            const correctOptionIds = correctOptions.map(o => o._id.toString()).sort();
            const selectedIds = (response.selectedOptionIds || [])
                .map(id => id.toString())
                .sort();

            isCorrect = JSON.stringify(correctOptionIds) === JSON.stringify(selectedIds);
        } else {
            // For single select questions
            if (!response.selectedOptionId) {
                throw new Error(`Question ${response.questionId} requires a single selection`);
            }

            const selectedOption = await Option.findById(response.selectedOptionId);
            if (!selectedOption) {
                throw new Error(`Selected option ${response.selectedOptionId} not found`);
            }

            // Validate option belongs to the question
            if (selectedOption.questionId.toString() !== question._id.toString()) {
                throw new Error(`Option ${response.selectedOptionId} does not belong to question ${response.questionId}`);
            }

            isCorrect = selectedOption.isCorrect || false;
        }

        if (isCorrect) {
            correctAnswers++;
            earnedPoints += question.points;
        }

        responseRecords.push({
            questionId: response.questionId,
            selectedOptionId: response.selectedOptionId,
            selectedOptionIds: response.selectedOptionIds,
            isCorrect
        });
    }

    // Calculate score percentage
    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= quiz.passingScore;

    // Create attempt record
    const attempt = await QuizAttempt.create({
        refugeeId,
        quizId,
        score,
        totalQuestions,
        correctAnswers,
        passed,
        timeTakenSeconds
    });

    // Create response records
    await QuizResponse.insertMany(
        responseRecords.map(r => ({
            ...r,
            attemptId: attempt._id
        }))
    );

    return attempt;
};

const getAttemptById = async (attemptId) => {
    const attempt = await QuizAttempt.findById(attemptId)
        .populate('refugeeId', 'email')
        .populate('quizId', 'title description passingScore');

    if (!attempt) {
        throw new Error("Attempt not found");
    }

    return attempt;
};

const getAttemptWithResponses = async (attemptId) => {
    const attempt = await getAttemptById(attemptId);
    const responses = await QuizResponse.find({ attemptId })
        .populate('questionId', 'questionText type explanation points')
        .populate('selectedOptionId', 'optionText isCorrect')
        .populate('selectedOptionIds', 'optionText isCorrect');

    return { attempt, responses };
};

const getUserQuizAttempts = async (refugeeId, quizId = null) => {
    const query = { refugeeId };
    if (quizId) query.quizId = quizId;

    const attempts = await QuizAttempt.find(query)
        .sort({ attemptedAt: -1 })
        .populate('quizId', 'title passingScore');

    return attempts;
};

const getQuizStatistics = async (quizId) => {
    const attempts = await QuizAttempt.find({ quizId });

    if (attempts.length === 0) {
        return {
            totalAttempts: 0,
            averageScore: 0,
            passRate: 0,
            highestScore: 0,
            lowestScore: 0
        };
    }

    const scores = attempts.map(a => a.score);
    const passedCount = attempts.filter(a => a.passed).length;

    return {
        totalAttempts: attempts.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        passRate: Math.round((passedCount / attempts.length) * 100),
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores)
    };
};

export {
    submitQuizAttempt,
    getAttemptById,
    getAttemptWithResponses,
    getUserQuizAttempts,
    getQuizStatistics
};
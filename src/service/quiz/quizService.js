import Quiz from "../../models/quiz/Quiz.js";
import Question from "../../models/quiz/Question.js";
import Option from "../../models/quiz/Option.js";
import QuizAttempt from "../../models/quiz/QuizAttempt.js";

const createQuiz = async (quizData) => {
    // Validate that courseId or lessonId is provided
    if (!quizData.courseId && !quizData.lessonId) {
        throw new Error("Quiz must belong to either a course or a lesson");
    }

    // Validate passingScore
    if (quizData.passingScore < 0 || quizData.passingScore > 100) {
        throw new Error("Passing score must be between 0 and 100");
    }

    // Validate timeLimit
    if (quizData.timeLimit && quizData.timeLimit <= 0) {
        throw new Error("Time limit must be greater than 0");
    }

    // Validate maxAttempts
    if (quizData.maxAttempts && quizData.maxAttempts <= 0) {
        throw new Error("Max attempts must be greater than 0");
    }

    const quiz = await Quiz.create(quizData);
    return quiz;
};

const getAllQuizzes = async (filters = {}) => {
    const query = {};
    
    if (filters.courseId) query.courseId = filters.courseId;
    if (filters.lessonId) query.lessonId = filters.lessonId;
    if (filters.isPublished !== undefined) query.isPublished = filters.isPublished;

    const quizzes = await Quiz.find(query)
        .sort({ createdAt: -1 })
        .populate('courseId', 'title')
        .populate('lessonId', 'title');
    
    return quizzes;
};

const getQuizById = async (quizId) => {
    const quiz = await Quiz.findById(quizId)
        .populate('courseId', 'title description')
        .populate('lessonId', 'title description');
    
    if (!quiz) {
        throw new Error("Quiz not found");
    }
    
    return quiz;
};

const updateQuiz = async (quizId, updateData) => {
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
        throw new Error("Quiz not found");
    }

    // Prevent updating published quiz
    if (quiz.isPublished) {
        throw new Error("Cannot update a published quiz. Unpublish it first.");
    }

    // Prevent changing courseId/lessonId after creation
    delete updateData.courseId;
    delete updateData.lessonId;
    
    // Prevent manual update of totalLessons and totalEnrollments
    delete updateData.totalLessons;
    delete updateData.totalEnrollments;

    // Validate passingScore if provided
    if (updateData.passingScore !== undefined && 
        (updateData.passingScore < 0 || updateData.passingScore > 100)) {
        throw new Error("Passing score must be between 0 and 100");
    }

    // Validate timeLimit if provided
    if (updateData.timeLimit !== undefined && updateData.timeLimit <= 0) {
        throw new Error("Time limit must be greater than 0");
    }

    // Validate maxAttempts if provided
    if (updateData.maxAttempts !== undefined && updateData.maxAttempts <= 0) {
        throw new Error("Max attempts must be greater than 0");
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
        quizId,
        updateData,
        { new: true, runValidators: true }
    );

    return updatedQuiz;
};

const deleteQuiz = async (quizId) => {
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
        throw new Error("Quiz not found");
    }

    // Prevent deleting published quiz
    if (quiz.isPublished) {
        throw new Error("Cannot delete a published quiz. Unpublish it first.");
    }
    
    // Check if quiz has attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId });
    if (attemptCount > 0) {
        throw new Error("Cannot delete quiz with existing attempts");
    }

    await Quiz.findByIdAndDelete(quizId);

    // Delete associated questions and options
    const questions = await Question.find({ quizId });
    const questionIds = questions.map(q => q._id);
    
    await Option.deleteMany({ questionId: { $in: questionIds } });
    await Question.deleteMany({ quizId });

    return quiz;
};

const publishQuiz = async (quizId) => {
    // Validate quiz has questions before publishing
    const questionCount = await Question.countDocuments({ quizId });
    
    if (questionCount === 0) {
        throw new Error("Cannot publish quiz without questions");
    }

    const quiz = await Quiz.findByIdAndUpdate(
        quizId,
        { isPublished: true },
        { new: true }
    );

    if (!quiz) {
        throw new Error("Quiz not found");
    }

    return quiz;
};

const unpublishQuiz = async (quizId) => {
    const quiz = await Quiz.findByIdAndUpdate(
        quizId,
        { isPublished: false },
        { new: true }
    );

    if (!quiz) {
        throw new Error("Quiz not found");
    }

    return quiz;
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
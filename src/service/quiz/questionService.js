import Question from "../../models/quiz/Question.js";
import Option from "../../models/quiz/Option.js";
import Quiz from "../../models/quiz/Quiz.js";

const createQuestion = async (questionData) => {
    // Verify quiz exists and is not published
    const quiz = await Quiz.findById(questionData.quizId);
    if (!quiz) {
        throw new Error("Quiz not found");
    }

    // Prevent adding questions to published quiz
    if (quiz.isPublished) {
        throw new Error("Cannot add questions to a published quiz. Unpublish it first.");
    }

    // Validate points
    if (questionData.points <= 0) {
        throw new Error("Points must be greater than 0");
    }

    // Validate questionText is not empty
    if (!questionData.questionText || questionData.questionText.trim() === '') {
        throw new Error("Question text cannot be empty");
    }

    // Auto-assign order if not provided
    if (!questionData.order) {
        const maxOrder = await Question.findOne({ quizId: questionData.quizId })
            .sort({ order: -1 })
            .select('order');
        questionData.order = maxOrder ? maxOrder.order + 1 : 1;
    } else {
        // Check for duplicate order
        const existingQuestion = await Question.findOne({
            quizId: questionData.quizId,
            order: questionData.order,
        });
        if (existingQuestion) {
            throw new Error(`Question with order ${questionData.order} already exists in this quiz`);
        }
    }

    const question = await Question.create(questionData);
    return question;
};

const createQuestionWithOptions = async (questionData, optionsData) => {
    // Validate options based on question type
    if (questionData.type === 'true_false' && optionsData.length !== 2) {
        throw new Error("True/False questions must have exactly 2 options");
    }

    if (questionData.type === 'multiple_choice' && optionsData.length < 2) {
        throw new Error("Multiple choice questions must have at least 2 options");
    }

    if (questionData.type === 'multiple_select' && optionsData.length < 2) {
        throw new Error("Multiple select questions must have at least 2 options");
    }

    // Create question first
    const question = await createQuestion(questionData);

    // Check for duplicate option texts
    const optionTexts = optionsData.map(opt => opt.optionText.trim().toLowerCase());
    const uniqueTexts = new Set(optionTexts);
    if (optionTexts.length !== uniqueTexts.size) {
        await Question.findByIdAndDelete(question._id);
        throw new Error("Duplicate option texts are not allowed");
    }

    // Create options
    const options = await Option.insertMany(
        optionsData.map(opt => ({
            ...opt,
            questionId: question._id
        }))
    );

    // Validate correct answers based on question type
    const correctCount = options.filter(opt => opt.isCorrect).length;

    if (questionData.type === 'true_false' && correctCount !== 1) {
        await Question.findByIdAndDelete(question._id);
        await Option.deleteMany({ questionId: question._id });
        throw new Error("True/False questions must have exactly 1 correct answer");
    }

    if (questionData.type === 'multiple_choice' && correctCount !== 1) {
        await Question.findByIdAndDelete(question._id);
        await Option.deleteMany({ questionId: question._id });
        throw new Error("Multiple choice questions must have exactly 1 correct answer");
    }

    if (questionData.type === 'multiple_select' && correctCount < 2) {
        await Question.findByIdAndDelete(question._id);
        await Option.deleteMany({ questionId: question._id });
        throw new Error("Multiple select questions must have at least 2 correct answers");
    }

    if (questionData.type !== 'fill_blank' && correctCount === 0) {
        await Question.findByIdAndDelete(question._id);
        await Option.deleteMany({ questionId: question._id });
        throw new Error("At least one option must be marked as correct");
    }

    return { question, options };
};

const getAllQuestionsByQuiz = async (quizId) => {
    const questions = await Question.find({ quizId })
        .sort({ order: 1 })
        .populate('quizId', 'title');
    
    return questions;
};

const getQuestionById = async (questionId) => {
    const question = await Question.findById(questionId)
        .populate('quizId', 'title');
    
    if (!question) {
        throw new Error("Question not found");
    }
    
    return question;
};

const getQuestionWithOptions = async (questionId) => {
    const question = await getQuestionById(questionId);
    const options = await Option.find({ questionId });
    
    return { question, options };
};

const updateQuestion = async (questionId, updateData) => {
    const question = await Question.findById(questionId);
    
    if (!question) {
        throw new Error("Question not found");
    }

    // Check if quiz is published
    const quiz = await Quiz.findById(question.quizId);
    if (quiz && quiz.isPublished) {
        throw new Error("Cannot update questions in a published quiz. Unpublish it first.");
    }

    // Prevent changing quizId
    delete updateData.quizId;

    // Validate points if provided
    if (updateData.points !== undefined && updateData.points <= 0) {
        throw new Error("Points must be greater than 0");
    }

    // Validate questionText if provided
    if (updateData.questionText !== undefined && updateData.questionText.trim() === '') {
        throw new Error("Question text cannot be empty");
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        updateData,
        { new: true, runValidators: true }
    );

    return updatedQuestion;
};

const deleteQuestion = async (questionId) => {
    const question = await Question.findById(questionId);
    
    if (!question) {
        throw new Error("Question not found");
    }

    // Check if quiz is published
    const quiz = await Quiz.findById(question.quizId);
    if (quiz && quiz.isPublished) {
        throw new Error("Cannot delete questions from a published quiz. Unpublish it first.");
    }

    await Question.findByIdAndDelete(questionId);

    // Delete associated options
    await Option.deleteMany({ questionId });

    return question;
};

const reorderQuestions = async (quizId, questionOrders) => {
    // questionOrders: [{ questionId, order }, ...]
    const bulkOps = questionOrders.map(({ questionId, order }) => ({
        updateOne: {
            filter: { _id: questionId, quizId },
            update: { order }
        }
    }));

    await Question.bulkWrite(bulkOps);

    const questions = await Question.find({ quizId }).sort({ order: 1 });
    return questions;
};

export {
    createQuestion,
    createQuestionWithOptions,
    getAllQuestionsByQuiz,
    getQuestionById,
    getQuestionWithOptions,
    updateQuestion,
    deleteQuestion,
    reorderQuestions
};
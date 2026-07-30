import Option from "../../models/quiz/Option.js";
import Question from "../../models/quiz/Question.js";
import Quiz from "../../models/quiz/Quiz.js";

const createOption = async (optionData) => {
    // Verify question exists
    const question = await Question.findById(optionData.questionId);
    if (!question) {
        throw new Error("Question not found");
    }

    // Check if quiz is published
    const quiz = await Quiz.findById(question.quizId);
    if (quiz && quiz.isPublished) {
        throw new Error("Cannot add options to questions in a published quiz");
    }

    // Validate optionText is not empty
    if (!optionData.optionText || optionData.optionText.trim() === '') {
        throw new Error("Option text cannot be empty");
    }

    // Check for duplicate option text
    const existingOption = await Option.findOne({
        questionId: optionData.questionId,
        optionText: optionData.optionText.trim()
    });
    if (existingOption) {
        throw new Error("Option with this text already exists for this question");
    }

    // For true_false, limit to 2 options
    if (question.type ===  'true_false') {
        const optionCount = await Option.countDocuments({ questionId: question._id });
        if (optionCount >= 2) {
            throw new Error("True/False questions can only have 2 options");
        }
    }

    const option = await Option.create(optionData);
    return option;
};

const getOptionsByQuestion = async (questionId) => {
    const options = await Option.find({ questionId });
    return options;
};

const updateOption = async (optionId, updateData) => {
    // Prevent changing questionId
    delete updateData.questionId;

    const option = await Option.findById(optionId);
    if (!option) {
        throw new Error("Option not found");
    }

    // Get question to check quiz publish status
    const question = await Question.findById(option.questionId);
    if (!question) {
        throw new Error("Associated question not found");
    }

    // Check if quiz is published
    const quiz = await Quiz.findById(question.quizId);
    if (quiz && quiz.isPublished) {
        throw new Error("Cannot update options in a published quiz. Unpublish it first.");
    }

    const updatedOption = await Option.findByIdAndUpdate(
        optionId,
        updateData,
        { new: true, runValidators: true }
    );

    return updatedOption;
};

const deleteOption = async (optionId) => {
    const option = await Option.findById(optionId);
    
    if (!option) {
        throw new Error("Option not found");
    }

    // Get question to check quiz publish status
    const question = await Question.findById(option.questionId);
    if (!question) {
        throw new Error("Associated question not found");
    }

    // Check if quiz is published
    const quiz = await Quiz.findById(question.quizId);
    if (quiz && quiz.isPublished) {
        throw new Error("Cannot delete options from questions in a published quiz");
    }

    // Prevent deleting the last correct option
    if (option.isCorrect) {
        const correctOptionsCount = await Option.countDocuments({
            questionId: option.questionId,
            isCorrect: true
        });
        
        if (correctOptionsCount === 1) {
            throw new Error("Cannot delete the last correct option. Add another correct option first.");
        }
    }

    await Option.findByIdAndDelete(optionId);

    return option;
};

export {
    createOption,
    getOptionsByQuestion,
    updateOption,
    deleteOption
};
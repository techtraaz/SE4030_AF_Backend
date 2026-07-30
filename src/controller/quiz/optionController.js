import * as optionService from "../../service/quiz/optionService.js";

const createOption = async (req, res) => {
    try {
        const option = await optionService.createOption(req.body);
        return res.created("Option created successfully", option);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getOptionsByQuestion = async (req, res) => {
    try {
        const options = await optionService.getOptionsByQuestion(req.params.questionId);
        return res.success("Options retrieved successfully", options);
    } catch (error) {
        return res.error(error.message);
    }
};

const updateOption = async (req, res) => {
    try {
        const option = await optionService.updateOption(req.params.id, req.body);
        return res.success("Option updated successfully", option);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const deleteOption = async (req, res) => {
    try {
        await optionService.deleteOption(req.params.id);
        return res.success("Option deleted successfully");
    } catch (error) {
        return res.notFound(error.message);
    }
};

export {
    createOption,
    getOptionsByQuestion,
    updateOption,
    deleteOption
};
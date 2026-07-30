
import * as vocabularyService from "../../service/lesson/vocabularyService.js";

export const createVocabulary = async (req, res) => {
    try {
        const vocabulary = await vocabularyService.createVocabulary(req.params.lessonId, req.body);
        return res.created("Vocabulary section created successfully", vocabulary);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export const getVocabulary = async (req, res) => {
    try {
        const vocabulary = await vocabularyService.getVocabulary(req.params.lessonId);
        return res.success("Vocabulary section fetched successfully", vocabulary);
    } catch (error) {
        return res.notFound(error.message);
    }
};

export const updateVocabulary = async (req, res) => {
    try {
        const vocabulary = await vocabularyService.updateVocabulary(req.params.lessonId, req.body);
        return res.success("Vocabulary section updated successfully", vocabulary);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export const deleteVocabulary = async (req, res) => {
    try {
        await vocabularyService.deleteVocabulary(req.params.lessonId);
        return res.success("Vocabulary section deleted successfully", null);
    } catch (error) {
        return res.notFound(error.message);
    }
};
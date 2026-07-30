
import * as listeningService from "../../service/lesson/listeningService.js"

export const createListening = async (req, res) => {
    try {
        const listening = await listeningService.createListening(req.params.lessonId, req.body);
        return res.created("Listening section created successfully", listening);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export const getListening = async (req, res) => {
    try {
        const listening = await listeningService.getListening(req.params.lessonId);
        return res.success("Listening section fetched successfully", listening);
    } catch (error) {
        return res.notFound(error.message);
    }
};

export const updateListening = async (req, res) => {
    try {
        const listening = await listeningService.updateListening(req.params.lessonId, req.body);
        return res.success("Listening section updated successfully", listening);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export const deleteListening = async (req, res) => {
    try {
        await listeningService.deleteListening(req.params.lessonId);
        return res.success("Listening section deleted successfully", null);
    } catch (error) {
        return res.notFound(error.message);
    }
};

export { }
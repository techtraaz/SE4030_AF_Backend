
import * as readingService from "../../service/lesson/readingService.js";

const createReading = async (req, res) => {
    try {
        const reading = await readingService.createReading(req.params.lessonId, req.body);
        return res.created("Reading section created successfully", reading);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getReading = async (req, res) => {
    try {
        const reading = await readingService.getReading(req.params.lessonId);
        return res.success("Reading section fetched successfully", reading);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const updateReading = async (req, res) => {
    try {
        const reading = await readingService.updateReading(req.params.lessonId, req.body);
        return res.success("Reading section updated successfully", reading);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const deleteReading = async (req, res) => {
    try {
        await readingService.deleteReading(req.params.lessonId);
        return res.success("Reading section deleted successfully", null);
    } catch (error) {
        return res.notFound(error.message);
    }
};

export { createReading , getReading , updateReading , deleteReading }
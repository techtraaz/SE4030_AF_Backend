
import * as videoService from "../../service/lesson/videoService.js";

export const createVideo = async (req, res) => {
    try {
        const video = await videoService.createVideo(req.params.lessonId, req.body);
        return res.created("Video section created successfully", video);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export const getVideo = async (req, res) => {
    try {
        const video = await videoService.getVideo(req.params.lessonId);
        return res.success("Video section fetched successfully", video);
    } catch (error) {
        return res.notFound(error.message);
    }
};

export const updateVideo = async (req, res) => {
    try {
        const video = await videoService.updateVideo(req.params.lessonId, req.body);
        return res.success("Video section updated successfully", video);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export const deleteVideo = async (req, res) => {
    try {
        await videoService.deleteVideo(req.params.lessonId);
        return res.success("Video section deleted successfully", null);
    } catch (error) {
        return res.notFound(error.message);
    }
};
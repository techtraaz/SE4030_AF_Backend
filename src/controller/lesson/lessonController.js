
import * as lessonService from "../../service/lesson/lessonService.js";

const createLesson = async (req, res) => {
    try {
        const lesson = await lessonService.createLesson(req.body);
        return res.created("Lesson created successfully", lesson);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getAllLessons = async (req, res) => {
    try {
        const lessons = await lessonService.getAllLessons(req.query.categoryId, req.query.courseId);
        return res.success("Lessons fetched successfully", lessons);
    } catch (error) {
        return res.error(error.message);
    }
};

const getLessonById = async (req, res) => {
    try {
        const lesson = await lessonService.getLessonById(req.params.id);
        return res.success("Lesson fetched successfully", lesson);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const updateLesson = async (req, res) => {
    try {
        const lesson = await lessonService.updateLesson(req.params.id, req.body);
        return res.success("Lesson updated successfully", lesson);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const deleteLesson = async (req, res) => {
    try {
        await lessonService.deleteLesson(req.params.id);
        return res.success("Lesson deleted successfully", null);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const publishLesson = async (req, res) => {
    try {
        const lesson = await lessonService.publishLesson(req.params.id);
        return res.success("Lesson published successfully", lesson);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const unpublishLesson = async (req, res) => {
    try {
        const lesson = await lessonService.unpublishLesson(req.params.id);
        return res.success("Lesson unpublished successfully", lesson);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

export { createLesson , getAllLessons , getLessonById , updateLesson , deleteLesson , publishLesson, unpublishLesson }
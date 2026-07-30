import * as lessonProgressService from "../../service/lesson/lessonProgressService.js";

const markLessonComplete = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const refugeeId = req.user.userId || req.user._id;
        
        const enrollment = await lessonProgressService.markLessonComplete(refugeeId, lessonId);
        return res.success("Lesson marked as complete", enrollment);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const markLessonIncomplete = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const refugeeId = req.user.userId || req.user._id;
        
        const enrollment = await lessonProgressService.markLessonIncomplete(refugeeId, lessonId);
        return res.success("Lesson marked as incomplete", enrollment);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getLessonProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const refugeeId = req.user.userId || req.user._id;
        
        const progress = await lessonProgressService.getLessonProgress(refugeeId, courseId);
        return res.success("Lesson progress retrieved successfully", progress);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const getAllLessonProgress = async (req, res) => {
    try {
        const refugeeId = req.user.userId || req.user._id;
        
        const progressData = await lessonProgressService.getAllLessonProgress(refugeeId);
        return res.success("All lesson progress retrieved successfully", progressData);
    } catch (error) {
        return res.error(error.message);
    }
};

export {
    markLessonComplete,
    markLessonIncomplete,
    getLessonProgress,
    getAllLessonProgress
};

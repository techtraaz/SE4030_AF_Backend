import * as courseService from "../../service/course/courseService.js";

const createCourse = async (req, res) => {
    try {
        const course = await courseService.createCourse(req.body);
        return res.created("Course created successfully", course);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getAllCourses = async (req, res) => {
    try {
        const filters = {
            categoryId: req.query.categoryId,
            level: req.query.level,
            levelId: req.query.levelId,
            language: req.query.language,
            languageId: req.query.languageId,
            createdById: req.query.createdById,
            isPublished: req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined
        };
        
        // Security: Restrict unpublished course access based on user role
        const shouldForcePublished = !req.user || 
                                    req.user.role === 'REFUGEE' || 
                                    (req.user.role === 'CONTENT_CONTRIBUTOR' && !filters.createdById);
        
        if (shouldForcePublished) {
            filters.isPublished = true;
        }
        
        console.log(`[Courses API] User: ${req.user?.role || 'none'}, Forced published: ${shouldForcePublished}, Query: isPublished=${filters.isPublished}`);
        
        const courses = await courseService.getAllCourses(filters);
        return res.success("Courses retrieved successfully", courses);
    } catch (error) {
        return res.error(error.message);
    }
};

const getCourseById = async (req, res) => {
    try {
        const course = await courseService.getCourseById(req.params.id);
        
        // Restrict access to unpublished courses
        if (!course.isPublished) {
            const isOwner = req.user && course.createdById._id.toString() === req.user._id.toString();
            const isAdmin = req.user && req.user.role === 'ADMIN';
            
            if (!isOwner && !isAdmin) {
                return res.notFound("Course not found");
            }
        }
        
        return res.success("Course retrieved successfully", course);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const updateCourse = async (req, res) => {
    try {
        const course = await courseService.updateCourse(req.params.id, req.body);
        return res.success("Course updated successfully", course);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const deleteCourse = async (req, res) => {
    try {
        await courseService.deleteCourse(req.params.id);
        return res.success("Course deleted successfully");
    } catch (error) {
        return res.notFound(error.message);
    }
};

const publishCourse = async (req, res) => {
    try {
        const course = await courseService.publishCourse(req.params.id);
        return res.success("Course published successfully", course);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const unpublishCourse = async (req, res) => {
    try {
        const course = await courseService.unpublishCourse(req.params.id);
        return res.success("Course unpublished successfully", course);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getCoursesByCreator = async (req, res) => {
    try {
        const isPublishedOnly = !req.user || 
                               req.user.role === 'REFUGEE' || 
                               (req.user.role === 'CONTENT_CONTRIBUTOR' && req.user._id.toString() !== req.params.creatorId);
        
        const courses = await courseService.getCoursesByCreator(req.params.creatorId, isPublishedOnly);
        return res.success("Courses retrieved successfully", courses);
    } catch (error) {
        return res.error(error.message);
    }
};

const getCourseStatistics = async (req, res) => {
    try {
        const statistics = await courseService.getCourseStatistics(req.params.id);
        return res.success("Course statistics retrieved successfully", statistics);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const getGlobalCourseStatistics = async (req, res) => {
    try {
        const statistics = await courseService.getGlobalCourseStatistics();
        return res.success("Global course statistics retrieved successfully", statistics);
    } catch (error) {
        return res.error(error.message);
    }
};

export {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    getCoursesByCreator,
    getCourseStatistics,
    getGlobalCourseStatistics
};
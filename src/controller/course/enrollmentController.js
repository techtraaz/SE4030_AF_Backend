import * as enrollmentService from "../../service/course/enrollmentService.js";

const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const refugeeId = req.user.userId || req.user._id;
        
        const enrollment = await enrollmentService.enrollInCourse(refugeeId, courseId);
        return res.created("Successfully enrolled in course", enrollment);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const unenrollFromCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const refugeeId = req.user.userId || req.user._id;
        
        await enrollmentService.unenrollFromCourse(refugeeId, courseId);
        return res.success("Successfully unenrolled from course");
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const getMyEnrollments = async (req, res) => {
    try {
        const refugeeId = req.user.userId || req.user._id;
        const { status } = req.query;
        
        const enrollments = await enrollmentService.getRefugeeEnrollments(refugeeId, status);
        return res.success("Enrollments retrieved successfully", enrollments);
    } catch (error) {
        return res.error(error.message);
    }
};

const getEnrollmentDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const refugeeId = req.user.userId || req.user._id;
        
        const enrollment = await enrollmentService.getEnrollmentDetails(refugeeId, courseId);
        return res.success("Enrollment details retrieved successfully", enrollment);
    } catch (error) {
        return res.notFound(error.message);
    }
};

const updateEnrollmentProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const refugeeId = req.user.userId || req.user._id;
        
        const enrollment = await enrollmentService.updateEnrollmentProgress(refugeeId, courseId, req.body);
        return res.success("Progress updated successfully", enrollment);
    } catch (error) {
        return res.badRequest(error.message);
    }
};

const checkEnrollmentStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const refugeeId = req.user.userId || req.user._id;
        
        const isEnrolled = await enrollmentService.isEnrolled(refugeeId, courseId);
        return res.success("Enrollment status retrieved", { isEnrolled });
    } catch (error) {
        return res.error(error.message);
    }
};

const getMyEnrollmentStats = async (req, res) => {
    try {
        const refugeeId = req.user.userId || req.user._id;
        
        const stats = await enrollmentService.getRefugeeEnrollmentStats(refugeeId);
        return res.success("Enrollment statistics retrieved successfully", stats);
    } catch (error) {
        return res.error(error.message);
    }
};

export {
    enrollInCourse,
    unenrollFromCourse,
    getMyEnrollments,
    getEnrollmentDetails,
    updateEnrollmentProgress,
    checkEnrollmentStatus,
    getMyEnrollmentStats
};

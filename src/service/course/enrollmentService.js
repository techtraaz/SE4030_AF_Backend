import mongoose from "mongoose";
import Enrollment from "../../models/course/Enrollment.js";
import Course from "../../models/course/Course.js";
import User from "../../models/auth/user.js";
import { ROLES } from "../../utils/constants.js";
import * as courseService from "./courseService.js";

/**
 * Enroll a refugee in a course
 * @param {string} refugeeId - User ID of the refugee
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Enrollment object
 */
const enrollInCourse = async (refugeeId, courseId) => {
    // Validate IDs
    if (!/^[0-9a-fA-F]{24}$/.test(refugeeId)) {
        throw new Error("Invalid refugee ID format");
    }
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    // Validate refugee exists and has REFUGEE role
    const refugee = await User.findById(refugeeId);
    if (!refugee) {
        throw new Error("Refugee user not found");
    }
    if (refugee.role !== ROLES.REFUGEE) {
        throw new Error("Only refugees can enroll in courses");
    }

    // Validate course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }
    if (!course.isPublished) {
        throw new Error("Cannot enroll in unpublished courses");
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ refugeeId, courseId });
    if (existingEnrollment) {
        if (existingEnrollment.status === "DROPPED") {
            // Re-enroll if previously dropped
            existingEnrollment.status = "ACTIVE";
            existingEnrollment.enrolledAt = new Date();
            existingEnrollment.lastAccessedAt = new Date();
            await existingEnrollment.save();
            
            // Increment enrollment count
            await courseService.incrementTotalEnrollments(courseId);
            
            return existingEnrollment.populate([
                { path: "courseId", populate: [
                    { path: "categoryId", select: "name" },
                    { path: "levelId", select: "name displayOrder" },
                    { path: "languageId", select: "name code" }
                ]},
                { path: "refugeeId", select: "email" }
            ]);
        }
        throw new Error("Already enrolled in this course");
    }

    // Create enrollment
    const enrollment = new Enrollment({
        refugeeId,
        courseId,
        status: "ACTIVE"
    });

    await enrollment.save();

    // Increment course enrollment count
    await courseService.incrementTotalEnrollments(courseId);

    return enrollment.populate([
        { path: "courseId", populate: [
            { path: "categoryId", select: "name" },
            { path: "levelId", select: "name displayOrder" },
            { path: "languageId", select: "name code" }
        ]},
        { path: "refugeeId", select: "email" }
    ]);
};

/**
 * Unenroll (drop) from a course
 * @param {string} refugeeId - User ID of the refugee
 * @param {string} courseId - Course ID
 * @returns {Promise<void>}
 */
const unenrollFromCourse = async (refugeeId, courseId) => {
    // Validate IDs
    if (!/^[0-9a-fA-F]{24}$/.test(refugeeId)) {
        throw new Error("Invalid refugee ID format");
    }
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const enrollment = await Enrollment.findOne({ refugeeId, courseId, status: "ACTIVE" });
    if (!enrollment) {
        throw new Error("Active enrollment not found");
    }

    // Mark as dropped instead of deleting
    enrollment.status = "DROPPED";
    await enrollment.save();

    // Decrement course enrollment count
    await courseService.decrementTotalEnrollments(courseId);
};

/**
 * Get all enrollments for a refugee
 * @param {string} refugeeId - User ID of the refugee
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Array>} Array of enrollments
 */
const getRefugeeEnrollments = async (refugeeId, status = null) => {
    // Validate ID
    if (!/^[0-9a-fA-F]{24}$/.test(refugeeId)) {
        throw new Error("Invalid refugee ID format");
    }

    const query = { refugeeId };
    if (status) {
        query.status = status;
    }

    const enrollments = await Enrollment.find(query)
        .sort({ lastAccessedAt: -1 })
        .populate({
            path: "courseId",
            populate: [
                { path: "categoryId", select: "name slug" },
                { path: "levelId", select: "name displayOrder" },
                { path: "languageId", select: "name code nativeName" },
                { path: "createdById", select: "email" }
            ]
        });

    return enrollments;
};

/**
 * Get enrollment details
 * @param {string} refugeeId - User ID of the refugee
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Enrollment object
 */
const getEnrollmentDetails = async (refugeeId, courseId) => {
    // Validate IDs
    if (!/^[0-9a-fA-F]{24}$/.test(refugeeId)) {
        throw new Error("Invalid refugee ID format");
    }
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const enrollment = await Enrollment.findOne({ refugeeId, courseId })
        .populate({
            path: "courseId",
            populate: [
                { path: "categoryId", select: "name slug" },
                { path: "levelId", select: "name displayOrder" },
                { path: "languageId", select: "name code nativeName" }
            ]
        })
        .populate("completedLessons");

    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    return enrollment;
};

/**
 * Update enrollment progress
 * @param {string} refugeeId - User ID of the refugee
 * @param {string} courseId - Course ID
 * @param {Object} progressData - Progress update data
 * @returns {Promise<Object>} Updated enrollment
 */
const updateEnrollmentProgress = async (refugeeId, courseId, progressData) => {
    // Validate IDs
    if (!/^[0-9a-fA-F]{24}$/.test(refugeeId)) {
        throw new Error("Invalid refugee ID format");
    }
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const enrollment = await Enrollment.findOne({ refugeeId, courseId, status: "ACTIVE" });
    if (!enrollment) {
        throw new Error("Active enrollment not found");
    }

    // Update progress
    if (progressData.progress !== undefined) {
        enrollment.progress = Math.min(100, Math.max(0, progressData.progress));
    }

    // Update completed lessons
    if (progressData.completedLessonId) {
        if (!enrollment.completedLessons.includes(progressData.completedLessonId)) {
            enrollment.completedLessons.push(progressData.completedLessonId);
        }
    }

    // Update last accessed time
    enrollment.lastAccessedAt = new Date();

    // Mark as completed if progress is 100%
    if (enrollment.progress === 100 && enrollment.status !== "COMPLETED") {
        enrollment.status = "COMPLETED";
        enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return enrollment.populate({
        path: "courseId",
        populate: [
            { path: "categoryId", select: "name" },
            { path: "levelId", select: "name displayOrder" },
            { path: "languageId", select: "name code" }
        ]
    });
};

/**
 * Check if refugee is enrolled in a course
 * @param {string} refugeeId - User ID of the refugee
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} True if enrolled and active
 */
const isEnrolled = async (refugeeId, courseId) => {
    // Validate IDs
    if (!/^[0-9a-fA-F]{24}$/.test(refugeeId) || !/^[0-9a-fA-F]{24}$/.test(courseId)) {
        return false;
    }

    const enrollment = await Enrollment.findOne({ refugeeId, courseId, status: "ACTIVE" });
    return !!enrollment;
};

/**
 * Get enrollment statistics for a refugee
 * @param {string} refugeeId - User ID of the refugee
 * @returns {Promise<Object>} Statistics object
 */
const getRefugeeEnrollmentStats = async (refugeeId) => {
    // Validate ID
    if (!/^[0-9a-fA-F]{24}$/.test(refugeeId)) {
        throw new Error("Invalid refugee ID format");
    }

    const [active, completed, avgProgress] = await Promise.all([
        Enrollment.countDocuments({ refugeeId, status: "ACTIVE" }),
        Enrollment.countDocuments({ refugeeId, status: "COMPLETED" }),
        Enrollment.aggregate([
            { $match: { refugeeId: new mongoose.Types.ObjectId(refugeeId), status: "ACTIVE" } },
            { $group: { _id: null, avgProgress: { $avg: "$progress" } } }
        ])
    ]);

    return {
        totalActive: active,
        totalCompleted: completed,
        averageProgress: avgProgress[0]?.avgProgress || 0
    };
};

export {
    enrollInCourse,
    unenrollFromCourse,
    getRefugeeEnrollments,
    getEnrollmentDetails,
    updateEnrollmentProgress,
    isEnrolled,
    getRefugeeEnrollmentStats
};

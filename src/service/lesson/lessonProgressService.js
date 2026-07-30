import Enrollment from "../../models/course/Enrollment.js";
import Lesson from "../../models/lesson/lesson.js";
import Course from "../../models/course/Course.js";

/**
 * Mark a lesson as completed for a refugee
 * @param {string} refugeeId - User ID of the refugee
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Updated enrollment
 */
const markLessonComplete = async (refugeeId, lessonId) => {
    // Validate lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new Error("Lesson not found");
    }

    // Find enrollment for this course
    const enrollment = await Enrollment.findOne({
        refugeeId,
        courseId: lesson.courseId
    });

    if (!enrollment) {
        throw new Error("Not enrolled in this course");
    }

    // Check if already completed
    if (enrollment.completedLessons.includes(lessonId)) {
        return enrollment;
    }

    // Add to completed lessons
    enrollment.completedLessons.push(lessonId);
    enrollment.lastAccessedAt = new Date();

    // Calculate progress percentage
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

    // Mark course as completed if all lessons done
    if (enrollment.progress === 100 && enrollment.status === "ACTIVE") {
        enrollment.status = "COMPLETED";
        enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return enrollment.populate([
        { path: "courseId", select: "title description" },
        { path: "completedLessons", select: "title" }
    ]);
};

/**
 * Mark a lesson as incomplete (undo completion)
 * @param {string} refugeeId - User ID of the refugee
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} Updated enrollment
 */
const markLessonIncomplete = async (refugeeId, lessonId) => {
    // Validate lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
        throw new Error("Lesson not found");
    }

    // Find enrollment
    const enrollment = await Enrollment.findOne({
        refugeeId,
        courseId: lesson.courseId
    });

    if (!enrollment) {
        throw new Error("Not enrolled in this course");
    }

    // Remove from completed lessons
    enrollment.completedLessons = enrollment.completedLessons.filter(
        id => id.toString() !== lessonId
    );
    enrollment.lastAccessedAt = new Date();

    // Recalculate progress
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

    // If was completed, mark as active again
    if (enrollment.status === "COMPLETED") {
        enrollment.status = "ACTIVE";
        enrollment.completedAt = null;
    }

    await enrollment.save();

    return enrollment.populate([
        { path: "courseId", select: "title description" },
        { path: "completedLessons", select: "title" }
    ]);
};

/**
 * Get lesson completion status for a course
 * @param {string} refugeeId - User IDof the refugee
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Completion status
 */
const getLessonProgress = async (refugeeId, courseId) => {
    const enrollment = await Enrollment.findOne({
        refugeeId,
        courseId
    }).populate("completedLessons", "title _id");

    if (!enrollment) {
        throw new Error("Not enrolled in this course");
    }

    const totalLessons = await Lesson.countDocuments({ courseId });
    const completedCount = enrollment.completedLessons.length;

    return {
        totalLessons,
        completedCount,
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        status: enrollment.status
    };
};

/**
 * Get all lesson progress for a refugee across all courses
 * @param {string} refugeeId - User ID of the refugee
 * @returns {Promise<Array>} Array of progress data
 */
const getAllLessonProgress = async (refugeeId) => {
    const enrollments = await Enrollment.find({ refugeeId, status: { $ne: "DROPPED" } })
        .populate("courseId", "title")
        .populate("completedLessons", "title");

    const progressData = await Promise.all(
        enrollments.map(async (enrollment) => {
            const totalLessons = await Lesson.countDocuments({ 
                courseId: enrollment.courseId._id 
            });

            return {
                courseId: enrollment.courseId._id,
                courseTitle: enrollment.courseId.title,
                totalLessons,
                completedCount: enrollment.completedLessons.length,
                progress: enrollment.progress,
                status: enrollment.status,
                lastAccessedAt: enrollment.lastAccessedAt
            };
        })
    );

    return progressData;
};

export {
    markLessonComplete,
    markLessonIncomplete,
    getLessonProgress,
    getAllLessonProgress
};

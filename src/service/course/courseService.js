import Course from "../../models/course/Course.js";
import Category from "../../models/lesson/category.js";
import User from "../../models/auth/user.js";

const createCourse = async (courseData) => {
    // Validate required fields
    if (!courseData.title || courseData.title.trim() === '') {
        throw new Error("Course title is required and cannot be empty");
    }

    if (courseData.title.trim().length < 3) {
        throw new Error("Course title must be at least 3 characters long");
    }

    if (courseData.title.trim().length > 100) {
        throw new Error("Course title cannot exceed 100 characters");
    }

    if (!courseData.description || courseData.description.trim() === '') {
        throw new Error("Course description is required and cannot be empty");
    }

    if (courseData.description.trim().length < 10) {
        throw new Error("Course description must be at least 10 characters long");
    }

    // Support both new (levelId) and legacy (level) fields
    if (!courseData.levelId && !courseData.level) {
        throw new Error("Course level is required (provide levelId or level)");
    }

    // Validate legacy level if provided
    if (courseData.level && !['Beginner', 'Intermediate', 'Advanced'].includes(courseData.level)) {
        throw new Error("Course level must be Beginner, Intermediate, or Advanced");
    }

    if (!courseData.createdById) {
        throw new Error("Course creator (createdById) is required");
    }

    if (!courseData.categoryId) {
        throw new Error("Course category (categoryId) is required");
    }

    // Validate creator exists
    const creator = await User.findById(courseData.createdById);
    if (!creator) {
        throw new Error("Creator user not found");
    }

    // Validate creator has appropriate role
    if (!['ADMIN', 'CONTENT_CONTRIBUTOR'].includes(creator.role)) {
        throw new Error("Only ADMIN or CONTENT_CONTRIBUTOR can create courses");
    }

    // Validate category exists
    const category = await Category.findById(courseData.categoryId);
    if (!category) {
        throw new Error("Category not found");
    }

    // Validate languageId if provided (new field)
    if (courseData.languageId) {
        const Language = (await import('../../models/language.js')).default;
        const language = await Language.findById(courseData.languageId);
        if (!language || !language.isActive) {
            throw new Error("Invalid or inactive language selected");
        }
    }

    // Validate levelId if provided (new field)
    if (courseData.levelId) {
        const CourseLevel = (await import('../../models/courseLevel.js')).default;
        const level = await CourseLevel.findById(courseData.levelId);
        if (!level || !level.isActive) {
            throw new Error("Invalid or inactive course level selected");
        }
    }

    // Validate legacy language
    if (courseData.language && courseData.language !== 'English') {
        throw new Error("Currently only English language is supported for legacy field");
    }

    // Check for duplicate course title by same creator
    const existingCourse = await Course.findOne({
        title: { $regex: new RegExp(`^${courseData.title.trim()}$`, 'i') },
        createdById: courseData.createdById
    });

    if (existingCourse) {
        throw new Error("You already have a course with this title");
    }

    const course = await Course.create(courseData);
    
    // Populate the references before returning
    await course.populate([
        { path: 'createdById', select: 'email role' },
        { path: 'categoryId', select: 'name slug description' },
        { path: 'languageId', select: 'name code' },
        { path: 'levelId', select: 'name displayOrder' }
    ]);
    
    return course;
};

const getAllCourses = async (filters = {}) => {
    const query = {};
    
    if (filters.categoryId) {
        if (!/^[0-9a-fA-F]{24}$/.test(filters.categoryId)) {
            throw new Error("Invalid category ID format");
        }
        query.categoryId = filters.categoryId;
    }

    if (filters.levelId) {
        if (!/^[0-9a-fA-F]{24}$/.test(filters.levelId)) {
            throw new Error("Invalid level ID format");
        }
        query.levelId = filters.levelId;
    } else if (filters.level) {
        if (!['Beginner', 'Intermediate', 'Advanced'].includes(filters.level)) {
            throw new Error("Invalid level. Must be Beginner, Intermediate, or Advanced");
        }
        query.level = filters.level;
    }

    if (filters.languageId) {
        if (!/^[0-9a-fA-F]{24}$/.test(filters.languageId)) {
            throw new Error("Invalid language ID format");
        }
        query.languageId = filters.languageId;
    } else if (filters.language) {
        if (filters.language !== 'English') {
            throw new Error("Currently only English language is supported");
        }
        query.language = filters.language;
    }

    if (filters.createdById) {
        if (!/^[0-9a-fA-F]{24}$/.test(filters.createdById)) {
            throw new Error("Invalid creator ID format");
        }
        query.createdById = filters.createdById;
    }

    if (filters.isPublished !== undefined) {
        query.isPublished = filters.isPublished;
    }

    const courses = await Course.find(query)
        .sort({ createdAt: -1 })
        .populate('createdById', 'email role')
        .populate('categoryId', 'name slug description')
        .populate('languageId', 'name code')
        .populate('levelId', 'name displayOrder');
    
    return courses;
};

const getCourseById = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId)
        .populate('createdById', 'email role')
        .populate('categoryId', 'name slug description icon')
        .populate('languageId', 'name code')
        .populate('levelId', 'name displayOrder');
    
    if (!course) {
        throw new Error("Course not found");
    }
    
    return course;
};

const updateCourse = async (courseId, updateData) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
        throw new Error("Course not found");
    }

    // Prevent updating published courses
    if (course.isPublished) {
        throw new Error("Cannot update a published course. Unpublish it first.");
    }

    // Prevent changing createdById and categoryId after creation
    delete updateData.createdById;
    delete updateData.categoryId;
    
    // Prevent manual update of totalLessons and totalEnrollments
    delete updateData.totalLessons;
    delete updateData.totalEnrollments;
    delete updateData.isPublished; // Prevent manual publish via update

    // Validate title if provided
    if (updateData.title !== undefined) {
        if (updateData.title.trim() === '') {
            throw new Error("Course title cannot be empty");
        }
        if (updateData.title.trim().length < 3) {
            throw new Error("Course title must be at least 3 characters long");
        }
        if (updateData.title.trim().length > 100) {
            throw new Error("Course title cannot exceed 100 characters");
        }

        // Check for duplicate title by same creator
        const existingCourse = await Course.findOne({
            _id: { $ne: courseId },
            title: { $regex: new RegExp(`^${updateData.title.trim()}$`, 'i') },
            createdById: course.createdById
        });

        if (existingCourse) {
            throw new Error("You already have a course with this title");
        }
    }

    // Validate description if provided
    if (updateData.description !== undefined) {
        if (updateData.description.trim() === '') {
            throw new Error("Course description cannot be empty");
        }
        if (updateData.description.trim().length < 10) {
            throw new Error("Course description must be at least 10 characters long");
        }
    }

    // Validate level if provided
    if (updateData.level !== undefined) {
        if (!['Beginner', 'Intermediate', 'Advanced'].includes(updateData.level)) {
            throw new Error("Course level must be Beginner, Intermediate, or Advanced");
        }
    }

    // Validate language if provided
    if (updateData.language !== undefined && updateData.language !== 'English') {
        throw new Error("Currently only English language is supported");
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        updateData,
        { new: true, runValidators: true }
    )
    .populate('createdById', 'email role')
    .populate('categoryId', 'name slug description')
    .populate('languageId', 'name code')
    .populate('levelId', 'name displayOrder');

    return updatedCourse;
};

const deleteCourse = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId);
    
    if (!course) {
        throw new Error("Course not found");
    }

    // Prevent deleting published courses
    if (course.isPublished) {
        throw new Error("Cannot delete a published course. Unpublish it first.");
    }

    // Prevent deletion if course has lessons
    if (course.totalLessons > 0) {
        throw new Error(`Cannot delete course with ${course.totalLessons} lessons. Delete all lessons first.`);
    }

    // Prevent deletion if course has enrollments
    if (course.totalEnrollments > 0) {
        throw new Error(`Cannot delete course with ${course.totalEnrollments} enrollments. This course is being used by students.`);
    }

    await Course.findByIdAndDelete(courseId);

    return course;
};

const publishCourse = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new Error("Course not found");
    }

    // Already published check
    if (course.isPublished) {
        throw new Error("Course is already published");
    }

    // Validate course has at least one lesson before publishing
    if (course.totalLessons === 0) {
        throw new Error("Cannot publish course without any lessons. Add at least one lesson first.");
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { isPublished: true },
        { new: true }
    )
    .populate('createdById', 'email role')
    .populate('categoryId', 'name slug description')
    .populate('languageId', 'name code')
    .populate('levelId', 'name displayOrder');

    return updatedCourse;
};

const unpublishCourse = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new Error("Course not found");
    }

    // Already unpublished check
    if (!course.isPublished) {
        throw new Error("Course is already unpublished");
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { isPublished: false },
        { new: true }
    )
    .populate('createdById', 'email role')
    .populate('categoryId', 'name slug description')
    .populate('languageId', 'name code')
    .populate('levelId', 'name displayOrder');

    return updatedCourse;
};

const incrementTotalLessons = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findByIdAndUpdate(
        courseId,
        { $inc: { totalLessons: 1 } },
        { new: true }
    );

    if (!course) {
        throw new Error("Course not found");
    }

    return course;
};

const decrementTotalLessons = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new Error("Course not found");
    }

    // Prevent decrementing below 0
    if (course.totalLessons === 0) {
        throw new Error("Cannot decrement totalLessons below 0");
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { $inc: { totalLessons: -1 } },
        { new: true }
    );

    return updatedCourse;
};

const incrementTotalEnrollments = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new Error("Course not found");
    }

    // Only allow enrollments in published courses
    if (!course.isPublished) {
        throw new Error("Cannot enroll in an unpublished course");
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { $inc: { totalEnrollments: 1 } },
        { new: true }
    );

    return updatedCourse;
};

const decrementTotalEnrollments = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new Error("Course not found");
    }

    // Prevent decrementing below 0
    if (course.totalEnrollments === 0) {
        throw new Error("Cannot decrement totalEnrollments below 0");
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { $inc: { totalEnrollments: -1 } },
        { new: true }
    );

    return updatedCourse;
};

const getCoursesByCreator = async (creatorId, isPublishedOnly = false) => {
    if (!/^[0-9a-fA-F]{24}$/.test(creatorId)) {
        throw new Error("Invalid creator ID format");
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
        throw new Error("Creator user not found");
    }

    const query = { createdById: creatorId };
    if (isPublishedOnly) {
        query.isPublished = true;
    }

    const courses = await Course.find(query)
        .sort({ createdAt: -1 })
        .populate('categoryId', 'name slug description');
    
    return courses;
};

const getCourseStatistics = async (courseId) => {
    // Validate courseId format
    if (!/^[0-9a-fA-F]{24}$/.test(courseId)) {
        throw new Error("Invalid course ID format");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new Error("Course not found");
    }

    return {
        totalLessons: course.totalLessons,
        totalEnrollments: course.totalEnrollments,
        isPublished: course.isPublished,
        level: course.level,
        language: course.language
    };
};

/**
 * Get global course statistics
 * @returns {Object} Statistics object
 */
const getGlobalCourseStatistics = async () => {
    const [
        totalCourses,
        publishedCourses,
        unpublishedCourses,
        totalEnrollments,
        levelStats,
        languageStats
    ] = await Promise.all([
        Course.countDocuments(),
        Course.countDocuments({ isPublished: true }),
        Course.countDocuments({ isPublished: false }),
        Course.aggregate([
            { $group: { _id: null, total: { $sum: '$totalEnrollments' } } }
        ]),
        Course.aggregate([
            { $group: { _id: '$level', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]),
        Course.aggregate([
            { $group: { _id: '$language', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ])
    ]);

    return {
        totalCourses,
        publishedCourses,
        unpublishedCourses,
        totalEnrollments: totalEnrollments.length > 0 ? totalEnrollments[0].total : 0,
        byLevel: levelStats,
        byLanguage: languageStats
    };
};

export {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    publishCourse,
    unpublishCourse,
    incrementTotalLessons,
    decrementTotalLessons,
    incrementTotalEnrollments,
    decrementTotalEnrollments,
    getCoursesByCreator,
    getCourseStatistics,
    getGlobalCourseStatistics
};
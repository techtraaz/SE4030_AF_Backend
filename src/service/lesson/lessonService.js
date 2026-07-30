import Lesson from "../../models/lesson/lesson.js";
import Reading from "../../models/lesson/reading.js";
import Listening from "../../models/lesson/listening.js";
import Vocabulary from "../../models/lesson/vocab.js";
import Video from "../../models/lesson/video.js";

const createLesson = async (data) => {
  const lesson = await Lesson.create({
    courseId: data.courseId,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    estimatedMinutes: data.estimatedMinutes,
    order: data.order,
    thumbnail: data.thumbnail,
    isPublished: false,
  });

  // Update course's totalLessons count using courseService
  if (data.courseId) {
    try {
      // Lazy import to avoid circular dependency
      const courseService = await import("../course/courseService.js");
      await courseService.incrementTotalLessons(data.courseId);
      console.log(`Lesson created and course lesson count updated for course: ${data.courseId}`);
    } catch (err) {
      console.error(`Error updating lesson count for course ${data.courseId}:`, err.message);
    }
  }

  return lesson;
};

const getAllLessons = async (categoryId, courseId) => {
  const filter = {};
  if (categoryId) filter.categoryId = categoryId;
  if (courseId) filter.courseId = courseId;
  
  return await Lesson.find(filter)
    .populate("reading")
    .populate("listening")
    .populate("vocabulary")
    .populate("video");
};

const getLessonById = async (id) => {
  const lesson = await Lesson.findById(id)
    .populate("reading")
    .populate("listening")
    .populate("vocabulary")
    .populate("video");
  if (!lesson) throw new Error("Lesson not found");
  return lesson;
};

const updateLesson = async (id, data) => {
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new Error("Lesson not found");
  
  // Prevent updating published lessons
  if (lesson.isPublished) {
    throw new Error("Cannot update a published lesson. Unpublish it first.");
  }
  
  const updatedLesson = await Lesson.findByIdAndUpdate(id, data, { new: true });
  return updatedLesson;
};

const deleteLesson = async (id) => {
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new Error("Lesson not found");
  
  // Prevent deleting published lessons
  if (lesson.isPublished) {
    throw new Error("Cannot delete a published lesson. Unpublish it first.");
  }
  
  await Lesson.findByIdAndDelete(id);
  
  // Update course's totalLessons count using courseService
  if (lesson.courseId) {
    try {
      // Lazy import to avoid circular dependency
      const courseService = await import("../course/courseService.js");
      await courseService.decrementTotalLessons(lesson.courseId);
      console.log(`Lesson deleted and course lesson count updated for course: ${lesson.courseId}`);
    } catch (err) {
      console.error(`Error decrementing lesson count for course ${lesson.courseId}:`, err.message);
    }
  }

  // clean up all sections
  await Reading.findOneAndDelete({ lessonId: id });
  await Listening.findOneAndDelete({ lessonId: id });
  await Vocabulary.findOneAndDelete({ lessonId: id });
  await Video.findOneAndDelete({ lessonId: id });
  
  return lesson;
};

const publishLesson = async (id) => {
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new Error("Lesson not found");
  // make sure all sections exist before publishing
  if (
    !lesson.reading ||
    !lesson.listening ||
    !lesson.vocabulary ||
    !lesson.video
  ) {
    throw new Error("All sections must be added before publishing");
  }
  lesson.isPublished = true;
  await lesson.save();
  return lesson;
};

const unpublishLesson = async (id) => {
  const lesson = await Lesson.findById(id);
  if (!lesson) throw new Error("Lesson not found");
  lesson.isPublished = false;
  await lesson.save();
  return lesson;
};

// Helper function to count lessons by course
const getLessonCountByCourse = async (courseId) => {
  return await Lesson.countDocuments({ courseId });
};

// Helper function to get all lessons for a course
const getLessonsByCourse = async (courseId) => {
  return await Lesson.find({ courseId })
    .populate("reading")
    .populate("listening")
    .populate("vocabulary")
    .populate("video")
    .sort({ order: 1 });
};

export {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  publishLesson,
  unpublishLesson,
  getLessonCountByCourse,
  getLessonsByCourse,
};

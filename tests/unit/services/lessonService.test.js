// Static mocks for Lesson and sub-content models
jest.mock("../../../src/models/lesson/lesson.js");
jest.mock("../../../src/models/lesson/reading.js");
jest.mock("../../../src/models/lesson/listening.js");
jest.mock("../../../src/models/lesson/vocab.js");
jest.mock("../../../src/models/lesson/video.js");

// Mock courseService (dynamic import) via jest.mock with factory
jest.mock("../../../src/service/course/courseService.js", () => ({
  incrementTotalLessons: jest.fn().mockResolvedValue(undefined),
  decrementTotalLessons: jest.fn().mockResolvedValue(undefined),
}));

import Lesson from "../../../src/models/lesson/lesson.js";
import Reading from "../../../src/models/lesson/reading.js";
import Listening from "../../../src/models/lesson/listening.js";
import Vocabulary from "../../../src/models/lesson/vocab.js";
import Video from "../../../src/models/lesson/video.js";
import * as courseService from "../../../src/service/course/courseService.js";

import {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  publishLesson,
  unpublishLesson,
  getLessonCountByCourse,
  getLessonsByCourse,
} from "../../../src/service/lesson/lessonService.js";

// Helper: build a mock Lesson document with a chainable populate()
const buildPopulatable = (data) => {
  const chain = { ...data, populate: jest.fn() };
  chain.populate.mockReturnValue(chain);
  return chain;
};

describe("lessonService", () => {
  // ─── createLesson ─────────────────────────────────────────────────────────

  describe("createLesson", () => {
    it("should create a lesson with isPublished: false", async () => {
      const lessonData = { courseId: "c1", categoryId: "cat1", title: "Intro" };
      const created = { ...lessonData, isPublished: false, _id: "l1" };
      Lesson.create.mockResolvedValue(created);

      const result = await createLesson(lessonData);
      expect(Lesson.create).toHaveBeenCalledWith(expect.objectContaining({ isPublished: false }));
      expect(result).toEqual(created);
    });

    it("should call incrementTotalLessons when courseId is provided", async () => {
      const lessonData = { courseId: "course1", categoryId: "cat1", title: "T" };
      Lesson.create.mockResolvedValue({ ...lessonData, _id: "l2" });

      await createLesson(lessonData);
      expect(courseService.incrementTotalLessons).toHaveBeenCalledWith("course1");
    });

    it("should NOT call incrementTotalLessons when courseId is absent", async () => {
      courseService.incrementTotalLessons.mockClear();
      const lessonData = { categoryId: "cat1", title: "T" };
      Lesson.create.mockResolvedValue({ ...lessonData, _id: "l3" });

      await createLesson(lessonData);
      expect(courseService.incrementTotalLessons).not.toHaveBeenCalled();
    });
  });

  // ─── getAllLessons ─────────────────────────────────────────────────────────

  describe("getAllLessons", () => {
    it("should fetch all lessons without filters", async () => {
      const chain = buildPopulatable([]);
      Lesson.find.mockReturnValue(chain);

      await getAllLessons(undefined, undefined);
      expect(Lesson.find).toHaveBeenCalledWith({});
    });

    it("should apply categoryId filter when provided", async () => {
      const chain = buildPopulatable([]);
      Lesson.find.mockReturnValue(chain);

      await getAllLessons("cat1", undefined);
      expect(Lesson.find).toHaveBeenCalledWith({ categoryId: "cat1" });
    });

    it("should apply courseId filter when provided", async () => {
      const chain = buildPopulatable([]);
      Lesson.find.mockReturnValue(chain);

      await getAllLessons(undefined, "course1");
      expect(Lesson.find).toHaveBeenCalledWith({ courseId: "course1" });
    });
  });

  // ─── getLessonById ────────────────────────────────────────────────────────

  describe("getLessonById", () => {
    it("should return the lesson when found", async () => {
      const lesson = buildPopulatable({ _id: "l1", title: "Intro" });
      Lesson.findById.mockReturnValue(lesson);

      const result = await getLessonById("l1");
      expect(result).toEqual(lesson);
    });

    it("should throw 'Lesson not found' when not found", async () => {
      const nullChain = { populate: jest.fn().mockReturnThis() };
      // The final populate resolves to null
      nullChain.populate.mockReturnValue(null);
      Lesson.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue(null),
          }),
        }),
      });

      await expect(getLessonById("missing")).rejects.toThrow("Lesson not found");
    });
  });

  // ─── updateLesson ─────────────────────────────────────────────────────────

  describe("updateLesson", () => {
    it("should update and return the lesson", async () => {
      const updated = { _id: "l1", title: "Updated" };
      Lesson.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await updateLesson("l1", { title: "Updated" });
      expect(Lesson.findByIdAndUpdate).toHaveBeenCalledWith("l1", { title: "Updated" }, { new: true });
      expect(result).toEqual(updated);
    });

    it("should throw 'Lesson not found' when not found", async () => {
      Lesson.findByIdAndUpdate.mockResolvedValue(null);
      await expect(updateLesson("missing", {})).rejects.toThrow("Lesson not found");
    });
  });

  // ─── deleteLesson ─────────────────────────────────────────────────────────

  describe("deleteLesson", () => {
    it("should throw 'Lesson not found' when not found", async () => {
      Lesson.findByIdAndDelete.mockResolvedValue(null);
      await expect(deleteLesson("missing")).rejects.toThrow("Lesson not found");
    });

    it("should delete lesson and clean up related sections", async () => {
      const lesson = { _id: "l1", courseId: "c1" };
      Lesson.findByIdAndDelete.mockResolvedValue(lesson);
      Reading.findOneAndDelete.mockResolvedValue(null);
      Listening.findOneAndDelete.mockResolvedValue(null);
      Vocabulary.findOneAndDelete.mockResolvedValue(null);
      Video.findOneAndDelete.mockResolvedValue(null);

      const result = await deleteLesson("l1");
      expect(Reading.findOneAndDelete).toHaveBeenCalledWith({ lessonId: "l1" });
      expect(Listening.findOneAndDelete).toHaveBeenCalledWith({ lessonId: "l1" });
      expect(Vocabulary.findOneAndDelete).toHaveBeenCalledWith({ lessonId: "l1" });
      expect(Video.findOneAndDelete).toHaveBeenCalledWith({ lessonId: "l1" });
      expect(result).toEqual(lesson);
    });

    it("should call decrementTotalLessons when courseId is present", async () => {
      const lesson = { _id: "l1", courseId: "c1" };
      Lesson.findByIdAndDelete.mockResolvedValue(lesson);
      Reading.findOneAndDelete.mockResolvedValue(null);
      Listening.findOneAndDelete.mockResolvedValue(null);
      Vocabulary.findOneAndDelete.mockResolvedValue(null);
      Video.findOneAndDelete.mockResolvedValue(null);

      await deleteLesson("l1");
      expect(courseService.decrementTotalLessons).toHaveBeenCalledWith("c1");
    });
  });

  // ─── publishLesson ────────────────────────────────────────────────────────

  describe("publishLesson", () => {
    it("should throw 'Lesson not found' when not found", async () => {
      Lesson.findById.mockResolvedValue(null);
      await expect(publishLesson("missing")).rejects.toThrow("Lesson not found");
    });

    it("should throw when any section is missing", async () => {
      Lesson.findById.mockResolvedValue({
        reading: "r1",
        listening: null, // missing
        vocabulary: "v1",
        video: "vid1",
        save: jest.fn(),
      });
      await expect(publishLesson("l1")).rejects.toThrow("All sections must be added before publishing");
    });

    it("should set isPublished to true and save when all sections exist", async () => {
      const lesson = {
        reading: "r1",
        listening: "li1",
        vocabulary: "v1",
        video: "vid1",
        isPublished: false,
        save: jest.fn().mockResolvedValue(undefined),
      };
      Lesson.findById.mockResolvedValue(lesson);

      await publishLesson("l1");
      expect(lesson.isPublished).toBe(true);
      expect(lesson.save).toHaveBeenCalledTimes(1);
    });
  });

  // ─── unpublishLesson ──────────────────────────────────────────────────────

  describe("unpublishLesson", () => {
    it("should throw 'Lesson not found' when not found", async () => {
      Lesson.findById.mockResolvedValue(null);
      await expect(unpublishLesson("missing")).rejects.toThrow("Lesson not found");
    });

    it("should set isPublished to false and save", async () => {
      const lesson = {
        isPublished: true,
        save: jest.fn().mockResolvedValue(undefined),
      };
      Lesson.findById.mockResolvedValue(lesson);

      await unpublishLesson("l1");
      expect(lesson.isPublished).toBe(false);
      expect(lesson.save).toHaveBeenCalledTimes(1);
    });
  });

  // ─── getLessonCountByCourse ───────────────────────────────────────────────

  describe("getLessonCountByCourse", () => {
    it("should return count of lessons for a course", async () => {
      Lesson.countDocuments.mockResolvedValue(5);
      const count = await getLessonCountByCourse("course1");
      expect(Lesson.countDocuments).toHaveBeenCalledWith({ courseId: "course1" });
      expect(count).toBe(5);
    });
  });
});

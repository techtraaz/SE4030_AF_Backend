jest.mock("../../../src/service/lesson/lessonService.js");

import * as lessonService from "../../../src/service/lesson/lessonService.js";
import {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  publishLesson,
  unpublishLesson,
} from "../../../src/controller/lesson/lessonController.js";

// Factory for mock req/res
const buildReqRes = ({ body = {}, params = {}, query = {} } = {}) => {
  const req = { body, params, query };
  const res = {
    created: jest.fn(),
    success: jest.fn(),
    badRequest: jest.fn(),
    notFound: jest.fn(),
    error: jest.fn(),
  };
  return { req, res };
};

describe("lessonController", () => {
  // ─── createLesson ─────────────────────────────────────────────────────────

  describe("createLesson", () => {
    it("should call res.created on success", async () => {
      const { req, res } = buildReqRes({ body: { title: "Intro" } });
      const lesson = { _id: "l1", title: "Intro" };
      lessonService.createLesson.mockResolvedValue(lesson);

      await createLesson(req, res);
      expect(res.created).toHaveBeenCalledWith("Lesson created successfully", lesson);
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes();
      lessonService.createLesson.mockRejectedValue(new Error("Missing fields"));

      await createLesson(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("Missing fields");
    });
  });

  // ─── getAllLessons ─────────────────────────────────────────────────────────

  describe("getAllLessons", () => {
    it("should call res.success with lesson list", async () => {
      const { req, res } = buildReqRes({ query: { categoryId: "cat1" } });
      const lessons = [{ _id: "l1" }];
      lessonService.getAllLessons.mockResolvedValue(lessons);

      await getAllLessons(req, res);
      expect(lessonService.getAllLessons).toHaveBeenCalledWith("cat1", undefined);
      expect(res.success).toHaveBeenCalledWith("Lessons fetched successfully", lessons);
    });

    it("should call res.error on failure", async () => {
      const { req, res } = buildReqRes();
      lessonService.getAllLessons.mockRejectedValue(new Error("DB error"));

      await getAllLessons(req, res);
      expect(res.error).toHaveBeenCalledWith("DB error");
    });
  });

  // ─── getLessonById ────────────────────────────────────────────────────────

  describe("getLessonById", () => {
    it("should call res.success on success", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" } });
      const lesson = { _id: "l1" };
      lessonService.getLessonById.mockResolvedValue(lesson);

      await getLessonById(req, res);
      expect(lessonService.getLessonById).toHaveBeenCalledWith("l1");
      expect(res.success).toHaveBeenCalledWith("Lesson fetched successfully", lesson);
    });

    it("should call res.notFound on error", async () => {
      const { req, res } = buildReqRes({ params: { id: "missing" } });
      lessonService.getLessonById.mockRejectedValue(new Error("Lesson not found"));

      await getLessonById(req, res);
      expect(res.notFound).toHaveBeenCalledWith("Lesson not found");
    });
  });

  // ─── updateLesson ─────────────────────────────────────────────────────────

  describe("updateLesson", () => {
    it("should call res.success on success", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" }, body: { title: "Updated" } });
      const updated = { _id: "l1", title: "Updated" };
      lessonService.updateLesson.mockResolvedValue(updated);

      await updateLesson(req, res);
      expect(lessonService.updateLesson).toHaveBeenCalledWith("l1", { title: "Updated" });
      expect(res.success).toHaveBeenCalledWith("Lesson updated successfully", updated);
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" } });
      lessonService.updateLesson.mockRejectedValue(new Error("Not found"));

      await updateLesson(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("Not found");
    });
  });

  // ─── deleteLesson ─────────────────────────────────────────────────────────

  describe("deleteLesson", () => {
    it("should call res.success with null on success", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" } });
      lessonService.deleteLesson.mockResolvedValue({});

      await deleteLesson(req, res);
      expect(lessonService.deleteLesson).toHaveBeenCalledWith("l1");
      expect(res.success).toHaveBeenCalledWith("Lesson deleted successfully", null);
    });

    it("should call res.notFound on error", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" } });
      lessonService.deleteLesson.mockRejectedValue(new Error("Lesson not found"));

      await deleteLesson(req, res);
      expect(res.notFound).toHaveBeenCalledWith("Lesson not found");
    });
  });

  // ─── publishLesson ────────────────────────────────────────────────────────

  describe("publishLesson", () => {
    it("should call res.success on success", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" } });
      const lesson = { _id: "l1", isPublished: true };
      lessonService.publishLesson.mockResolvedValue(lesson);

      await publishLesson(req, res);
      expect(lessonService.publishLesson).toHaveBeenCalledWith("l1");
      expect(res.success).toHaveBeenCalledWith("Lesson published successfully", lesson);
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" } });
      lessonService.publishLesson.mockRejectedValue(new Error("All sections must be added"));

      await publishLesson(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("All sections must be added");
    });
  });

  // ─── unpublishLesson ──────────────────────────────────────────────────────

  describe("unpublishLesson", () => {
    it("should call res.success on success", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" } });
      const lesson = { _id: "l1", isPublished: false };
      lessonService.unpublishLesson.mockResolvedValue(lesson);

      await unpublishLesson(req, res);
      expect(lessonService.unpublishLesson).toHaveBeenCalledWith("l1");
      expect(res.success).toHaveBeenCalledWith("Lesson unpublished successfully", lesson);
    });

    it("should call res.badRequest on error", async () => {
      const { req, res } = buildReqRes({ params: { id: "l1" } });
      lessonService.unpublishLesson.mockRejectedValue(new Error("Lesson not found"));

      await unpublishLesson(req, res);
      expect(res.badRequest).toHaveBeenCalledWith("Lesson not found");
    });
  });
});

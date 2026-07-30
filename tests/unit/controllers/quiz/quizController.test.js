jest.mock("../../../../src/service/quiz/quizService.js");

import * as quizService from "../../../../src/service/quiz/quizService.js";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
} from "../../../../src/controller/quiz/quizController.js";

// Mock response object with responseGenerator middleware methods
const mockResponse = () => {
  const res = {};
  res.created = jest.fn().mockReturnValue(res);
  res.success = jest.fn().mockReturnValue(res);
  res.badRequest = jest.fn().mockReturnValue(res);
  res.notFound = jest.fn().mockReturnValue(res);
  res.error = jest.fn().mockReturnValue(res);
  return res;
};

describe("quizController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createQuiz ────────────────────────────────────────────────────────

  describe("createQuiz", () => {
    it("should create quiz and return 201", async () => {
      const mockQuiz = {
        _id: "quiz123",
        title: "JavaScript Basics",
        courseId: "course123",
      };
      const req = {
        body: {
          title: "JavaScript Basics",
          courseId: "course123",
        },
      };
      const res = mockResponse();

      quizService.createQuiz = jest.fn().mockResolvedValue(mockQuiz);

      await createQuiz(req, res);

      expect(quizService.createQuiz).toHaveBeenCalledWith(req.body);
      expect(res.created).toHaveBeenCalledWith(
        "Quiz created successfully",
        mockQuiz
      );
    });
  });

  // ─── getAllQuizzes ─────────────────────────────────────────────────────

  describe("getAllQuizzes", () => {
    it("should retrieve all quizzes with filters", async () => {
      const mockQuizzes = [
        { _id: "q1", title: "Quiz 1" },
        { _id: "q2", title: "Quiz 2" },
      ];
      const req = {
        query: {
          courseId: "course123",
          lessonId: "lesson123",
          isPublished: "true",
        },
      };
      const res = mockResponse();

      quizService.getAllQuizzes = jest.fn().mockResolvedValue(mockQuizzes);

      await getAllQuizzes(req, res);

      expect(quizService.getAllQuizzes).toHaveBeenCalledWith({
        courseId: "course123",
        lessonId: "lesson123",
        isPublished: "true",
      });
      expect(res.success).toHaveBeenCalledWith(
        "Quizzes retrieved successfully",
        mockQuizzes
      );
    });
  });

  // ─── getQuizById ───────────────────────────────────────────────────────

  describe("getQuizById", () => {
    it("should retrieve quiz by ID", async () => {
      const mockQuiz = { _id: "quiz123", title: "Test Quiz" };
      const req = { params: { id: "quiz123" } };
      const res = mockResponse();

      quizService.getQuizById = jest.fn().mockResolvedValue(mockQuiz);

      await getQuizById(req, res);

      expect(quizService.getQuizById).toHaveBeenCalledWith("quiz123");
      expect(res.success).toHaveBeenCalledWith(
        "Quiz retrieved successfully",
        mockQuiz
      );
    });
  });

  // ─── updateQuiz ────────────────────────────────────────────────────────

  describe("updateQuiz", () => {
    it("should update quiz successfully", async () => {
      const mockQuiz = { _id: "quiz123", title: "Updated Quiz" };
      const req = {
        params: { id: "quiz123" },
        body: { title: "Updated Quiz" },
      };
      const res = mockResponse();

      quizService.updateQuiz = jest.fn().mockResolvedValue(mockQuiz);

      await updateQuiz(req, res);

      expect(quizService.updateQuiz).toHaveBeenCalledWith("quiz123", {
        title: "Updated Quiz",
      });
      expect(res.success).toHaveBeenCalledWith(
        "Quiz updated successfully",
        mockQuiz
      );
    });
  });

  // ─── deleteQuiz ────────────────────────────────────────────────────────

  describe("deleteQuiz", () => {
    it("should delete quiz successfully", async () => {
      const req = { params: { id: "quiz123" } };
      const res = mockResponse();

      quizService.deleteQuiz = jest.fn().mockResolvedValue();

      await deleteQuiz(req, res);

      expect(quizService.deleteQuiz).toHaveBeenCalledWith("quiz123");
      expect(res.success).toHaveBeenCalledWith("Quiz deleted successfully");
    });
  });

  // ─── publishQuiz ───────────────────────────────────────────────────────

  describe("publishQuiz", () => {
    it("should publish quiz successfully", async () => {
      const mockQuiz = { _id: "quiz123", isPublished: true };
      const req = { params: { id: "quiz123" } };
      const res = mockResponse();

      quizService.publishQuiz = jest.fn().mockResolvedValue(mockQuiz);

      await publishQuiz(req, res);

      expect(quizService.publishQuiz).toHaveBeenCalledWith("quiz123");
      expect(res.success).toHaveBeenCalledWith(
        "Quiz published successfully",
        mockQuiz
      );
    });
  });

  // ─── unpublishQuiz ─────────────────────────────────────────────────────

  describe("unpublishQuiz", () => {
    it("should unpublish quiz successfully", async () => {
      const mockQuiz = { _id: "quiz123", isPublished: false };
      const req = { params: { id: "quiz123" } };
      const res = mockResponse();

      quizService.unpublishQuiz = jest.fn().mockResolvedValue(mockQuiz);

      await unpublishQuiz(req, res);

      expect(quizService.unpublishQuiz).toHaveBeenCalledWith("quiz123");
      expect(res.success).toHaveBeenCalledWith(
        "Quiz unpublished successfully",
        mockQuiz
      );
    });
  });
});

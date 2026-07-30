// Mock Quiz model
jest.mock("../../../../src/models/quiz/Quiz.js");
jest.mock("../../../../src/models/quiz/QuizAttempt.js");
jest.mock("../../../../src/models/quiz/Question.js");
jest.mock("../../../../src/models/quiz/Option.js");

import Quiz from "../../../../src/models/quiz/Quiz.js";
import QuizAttempt from "../../../../src/models/quiz/QuizAttempt.js";
import Question from "../../../../src/models/quiz/Question.js";
import Option from "../../../../src/models/quiz/Option.js";
import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
} from "../../../../src/service/quiz/quizService.js";

// Helper: build a mock Quiz document with chainable populate()
const buildPopulatable = (data) => {
  const chain = { ...data, populate: jest.fn() };
  chain.populate.mockReturnValue(chain);
  return chain;
};

describe("quizService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createQuiz ─────────────────────────────────────────────────────────

  describe("createQuiz", () => {
    it("should create a quiz successfully", async () => {
      const quizData = { title: "English Basics Quiz", courseId: "course1" };
      const created = { ...quizData, isPublished: false, _id: "q1" };
      Quiz.create.mockResolvedValue(created);

      const result = await createQuiz(quizData);

      expect(result).toEqual(created);
    });

    it("should throw error if neither courseId nor lessonId is provided", async () => {
      Quiz.create.mockRejectedValue(
        new Error("Quiz must belong to either a course or a lesson")
      );

      await expect(createQuiz({ title: "Invalid Quiz" })).rejects.toThrow(
        "Quiz must belong to either a course or a lesson"
      );
    });
  });

  // ─── getAllQuizzes ─────────────────────────────────────────────────────────

  describe("getAllQuizzes", () => {
    it("should fetch all quizzes", async () => {
      const mockQuizzes = [{ _id: "q1", title: "Quiz 1" }];
      const chain = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
      };
      // Second populate call resolves with the data
      chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce(mockQuizzes);
      Quiz.find.mockReturnValue(chain);

      const result = await getAllQuizzes({});

      expect(result).toEqual(mockQuizzes);
    });
  });

  // ─── getQuizById ────────────────────────────────────────────────────────

  describe("getQuizById", () => {
    it("should return a quiz", async () => {
      const quiz = { _id: "q1", title: "Test Quiz" };
      const chain = { populate: jest.fn() };
      chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce(quiz);
      Quiz.findById.mockReturnValue(chain);

      const result = await getQuizById("q1");

      expect(result).toEqual(quiz);
    });

    it("should throw error if quiz not found", async () => {
      const chain = { populate: jest.fn() };
      chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce(null);
      Quiz.findById.mockReturnValue(chain);

      await expect(getQuizById("nonexistent")).rejects.toThrow("Quiz not found");
    });
  });

  // ─── updateQuiz ────────────────────────────────────────────────────────

  describe("updateQuiz", () => {
    it("should update quiz when not published", async () => {
      const existing = { _id: "q1", isPublished: false };
      Quiz.findById.mockResolvedValue(existing);
      Quiz.findByIdAndUpdate.mockResolvedValue({ ...existing, title: "Updated" });

      const result = await updateQuiz("q1", { title: "Updated" });

      expect(result.title).toBe("Updated");
    });

    it("should throw error when updating a published quiz", async () => {
      Quiz.findById.mockResolvedValue({ _id: "q1", isPublished: true });

      await expect(updateQuiz("q1", { title: "New" })).rejects.toThrow(
        "Cannot update a published quiz"
      );
    });
  });

  // ─── deleteQuiz ────────────────────────────────────────────────────────

  describe("deleteQuiz", () => {
    it("should delete quiz when not published", async () => {
      const quiz = { _id: "q1", isPublished: false };
      const mockQuestions = [{ _id: "qu1" }, { _id: "qu2" }];
      Quiz.findById.mockResolvedValue(quiz);
      QuizAttempt.countDocuments.mockResolvedValue(0);
      Question.find.mockResolvedValue(mockQuestions);
      Option.deleteMany.mockResolvedValue({ deletedCount: 5 });
      Question.deleteMany.mockResolvedValue({ deletedCount: 2 });
      Quiz.findByIdAndDelete.mockResolvedValue(quiz);

      const result = await deleteQuiz("q1");

      expect(result).toEqual(quiz);
    });

    it("should throw error when deleting a published quiz", async () => {
      Quiz.findById.mockResolvedValue({ _id: "q1", isPublished: true });

      await expect(deleteQuiz("q1")).rejects.toThrow(
        "Cannot delete a published quiz"
      );
    });
  });

  // ─── publishQuiz ───────────────────────────────────────────────────────

  describe("publishQuiz", () => {
    it("should publish an unpublished quiz", async () => {
      const updatedQuiz = { _id: "q1", isPublished: true };
      Question.countDocuments.mockResolvedValue(5); // Has questions
      Quiz.findByIdAndUpdate.mockResolvedValue(updatedQuiz);

      const result = await publishQuiz("q1");

      expect(Quiz.findByIdAndUpdate).toHaveBeenCalledWith(
        "q1",
        { isPublished: true },
        { new: true }
      );
      expect(result.isPublished).toBe(true);
    });

    it("should throw error if quiz has no questions", async () => {
      Question.countDocuments.mockResolvedValue(0); // No questions

      await expect(publishQuiz("q1")).rejects.toThrow(
        "Cannot publish quiz without questions"
      );
    });
  });

  // ─── unpublishQuiz ─────────────────────────────────────────────────────

  describe("unpublishQuiz", () => {
    it("should unpublish a published quiz", async () => {
      const updatedQuiz = { _id: "q1", isPublished: false };
      Quiz.findByIdAndUpdate.mockResolvedValue(updatedQuiz);

      const result = await unpublishQuiz("q1");

      expect(Quiz.findByIdAndUpdate).toHaveBeenCalledWith(
        "q1",
        { isPublished: false },
        { new: true }
      );
      expect(result.isPublished).toBe(false);
    });
  });
});

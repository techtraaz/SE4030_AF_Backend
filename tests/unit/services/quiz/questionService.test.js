jest.mock("../../../../src/models/quiz/Question.js");
jest.mock("../../../../src/models/quiz/Option.js");
jest.mock("../../../../src/models/quiz/Quiz.js");

import Question from "../../../../src/models/quiz/Question.js";
import Option from "../../../../src/models/quiz/Option.js";
import Quiz from "../../../../src/models/quiz/Quiz.js";
import {
  createQuestion,
  createQuestionWithOptions,
  getAllQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../../../../src/service/quiz/questionService.js";

describe("questionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createQuestion ────────────────────────────────────────────────────

  describe("createQuestion", () => {
    it("should create a question successfully", async () => {
      const mockQuiz = { _id: "quiz123", isPublished: false };
      const mockQuestionData = {
        quizId: "quiz123",
        questionText: "What is 2+2?",
        type: "multiple_choice",
        points: 10,
      };
      const mockQuestion = { _id: "q1", ...mockQuestionData, order: 1 };

      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);
      const findOneChain = {
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(null),
      };
      Question.findOne = jest.fn().mockReturnValue(findOneChain);
      Question.create = jest.fn().mockResolvedValue(mockQuestion);

      const result = await createQuestion(mockQuestionData);

      expect(result).toEqual(mockQuestion);
    });

    it("should throw error if quiz is published", async () => {
      const mockQuiz = { _id: "quiz123", isPublished: true };
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);

      await expect(
        createQuestion({ quizId: "quiz123", questionText: "Test", points: 5 })
      ).rejects.toThrow("Cannot add questions to a published quiz");
    });

    it("should throw error if points <= 0", async () => {
      const mockQuiz = { _id: "quiz123", isPublished: false };
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);

      await expect(
        createQuestion({ quizId: "quiz123", questionText: "Test", points: 0 })
      ).rejects.toThrow("Points must be greater than 0");
    });
  });

  // ─── createQuestionWithOptions ──────────────────────────────────────────

  describe("createQuestionWithOptions", () => {
    it("should create question with options successfully", async () => {
      const mockQuiz = { _id: "quiz123", isPublished: false };
      const mockQuestion = { _id: "q1", type: "multiple_choice", quizId: "quiz123" };
      const mockOptions = [
        { _id: "opt1", optionText: "Option A", isCorrect: true },
        { _id: "opt2", optionText: "Option B", isCorrect: false },
      ];

      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);
      Question.findOne = jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(null),
      }));
      Question.create = jest.fn().mockResolvedValue(mockQuestion);
      Option.insertMany = jest.fn().mockResolvedValue(mockOptions);

      const result = await createQuestionWithOptions(
        { quizId: "quiz123", questionText: "Test?", type: "multiple_choice", points: 5 },
        [ { optionText: "Option A", isCorrect: true }, { optionText: "Option B", isCorrect: false }]
      );

      expect(result.question).toEqual(mockQuestion);
      expect(result.options).toEqual(mockOptions);
    });

    it("should validate option count for question type", async () => {
      await expect(
        createQuestionWithOptions(
          { quizId: "quiz123", questionText: "True?", type: "true_false", points: 5 },
          [{ optionText: "True", isCorrect: true }]
        )
      ).rejects.toThrow("True/False questions must have exactly 2 options");
    });

    it("should validate correct answer count for multiple_choice", async () => {
      const mockQuiz = { _id: "quiz123", isPublished: false };
      const mockQuestion = { _id: "q1", type: "multiple_choice" };
      const mockOptions = [
        { optionText: "A", isCorrect: true },
        { optionText: "B", isCorrect: true },
      ];

      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);
      Question.findOne = jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(null),
      }));
      Question.create = jest.fn().mockResolvedValue(mockQuestion);
      Option.insertMany = jest.fn().mockResolvedValue(mockOptions);
      Question.findByIdAndDelete = jest.fn();
      Option.deleteMany = jest.fn();

      await expect(
        createQuestionWithOptions(
          { quizId: "quiz123", questionText: "Test", type: "multiple_choice", points: 5 },
          [{ optionText: "A", isCorrect: true }, { optionText: "B", isCorrect: true }]
        )
      ).rejects.toThrow("Multiple choice questions must have exactly 1 correct answer");
    });
  });

  // ─── getAllQuestionsByQuiz ────────────────────────────────────────────────

  describe("getAllQuestionsByQuiz", () => {
    it("should retrieve all questions for a quiz", async () => {
      const mockQuestions = [
        { _id: "q1", questionText: "Question 1" },
        { _id: "q2", questionText: "Question 2" },
      ];

      Question.find = jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockQuestions),
      }));

      const result = await getAllQuestionsByQuiz("quiz123");

      expect(result).toEqual(mockQuestions);
    });
  });

  // ─── getQuestionById ───────────────────────────────────────────────────

  describe("getQuestionById", () => {
    it("should retrieve a question by ID", async () => {
      const mockQuestion = { _id: "q1", questionText: "Test Question" };

      Question.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(mockQuestion),
      }));

      const result = await getQuestionById("q1");

      expect(result).toEqual(mockQuestion);
    });

    it("should throw error if question not found", async () => {
      Question.findById = jest.fn().mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null),
      }));

      await expect(getQuestionById("nonexistent")).rejects.toThrow(
        "Question not found"
      );
    });
  });

  // ─── updateQuestion ────────────────────────────────────────────────────

  describe("updateQuestion", () => {
    it("should update question successfully", async () => {
      const mockQuestion = { _id: "q1", quizId: "quiz123" };
      const mockQuiz = { _id: "quiz123", isPublished: false };
      const updatedQuestion = { ...mockQuestion, questionText: "Updated" };

      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);
      Question.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedQuestion);

      const result = await updateQuestion("q1", { questionText: "Updated" });

      expect(result).toEqual(updatedQuestion);
    });

    it("should throw error if quiz is published", async () => {
      const mockQuestion = { _id: "q1", quizId: "quiz123" };
      const mockQuiz = { _id: "quiz123", isPublished: true };

      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);

      await expect(
        updateQuestion("q1", { questionText: "New" })
      ).rejects.toThrow("Cannot update questions in a published quiz");
    });
  });

  // ─── deleteQuestion ────────────────────────────────────────────────────

  describe("deleteQuestion", () => {
    it("should delete question and its options successfully", async () => {
      const mockQuestion = { _id: "q1", quizId: "quiz123" };
      const mockQuiz = { _id: "quiz123", isPublished: false };

      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);
      Question.findByIdAndDelete = jest.fn().mockResolvedValue(mockQuestion);
      Option.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 3 });

      const result = await deleteQuestion("q1");

      expect(result).toEqual(mockQuestion);
    });

    it("should throw error if quiz is published", async () => {
      const mockQuestion = { _id: "q1", quizId: "quiz123" };
      const mockQuiz = { _id: "quiz123", isPublished: true };

      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);

      await expect(deleteQuestion("q1")).rejects.toThrow(
        "Cannot delete questions from a published quiz"
      );
    });
  });
});
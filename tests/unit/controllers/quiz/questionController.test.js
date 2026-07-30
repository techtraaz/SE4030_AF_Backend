jest.mock("../../../../src/service/quiz/questionService.js");

import * as questionService from "../../../../src/service/quiz/questionService.js";
import {
  createQuestion,
  getAllQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../../../../src/controller/quiz/questionController.js";

const mockResponse = () => {
  const res = {};
  res.created = jest.fn().mockReturnValue(res);
  res.success = jest.fn().mockReturnValue(res);
  res.badRequest = jest.fn().mockReturnValue(res);
  res.notFound = jest.fn().mockReturnValue(res);
  res.error = jest.fn().mockReturnValue(res);
  return res;
};

describe("questionController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createQuestion ────────────────────────────────────────────────────

  describe("createQuestion", () => {
    it("should create question with options", async () => {
      const mockResult = {
        question: { _id: "q1", questionText: "What is 2+2?" },
        options: [
          { _id: "opt1", optionText: "4", isCorrect: true },
          { _id: "opt2", optionText: "5", isCorrect: false },
        ],
      };
      const req = {
        body: {
          quizId: "quiz123",
          questionText: "What is 2+2?",
          type: "multiple_choice",
          points: 5,
          options: [
            { optionText: "4", isCorrect: true },
            { optionText: "5", isCorrect: false },
          ],
        },
      };
      const res = mockResponse();

      questionService.createQuestionWithOptions = jest
        .fn()
        .mockResolvedValue(mockResult);

      await createQuestion(req, res);

      expect(
        questionService.createQuestionWithOptions
      ).toHaveBeenCalledWith(
        {
          quizId: "quiz123",
          questionText: "What is 2+2?",
          type: "multiple_choice",
          points: 5,
        },
        req.body.options
      );
      expect(res.created).toHaveBeenCalledWith(
        "Question created with options successfully",
        mockResult
      );
    });

    it("should create question without options", async () => {
      const mockQuestion = {
        _id: "q1",
        questionText: "What is 2+2?",
        type: "multiple_choice",
      };
      const req = {
        body: {
          quizId: "quiz123",
          questionText: "What is 2+2?",
          type: "multiple_choice",
          points: 5,
        },
      };
      const res = mockResponse();

      questionService.createQuestion = jest.fn().mockResolvedValue(mockQuestion);

      await createQuestion(req, res);

      expect(questionService.createQuestion).toHaveBeenCalledWith({
        quizId: "quiz123",
        questionText: "What is 2+2?",
        type: "multiple_choice",
        points: 5,
      });
      expect(res.created).toHaveBeenCalledWith(
        "Question created successfully",
        mockQuestion
      );
    });
  });

  // ─── getAllQuestionsByQuiz ─────────────────────────────────────────────

  describe("getAllQuestionsByQuiz", () => {
    it("should retrieve all questions for a quiz", async () => {
      const mockQuestions = [
        { _id: "q1", questionText: "Question 1" },
        { _id: "q2", questionText: "Question 2" },
      ];
      const req = { params: { quizId: "quiz123" } };
      const res = mockResponse();

      questionService.getAllQuestionsByQuiz = jest
        .fn()
        .mockResolvedValue(mockQuestions);

      await getAllQuestionsByQuiz(req, res);

      expect(questionService.getAllQuestionsByQuiz).toHaveBeenCalledWith(
        "quiz123"
      );
      expect(res.success).toHaveBeenCalledWith(
        "Questions retrieved successfully",
        mockQuestions
      );
    });
  });

  // ─── getQuestionById ───────────────────────────────────────────────────

  describe("getQuestionById", () => {
    it("should retrieve question with options by ID", async () => {
      const mockResult = {
        question: { _id: "q1", questionText: "Test Question" },
        options: [{ optionText: "Option A" }],
      };
      const req = { params: { id: "q1" } };
      const res = mockResponse();

      questionService.getQuestionWithOptions = jest
        .fn()
        .mockResolvedValue(mockResult);

      await getQuestionById(req, res);

      expect(questionService.getQuestionWithOptions).toHaveBeenCalledWith("q1");
      expect(res.success).toHaveBeenCalledWith(
        "Question retrieved successfully",
        mockResult
      );
    });
  });

  // ─── updateQuestion ────────────────────────────────────────────────────

  describe("updateQuestion", () => {
    it("should update question successfully", async () => {
      const mockQuestion = {
        _id: "q1",
        questionText: "Updated Question",
        points: 10,
      };
      const req = {
        params: { id: "q1" },
        body: { questionText: "Updated Question", points: 10 },
      };
      const res = mockResponse();

      questionService.updateQuestion = jest.fn().mockResolvedValue(mockQuestion);

      await updateQuestion(req, res);

      expect(questionService.updateQuestion).toHaveBeenCalledWith("q1", {
        questionText: "Updated Question",
        points: 10,
      });
      expect(res.success).toHaveBeenCalledWith(
        "Question updated successfully",
        mockQuestion
      );
    });
  });

  // ─── deleteQuestion ────────────────────────────────────────────────────

  describe("deleteQuestion", () => {
    it("should delete question successfully", async () => {
      const req = { params: { id: "q1" } };
      const res = mockResponse();

      questionService.deleteQuestion = jest.fn().mockResolvedValue();

      await deleteQuestion(req, res);

      expect(questionService.deleteQuestion).toHaveBeenCalledWith("q1");
      expect(res.success).toHaveBeenCalledWith("Question deleted successfully");
    });
  });
});

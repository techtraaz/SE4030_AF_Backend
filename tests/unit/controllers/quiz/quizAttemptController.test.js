jest.mock("../../../../src/service/quiz/quizAttemptService.js");

import * as quizAttemptService from "../../../../src/service/quiz/quizAttemptService.js";
import {
  submitQuizAttempt,
  getAttemptById,
  getUserQuizAttempts,
  getQuizStatistics,
} from "../../../../src/controller/quiz/quizAttemptController.js";

const mockResponse = () => {
  const res = {};
  res.created = jest.fn().mockReturnValue(res);
  res.success = jest.fn().mockReturnValue(res);
  res.badRequest = jest.fn().mockReturnValue(res);
  res.notFound = jest.fn().mockReturnValue(res);
  res.error = jest.fn().mockReturnValue(res);
  return res;
};

describe("quizAttemptController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── submitQuizAttempt ─────────────────────────────────────────────────

  describe("submitQuizAttempt", () => {
    it("should submit quiz attempt successfully", async () => {
      const mockAttempt = {
        _id: "attempt1",
        quizId: "quiz123",
        refugeeId: "refugee1",
        score: 80,
        passed: true,
      };
      const req = {
        body: {
          quizId: "quiz123",
          refugeeId: "refugee1",
          responses: [
            { questionId: "q1", selectedOptionIds: ["opt1"] },
          ],
        },
      };
      const res = mockResponse();

      quizAttemptService.submitQuizAttempt = jest
        .fn()
        .mockResolvedValue(mockAttempt);

      await submitQuizAttempt(req, res);

      expect(quizAttemptService.submitQuizAttempt).toHaveBeenCalledWith(
        req.body
      );
      expect(res.created).toHaveBeenCalledWith(
        "Quiz attempt submitted successfully",
        mockAttempt
      );
    });
  });

  // ─── getAttemptById ────────────────────────────────────────────────────

  describe("getAttemptById", () => {
    it("should retrieve attempt with responses", async () => {
      const mockResult = {
        attempt: {
          _id: "attempt1",
          score: 80,
        },
        responses: [
          { questionId: "q1", selectedOptionIds: ["opt1"], isCorrect: true },
        ],
      };
      const req = { params: { id: "attempt1" } };
      const res = mockResponse();

      quizAttemptService.getAttemptWithResponses = jest
        .fn()
        .mockResolvedValue(mockResult);

      await getAttemptById(req, res);

      expect(quizAttemptService.getAttemptWithResponses).toHaveBeenCalledWith(
        "attempt1"
      );
      expect(res.success).toHaveBeenCalledWith(
        "Attempt retrieved successfully",
        mockResult
      );
    });
  });

  // ─── getUserQuizAttempts ───────────────────────────────────────────────

  describe("getUserQuizAttempts", () => {
    it("should retrieve all attempts for a user and quiz", async () => {
      const mockAttempts = [
        { _id: "attempt1", score: 80 },
        { _id: "attempt2", score: 90 },
      ];
      const req = {
        params: { refugeeId: "refugee1" },
        query: { quizId: "quiz123" },
      };
      const res = mockResponse();

      quizAttemptService.getUserQuizAttempts = jest
        .fn()
        .mockResolvedValue(mockAttempts);

      await getUserQuizAttempts(req, res);

      expect(quizAttemptService.getUserQuizAttempts).toHaveBeenCalledWith(
        "refugee1",
        "quiz123"
      );
      expect(res.success).toHaveBeenCalledWith(
        "User attempts retrieved successfully",
        mockAttempts
      );
    });
  });

  // ─── getQuizStatistics ─────────────────────────────────────────────────

  describe("getQuizStatistics", () => {
    it("should retrieve quiz statistics", async () => {
      const mockStats = {
        totalAttempts: 50,
        averageScore: 75,
        passRate: 80,
        highestScore: 100,
        lowestScore: 40,
      };
      const req = { params: { quizId: "quiz123" } };
      const res = mockResponse();

      quizAttemptService.getQuizStatistics = jest
        .fn()
        .mockResolvedValue(mockStats);

      await getQuizStatistics(req, res);

      expect(quizAttemptService.getQuizStatistics).toHaveBeenCalledWith(
        "quiz123"
      );
      expect(res.success).toHaveBeenCalledWith(
        "Quiz statistics retrieved successfully",
        mockStats
      );
    });
  });
});

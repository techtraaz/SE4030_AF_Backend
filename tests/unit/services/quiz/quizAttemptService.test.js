// Mock models
jest.mock("../../../../src/models/quiz/QuizAttempt.js");
jest.mock("../../../../src/models/quiz/QuizResponse.js");
jest.mock("../../../../src/models/quiz/Quiz.js");
jest.mock("../../../../src/models/quiz/Question.js");
jest.mock("../../../../src/models/quiz/Option.js");

import QuizAttempt from "../../../../src/models/quiz/QuizAttempt.js";
import QuizResponse from "../../../../src/models/quiz/QuizResponse.js";
import Quiz from "../../../../src/models/quiz/Quiz.js";
import Question from "../../../../src/models/quiz/Question.js";
import Option from "../../../../src/models/quiz/Option.js";

import {
  submitQuizAttempt,
  getAttemptById,
  getUserQuizAttempts,
  getQuizStatistics,
} from "../../../../src/service/quiz/quizAttemptService.js";

describe("quizAttemptService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── submitQuizAttempt ─────────────────────────────────────────────────

  describe("submitQuizAttempt", () => {
    const mockQuiz = {
      _id: "quiz1",
      isPublished: true,
      passingScore: 60,
      timeLimit: null,
      maxAttempts: null,
    };

    const mockQuestions = [
      { _id: "q1", points: 10, type: "multiple_choice" },
      { _id: "q2", points: 10, type: "multiple_choice" },
    ];

    it("should successfully submit a quiz attempt with correct scoring", async () => {
      const attemptData = {
        refugeeId: "user1",
        quizId: "quiz1",
        responses: [
          { questionId: "q1", selectedOptionId: "opt1" },
          { questionId: "q2", selectedOptionId: "opt3" },
        ],
        timeTakenSeconds: 120,
      };

      Quiz.findById.mockResolvedValue(mockQuiz);
      QuizAttempt.countDocuments.mockResolvedValue(0);
      Question.find.mockResolvedValue(mockQuestions);
      
      // Mock options - first question correct, second incorrect
      Option.findById
        .mockResolvedValueOnce({ _id: "opt1", isCorrect: true, questionId: "q1" })
        .mockResolvedValueOnce({ _id: "opt3", isCorrect: false, questionId: "q2" });

      const createdAttempt = {
        _id: "attempt1",
        refugeeId: "user1",
        quizId: "quiz1",
        score: 50, // 10/20 points = 50%
        totalQuestions: 2,
        correctAnswers: 1,
        passed: false, // 50% < 60% passing score
        timeTakenSeconds: 120,
      };

      QuizAttempt.create.mockResolvedValue(createdAttempt);
      QuizResponse.insertMany.mockResolvedValue([]);

      const result = await submitQuizAttempt(attemptData);

      expect(Quiz.findById).toHaveBeenCalledWith("quiz1");
      expect(Question.find).toHaveBeenCalledWith({ quizId: "quiz1" });
      expect(QuizAttempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          refugeeId: "user1",
          quizId: "quiz1",
          score: 50,
          correctAnswers: 1,
          passed: false,
        })
      );
      expect(result).toEqual(createdAttempt);
    });

    it("should throw error if quiz is not published", async () => {
      Quiz.findById.mockResolvedValue({ ...mockQuiz, isPublished: false });

      await expect(
        submitQuizAttempt({
          refugeeId: "user1",
          quizId: "quiz1",
          responses: [],
        })
      ).rejects.toThrow("Cannot attempt unpublished quiz");
    });

    it("should throw error if max attempts exceeded", async () => {
      Quiz.findById.mockResolvedValue({ ...mockQuiz, maxAttempts: 2 });
      QuizAttempt.countDocuments.mockResolvedValue(2); // Already 2 attempts

      await expect(
        submitQuizAttempt({
          refugeeId: "user1",
          quizId: "quiz1",
          responses: [],
        })
      ).rejects.toThrow("Maximum attempts (2) reached for this quiz");
    });

    it("should throw error if time limit exceeded", async () => {
      Quiz.findById.mockResolvedValue({ ...mockQuiz, timeLimit: 5 }); // 5 minutes
      QuizAttempt.countDocuments.mockResolvedValue(0);

      await expect(
        submitQuizAttempt({
          refugeeId: "user1",
          quizId: "quiz1",
          responses: [],
          timeTakenSeconds: 400, // 6+ minutes
        })
      ).rejects.toThrow("Time limit exceeded");
    });
  });

  // ─── getAttemptById ────────────────────────────────────────────────────

  describe("getAttemptById", () => {
    it("should return attempt with populated fields", async () => {
      const mockAttempt = {
        _id: "attempt1",
        refugeeId: { email: "user@test.com" },
        quizId: { title: "Test Quiz" },
        populate: jest.fn().mockReturnThis(),
      };

      QuizAttempt.findById.mockReturnValue(mockAttempt);

      const result = await getAttemptById("attempt1");

      expect(QuizAttempt.findById).toHaveBeenCalledWith("attempt1");
      expect(mockAttempt.populate).toHaveBeenCalled();
      expect(result).toEqual(mockAttempt);
    });
  });

  // ─── getUserQuizAttempts ───────────────────────────────────────────────

  describe("getUserQuizAttempts", () => {
    it("should return all attempts for a user with optional quiz filter", async () => {
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      };
      QuizAttempt.find.mockReturnValue(mockChain);

      await getUserQuizAttempts("user1", "quiz1");

      expect(QuizAttempt.find).toHaveBeenCalledWith({
        refugeeId: "user1",
        quizId: "quiz1",
      });
      expect(mockChain.sort).toHaveBeenCalledWith({ attemptedAt: -1 });
    });
  });

  // ─── getQuizStatistics ─────────────────────────────────────────────────

  describe("getQuizStatistics", () => {
    it("should return statistics for a quiz with attempts", async () => {
      const mockAttempts = [
        { score: 80, passed: true },
        { score: 90, passed: true },
        { score: 50, passed: false },
        { score: 70, passed: true },
      ];

      QuizAttempt.find.mockResolvedValue(mockAttempts);

      const result = await getQuizStatistics("quiz1");

      expect(result).toEqual({
        totalAttempts: 4,
        averageScore: 73, // (80+90+50+70)/4 = 72.5, rounds to 73
        passRate: 75, // 3/4 = 75%
        highestScore: 90,
        lowestScore: 50,
      });
    });
  });
});

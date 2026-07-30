jest.mock("../../../../src/models/quiz/Option.js");
jest.mock("../../../../src/models/quiz/Question.js");
jest.mock("../../../../src/models/quiz/Quiz.js");

import Option from "../../../../src/models/quiz/Option.js";
import Question from "../../../../src/models/quiz/Question.js";
import Quiz from "../../../../src/models/quiz/Quiz.js";
import {
  createOption,
  getOptionsByQuestion,
  updateOption,
  deleteOption,
} from "../../../../src/service/quiz/optionService.js";

describe("optionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createOption ──────────────────────────────────────────────────────

  describe("createOption", () => {
    it("should create option successfully", async () => {
      const mockQuestion = { _id: "q1", quizId: "quiz123", type: "multiple_choice" };
      const mockQuiz = { _id: "quiz123", isPublished: false };
      const mockOption = {
        _id: "opt1",
        questionId: "q1",
        optionText: "Option A",
        isCorrect: false,
      };

      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);
      Option.findOne = jest.fn().mockResolvedValue(null);
      Option.create = jest.fn().mockResolvedValue(mockOption);

      const result = await createOption({
        questionId: "q1",
        optionText: "Option A",
        isCorrect: false,
      });

      expect(Question.findById).toHaveBeenCalledWith("q1");
      expect(Quiz.findById).toHaveBeenCalledWith("quiz123");
      expect(Option.create).toHaveBeenCalled();
      expect(result).toEqual(mockOption);
    });

    it("should throw error if question not found", async () => {
      Question.findById = jest.fn().mockResolvedValue(null);

      await expect(
        createOption({
          questionId: "nonexistent",
          optionText: "Option",
        })
      ).rejects.toThrow("Question not found");
    });

    it("should throw error if quiz is published", async () => {
      const mockQuestion = { _id: "q1", quizId: "quiz123" };
      const mockQuiz = { _id: "quiz123", isPublished: true };

      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);

      await expect(
        createOption({
          questionId: "q1",
          optionText: "Option",
        })
      ).rejects.toThrow("Cannot add options to questions in a published quiz");
    });
  });

  // ─── getOptionsByQuestion ──────────────────────────────────────────────

  describe("getOptionsByQuestion", () => {
    it("should retrieve all options for a question", async () => {
      const mockOptions = [
        { _id: "opt1", optionText: "A", isCorrect: true },
        { _id: "opt2", optionText: "B", isCorrect: false },
        { _id: "opt3", optionText: "C", isCorrect: false },
      ];

      Option.find = jest.fn().mockResolvedValue(mockOptions);

      const result = await getOptionsByQuestion("q1");

      expect(Option.find).toHaveBeenCalledWith({ questionId: "q1" });
      expect(result).toEqual(mockOptions);
    });
  });

  // ─── updateOption ──────────────────────────────────────────────────────

  describe("updateOption", () => {
    it("should update option successfully", async () => {
      const updatedOption = {
        _id: "opt1",
        questionId: "q1",
        optionText: "Updated Text",
        isCorrect: true,
      };

      Option.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedOption);

      const result = await updateOption("opt1", {
        optionText: "Updated Text",
        isCorrect: true,
      });

      expect(Option.findByIdAndUpdate).toHaveBeenCalledWith(
        "opt1",
        { optionText: "Updated Text", isCorrect: true },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updatedOption);
    });

    it("should throw error if option not found", async () => {
      Option.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await expect(
        updateOption("nonexistent", { optionText: "New Text" })
      ).rejects.toThrow("Option not found");
    });
  });

  // ─── deleteOption ──────────────────────────────────────────────────────

  describe("deleteOption", () => {
    it("should delete option successfully", async () => {
      const mockOption = {
        _id: "opt1",
        questionId: "q1",
        optionText: "Option A",
        isCorrect: false,
      };
      const mockQuestion = { _id: "q1", quizId: "quiz123" };
      const mockQuiz = { _id: "quiz123", isPublished: false };

      Option.findById = jest.fn().mockResolvedValue(mockOption);
      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);
      Option.findByIdAndDelete = jest.fn().mockResolvedValue(mockOption);

      const result = await deleteOption("opt1");

      expect(Option.findByIdAndDelete).toHaveBeenCalledWith("opt1");
      expect(result).toEqual(mockOption);
    });

    it("should throw error if quiz is published", async () => {
      const mockOption = { _id: "opt1", questionId: "q1", isCorrect: false };
      const mockQuestion = { _id: "q1", quizId: "quiz123" };
      const mockQuiz = { _id: "quiz123", isPublished: true };

      Option.findById = jest.fn().mockResolvedValue(mockOption);
      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);

      await expect(deleteOption("opt1")).rejects.toThrow(
        "Cannot delete options from questions in a published quiz"
      );
    });

    it("should prevent deleting the last correct option", async () => {
      const mockOption = { _id: "opt1", questionId: "q1", isCorrect: true };
      const mockQuestion = { _id: "q1", quizId: "quiz123" };
      const mockQuiz = { _id: "quiz123", isPublished: false };

      Option.findById = jest.fn().mockResolvedValue(mockOption);
      Question.findById = jest.fn().mockResolvedValue(mockQuestion);
      Quiz.findById = jest.fn().mockResolvedValue(mockQuiz);
      Option.countDocuments = jest.fn().mockResolvedValue(1);

      await expect(deleteOption("opt1")).rejects.toThrow(
        "Cannot delete the last correct option"
      );
    });
  });
});

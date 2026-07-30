jest.mock("../../../../src/service/quiz/optionService.js");

import * as optionService from "../../../../src/service/quiz/optionService.js";
import {
  createOption,
  getOptionsByQuestion,
  updateOption,
  deleteOption,
} from "../../../../src/controller/quiz/optionController.js";

const mockResponse = () => {
  const res = {};
  res.created = jest.fn().mockReturnValue(res);
  res.success = jest.fn().mockReturnValue(res);
  res.badRequest = jest.fn().mockReturnValue(res);
  res.notFound = jest.fn().mockReturnValue(res);
  res.error = jest.fn().mockReturnValue(res);
  return res;
};

describe("optionController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createOption ──────────────────────────────────────────────────────

  describe("createOption", () => {
    it("should create option successfully", async () => {
      const mockOption = {
        _id: "opt1",
        questionId: "q1",
        optionText: "Option A",
        isCorrect: true,
      };
      const req = {
        body: {
          questionId: "q1",
          optionText: "Option A",
          isCorrect: true,
        },
      };
      const res = mockResponse();

      optionService.createOption = jest.fn().mockResolvedValue(mockOption);

      await createOption(req, res);

      expect(optionService.createOption).toHaveBeenCalledWith(req.body);
      expect(res.created).toHaveBeenCalledWith(
        "Option created successfully",
        mockOption
      );
    });
  });

  // ─── getOptionsByQuestion ──────────────────────────────────────────────

  describe("getOptionsByQuestion", () => {
    it("should retrieve options for a question", async () => {
      const mockOptions = [
        { _id: "opt1", optionText: "A", isCorrect: true },
        { _id: "opt2", optionText: "B", isCorrect: false },
      ];
      const req = { params: { questionId: "q1" } };
      const res = mockResponse();

      optionService.getOptionsByQuestion = jest
        .fn()
        .mockResolvedValue(mockOptions);

      await getOptionsByQuestion(req, res);

      expect(optionService.getOptionsByQuestion).toHaveBeenCalledWith("q1");
      expect(res.success).toHaveBeenCalledWith(
        "Options retrieved successfully",
        mockOptions
      );
    });
  });

  // ─── updateOption ──────────────────────────────────────────────────────

  describe("updateOption", () => {
    it("should update option successfully", async () => {
      const mockOption = {
        _id: "opt1",
        optionText: "Updated Option",
        isCorrect: true,
      };
      const req = {
        params: { id: "opt1" },
        body: { optionText: "Updated Option", isCorrect: true },
      };
      const res = mockResponse();

      optionService.updateOption = jest.fn().mockResolvedValue(mockOption);

      await updateOption(req, res);

      expect(optionService.updateOption).toHaveBeenCalledWith("opt1", {
        optionText: "Updated Option",
        isCorrect: true,
      });
      expect(res.success).toHaveBeenCalledWith(
        "Option updated successfully",
        mockOption
      );
    });
  });

  // ─── deleteOption ──────────────────────────────────────────────────────

  describe("deleteOption", () => {
    it("should delete option successfully", async () => {
      const req = { params: { id: "opt1" } };
      const res = mockResponse();

      optionService.deleteOption = jest.fn().mockResolvedValue();

      await deleteOption(req, res);

      expect(optionService.deleteOption).toHaveBeenCalledWith("opt1");
      expect(res.success).toHaveBeenCalledWith("Option deleted successfully");
    });
  });
});

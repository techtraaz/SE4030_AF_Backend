jest.mock("../../../../src/service/quiz/distractorService.js");

import * as distractorService from "../../../../src/service/quiz/distractorService.js";
import {
  generateDistractors,
  generateHints,
  getEducationalContext,
} from "../../../../src/controller/quiz/distractorController.js";

const mockResponse = () => {
  const res = {};
  res.success = jest.fn().mockReturnValue(res);
  res.badRequest = jest.fn().mockReturnValue(res);
  res.error = jest.fn().mockReturnValue(res);
  return res;
};

describe("distractorController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── generateDistractors ───────────────────────────────────────────────

  describe("generateDistractors", () => {
    it("should generate distractors successfully", async () => {
      const mockDistractors = ["Glad", "Cheerful", "Joyful"];
      const req = {
        body: {
          correctAnswer: "Happy",
          count: 3,
        },
      };
      const res = mockResponse();

      distractorService.generateDistractors = jest
        .fn()
        .mockResolvedValue(mockDistractors);

      await generateDistractors(req, res);

      expect(distractorService.generateDistractors).toHaveBeenCalledWith(
        "Happy",
        3
      );
      expect(res.success).toHaveBeenCalledWith(
        "Distractors generated successfully",
        {
          correctAnswer: "Happy",
          distractors: mockDistractors,
          count: 3,
        }
      );
    });
  });

  // ─── generateHints ─────────────────────────────────────────────────────

  describe("generateHints", () => {
    it("should generate hints successfully", async () => {
      const mockHints = ["cheerful", "glad", "joyful"];
      const req = {
        body: {
          correctAnswer: "Happy",
          maxHints: 3,
        },
      };
      const res = mockResponse();

      distractorService.generateHints = jest.fn().mockResolvedValue(mockHints);

      await generateHints(req, res);

      expect(distractorService.generateHints).toHaveBeenCalledWith("Happy", 3);
      expect(res.success).toHaveBeenCalledWith("Hints generated successfully", {
        hints: mockHints,
        hintText: "This word is related to: cheerful, glad, joyful",
      });
    });
  });

  // ─── getEducationalContext ─────────────────────────────────────────────

  describe("getEducationalContext", () => {
    it("should retrieve educational context for a word", async () => {
      const mockContext = {
        word: "happy",
        synonyms: ["cheerful", "glad", "joyful"],
        related: ["smile", "laugh", "joy"],
      };
      const req = {
        params: {
          word: "happy",
        },
      };
      const res = mockResponse();

      distractorService.getEducationalContext = jest
        .fn()
        .mockResolvedValue(mockContext);

      await getEducationalContext(req, res);

      expect(distractorService.getEducationalContext).toHaveBeenCalledWith(
        "happy"
      );
      expect(res.success).toHaveBeenCalledWith(
        "Educational context retrieved successfully",
        mockContext
      );
    });
  });
});

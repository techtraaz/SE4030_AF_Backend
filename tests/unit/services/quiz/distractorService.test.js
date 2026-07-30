// Mock axios for Datamuse API calls
jest.mock("axios");

import axios from "axios";
import {
  generateDistractors,
  generateHints,
  getEducationalContext,
} from "../../../../src/service/quiz/distractorService.js";

describe("distractorService - Third-Party API Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── generateDistractors ───────────────────────────────────────────────

  describe("generateDistractors", () => {
    it("should generate distractors from Datamuse API", async () => {
      const mockSynonyms = [
        { word: "cheerful" },
        { word: "glad" },
        { word: "joyful" },
      ];

      axios.get
        .mockResolvedValueOnce({ data: mockSynonyms })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });

      const result = await generateDistractors("happy", 3);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result).not.toContain("happy");
    });

    it("should validate empty correct answer", async () => {
      await expect(generateDistractors("", 3)).rejects.toThrow(
        "Correct answer cannot be empty"
      );
    });

    it("should handle API errors", async () => {
      axios.get.mockRejectedValue(new Error("API error"));

      await expect(generateDistractors("test", 3)).rejects.toThrow();
    });
  });

  // ─── generateHints ─────────────────────────────────────────────────────

  describe("generateHints", () => {
    it("should generate hints", async () => {
      const mockHints = [{ word: "cheerful" }, { word: "glad" }];

      axios.get
        .mockResolvedValueOnce({ data: mockHints })
        .mockResolvedValueOnce({ data: [] });

      const result = await generateHints("happy", 3);

      expect(result).toBeInstanceOf(Array);
      expect(result).not.toContain("happy");
    });

    it("should return fallback hint when API fails", async () => {
      axios.get
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: [] });

      const result = await generateHints("test", 3);

      expect(result).toEqual(["Think about the meaning of the question"]);
    });
  });

  // ─── getEducationalContext ──────────────────────────────────────────────

  describe("getEducationalContext", () => {
    it("should return educational context", async () => {
      const mockSynonyms = [{ word: "joyful" }];
      const mockRelated = [{ word: "smile" }];

      axios.get
        .mockResolvedValueOnce({ data: mockSynonyms })
        .mockResolvedValueOnce({ data: mockRelated });

      const result = await getEducationalContext("happy");

      expect(result).toHaveProperty("word", "happy");
      expect(result).toHaveProperty("synonyms");
      expect(result).toHaveProperty("related");
    });

    it("should validate word parameter", async () => {
      await expect(getEducationalContext("")).rejects.toThrow(
        "Word cannot be empty"
      );
    });
  });
});

jest.mock("../../../../src/models/content/contentModel.js");

import { DigitalContent } from "../../../../src/models/content/contentModel.js";
import * as contentService from "../../../../src/service/content/contentService.js";

describe("contentService", () => {
  // ─── createContent ───────────────────────────────────────────────────────
  describe("createContent", () => {
    it("should save and return a new digital content", async () => {
      const contentData = { title: "Test Video", category: "Education" };
      const savedContent = { _id: "doc1", ...contentData };
      
      // Mock the constructor and save instance method
      DigitalContent.mockImplementation(() => {
        return {
          save: jest.fn().mockResolvedValue(savedContent),
        };
      });

      const result = await contentService.createContent(contentData);
      expect(result).toEqual(savedContent);
    });
  });

  // ─── getAllContent ──────────────────────────────────────────────────────
  describe("getAllContent", () => {
    it("should return all content sorted by createdAt desc", async () => {
      const contents = [{ title: "Doc 1" }, { title: "Doc 2" }];
      const sortMock = jest.fn().mockResolvedValue(contents);
      DigitalContent.find.mockReturnValue({ sort: sortMock });

      const result = await contentService.getAllContent({ category: "Math" });
      expect(DigitalContent.find).toHaveBeenCalledWith({ category: "Math" });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(contents);
    });

    it("should return content without filter when none provided", async () => {
      const sortMock = jest.fn().mockResolvedValue([]);
      DigitalContent.find.mockReturnValue({ sort: sortMock });

      await contentService.getAllContent();
      expect(DigitalContent.find).toHaveBeenCalledWith({});
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  // ─── getContentById ──────────────────────────────────────────────────────
  describe("getContentById", () => {
    it("should return the document when found", async () => {
      const content = { _id: "doc1", title: "Test" };
      DigitalContent.findById.mockResolvedValue(content);

      const result = await contentService.getContentById("doc1");
      expect(DigitalContent.findById).toHaveBeenCalledWith("doc1");
      expect(result).toEqual(content);
    });

    it("should return null when not found", async () => {
      DigitalContent.findById.mockResolvedValue(null);
      const result = await contentService.getContentById("missing");
      expect(result).toBeNull();
    });
  });

  // ─── updateContentById ───────────────────────────────────────────────────────
  describe("updateContentById", () => {
    it("should update and return the content", async () => {
      const updated = { _id: "doc1", title: "Updated" };
      DigitalContent.findByIdAndUpdate.mockResolvedValue(updated);

      const result = await contentService.updateContentById("doc1", { title: "Updated" });
      expect(DigitalContent.findByIdAndUpdate).toHaveBeenCalledWith(
        "doc1",
        { title: "Updated" },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(updated);
    });
  });

  // ─── deleteContentById ───────────────────────────────────────────────────────
  describe("deleteContentById", () => {
    it("should delete and return the content", async () => {
      const content = { _id: "doc1" };
      DigitalContent.findByIdAndDelete.mockResolvedValue(content);

      const result = await contentService.deleteContentById("doc1");
      expect(DigitalContent.findByIdAndDelete).toHaveBeenCalledWith("doc1");
      expect(result).toEqual(content);
    });
  });
});

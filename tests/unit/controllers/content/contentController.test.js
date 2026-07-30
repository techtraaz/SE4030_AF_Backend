jest.mock("../../../../src/service/content/contentService.js");
jest.mock("cloudinary");

import * as contentService from "../../../../src/service/content/contentService.js";
import {
  createContent,
  getAllContent,
  updateContent
} from "../../../../src/controller/content/contentController.js";

import { v2 as cloudinary } from "cloudinary";

describe("contentController", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { _id: "userId123" },
      file: undefined,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ─── createContent ───────────────────────────────────────────────────────
  describe("createContent", () => {
    it("should created new content successfully", async () => {
      req.file = {
        path: "http://example.com/file.mp4",
        filename: "cloud123",
      };
      req.body = {
        title: "Test Title",
        description: "Test Description",
        category: "Math",
        contentType: "video",
      };

      const newContent = { _id: "doc1", ...req.body };
      contentService.createContent.mockResolvedValue(newContent);

      await createContent(req, res, next);

      expect(contentService.createContent).toHaveBeenCalledWith({
        uploaderId: "userId123",
        title: "Test Title",
        description: "Test Description",
        category: "Math",
        contentType: "video",
        fileUrl: "http://example.com/file.mp4",
        cloudinaryId: "cloud123",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: newContent,
        message: "Digital content created successfully.",
      });
    });

    it("should call next(error) on service failure", async () => {
      req.file = { path: "url", filename: "id" };
      const error = new Error("DB Error");
      contentService.createContent.mockRejectedValue(error);

      await createContent(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ─── getAllContent ──────────────────────────────────────────────────────
  describe("getAllContent", () => {
    it("should get all content and respect category query", async () => {
      req.query = { category: "Science" };
      const contents = [{ title: "A" }];
      contentService.getAllContent.mockResolvedValue(contents);

      await getAllContent(req, res, next);
      expect(contentService.getAllContent).toHaveBeenCalledWith({ category: "Science" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: contents,
      });
    });
  });

  // ─── updateContent ───────────────────────────────────────────────────────
  describe("updateContent", () => {
    it("should return 404 if content does not exist", async () => {
      req.params = { id: "doc1" };
      contentService.getContentById.mockResolvedValue(null);

      await updateContent(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Content not found.",
      });
    });

    it("should return 403 if user is not the uploader", async () => {
      req.params = { id: "doc1" };
      contentService.getContentById.mockResolvedValue({
        _id: "doc1",
        uploaderId: "differentUser"
      });

      await updateContent(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Access Denied: You do not have permission to modify another user's content."
      }));
    });
  });
});

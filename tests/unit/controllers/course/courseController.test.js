/**
 * Unit Tests - Course Controller
 * Tests endpoint handlers
 */

import * as courseController from "../../../../src/controller/course/courseController.js";
import * as courseService from "../../../../src/service/course/courseService.js";

// Mock dependencies
jest.mock("../../../../src/service/course/courseService.js");

// Helper to create mock response
const mockResponse = () => {
  const res = {};
  res.created = jest.fn().mockReturnValue(res);
  res.success = jest.fn().mockReturnValue(res);
  res.badRequest = jest.fn().mockReturnValue(res);
  res.notFound = jest.fn().mockReturnValue(res);
  res.error = jest.fn().mockReturnValue(res);
  return res;
};

describe("Course Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── CREATE COURSE ──────────────────────────────────────────────────────

  describe("createCourse", () => {
    it("should create course and return 201", async () => {
      const req = {
        body: {
          title: "JavaScript Basics",
          description: "Learn JS",
          level: "Beginner",
          createdById: "user123",
          categoryId: "cat123",
        },
      };
      const res = mockResponse();

      const mockCourse = { _id: "course123", title: "JavaScript Basics" };
      courseService.createCourse.mockResolvedValue(mockCourse);

      await courseController.createCourse(req, res);

      expect(courseService.createCourse).toHaveBeenCalledWith(req.body);
      expect(res.created).toHaveBeenCalledWith(
        "Course created successfully",
        mockCourse
      );
    });
  });

  // ─── GET ALL COURSES ────────────────────────────────────────────────────

  describe("getAllCourses", () => {
    it("should return all courses", async () => {
      const req = { query: {} };
      const res = mockResponse();

      const mockCourses = [{ _id: "1", title: "Course 1" }];
      courseService.getAllCourses.mockResolvedValue(mockCourses);

      await courseController.getAllCourses(req, res);

      expect(res.success).toHaveBeenCalledWith(
        "Courses retrieved successfully",
        mockCourses
      );
    });
  });

  // ─── GET COURSE BY ID ───────────────────────────────────────────────────

  describe("getCourseById", () => {
    it("should return course by ID", async () => {
      const req = { params: { id: "course123" } };
      const res = mockResponse();

      const mockCourse = { _id: "course123", title: "Test Course" };
      courseService.getCourseById.mockResolvedValue(mockCourse);

      await courseController.getCourseById(req, res);

      expect(res.success).toHaveBeenCalledWith(
        "Course retrieved successfully",
        mockCourse
      );
    });
  });

  // ─── UPDATE COURSE ──────────────────────────────────────────────────────

  describe("updateCourse", () => {
    it("should update course successfully", async () => {
      const req = {
        params: { id: "course123" },
        body: { title: "Updated Title" },
      };
      const res = mockResponse();

      const mockCourse = { _id: "course123", title: "Updated Title" };
      courseService.updateCourse.mockResolvedValue(mockCourse);

      await courseController.updateCourse(req, res);

      expect(res.success).toHaveBeenCalledWith(
        "Course updated successfully",
        mockCourse
      );
    });
  });

  // ─── DELETE COURSE ──────────────────────────────────────────────────────

  describe("deleteCourse", () => {
    it("should delete course successfully", async () => {
      const req = { params: { id: "course123" } };
      const res = mockResponse();

      courseService.deleteCourse.mockResolvedValue();

      await courseController.deleteCourse(req, res);

      expect(res.success).toHaveBeenCalledWith("Course deleted successfully");
    });
  });

  // ─── PUBLISH COURSE ─────────────────────────────────────────────────────

  describe("publishCourse", () => {
    it("should publish course successfully", async () => {
      const req = { params: { id: "course123" } };
      const res = mockResponse();

      const mockCourse = { _id: "course123", isPublished: true };
      courseService.publishCourse.mockResolvedValue(mockCourse);

      await courseController.publishCourse(req, res);

      expect(res.success).toHaveBeenCalledWith(
        "Course published successfully",
        mockCourse
      );
    });
  });
});

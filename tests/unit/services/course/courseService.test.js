/**
 * Unit Tests - Course Service
 * Tests core CRUD operations and business logic
 */

import mongoose from "mongoose";
import * as courseService from "../../../../src/service/course/courseService.js";
import Course from "../../../../src/models/course/Course.js";
import Category from "../../../../src/models/lesson/category.js";
import User from "../../../../src/models/auth/user.js";

// Mock dependencies
jest.mock("../../../../src/models/course/Course.js");
jest.mock("../../../../src/models/lesson/category.js");
jest.mock("../../../../src/models/auth/user.js");

// Helper to create valid MongoDB ObjectIds
const validObjectId = () => new mongoose.Types.ObjectId().toString();

describe("Course Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── CREATE COURSE ──────────────────────────────────────────────────────

  describe("createCourse", () => {
    it("should create a course successfully", async () => {
      const userId = validObjectId();
      const categoryId = validObjectId();
      const courseId = validObjectId();
      
      const mockUser = { _id: userId, role: "CONTENT_CONTRIBUTOR" };
      const mockCategory = { _id: categoryId, name: "Programming" };
      const mockCourse = {
        _id: courseId,
        title: "JavaScript Basics",
        description: "Learn JavaScript fundamentals",
        populate: jest.fn().mockResolvedValue({
          _id: courseId,
          title: "JavaScript Basics",
          createdById: mockUser,
          categoryId: mockCategory,
        }),
      };

      User.findById.mockResolvedValue(mockUser);
      Category.findById.mockResolvedValue(mockCategory);
      Course.findOne.mockResolvedValue(null);
      Course.create.mockResolvedValue(mockCourse);

      const courseData = {
        title: "JavaScript Basics",
        description: "Learn JavaScript fundamentals",
        level: "Beginner",
        createdById: userId,
        categoryId: categoryId,
      };

      const result = await courseService.createCourse(courseData);

      expect(result.title).toBe("JavaScript Basics");
      expect(Course.create).toHaveBeenCalledWith(courseData);
    });

    it("should validate required fields", async () => {
      await expect(
        courseService.createCourse({ title: "" })
      ).rejects.toThrow("Course title is required");
    });

    it("should prevent duplicate titles", async () => {
      const userId = validObjectId();
      const categoryId = validObjectId();
      
      const mockUser = { _id: userId, role: "CONTENT_CONTRIBUTOR" };
      const mockCategory = { _id: categoryId, name: "Programming" };

      User.findById.mockResolvedValue(mockUser);
      Category.findById.mockResolvedValue(mockCategory);
      Course.findOne.mockResolvedValue({ title: "Existing Course" });

      await expect(
        courseService.createCourse({
          title: "Existing Course",
          description: "Test description",
          level: "Beginner",
          createdById: userId,
          categoryId: categoryId,
        })
      ).rejects.toThrow("You already have a course with this title");
    });
  });

  // ─── GET ALL COURSES ────────────────────────────────────────────────────

  describe("getAllCourses", () => {
    it("should return all courses with pagination", async () => {
      const mockCourses = [
        { _id: "1", title: "Course 1", isPublished: true },
        { _id: "2", title: "Course 2", isPublished: false },
      ];

      // Create a chained mock for .find().sort().populate().populate().populate().populate()
      const populate4 = jest.fn().mockResolvedValue(mockCourses);
      const populate3 = jest.fn().mockReturnValue({ populate: populate4 });
      const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
      const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
      const sort = jest.fn().mockReturnValue({ populate: populate1 });
      Course.find.mockReturnValue({ sort });

      const result = await courseService.getAllCourses({});

      expect(result).toEqual(mockCourses);
      expect(Course.find).toHaveBeenCalledWith({});
    });
  });

  // ─── GET COURSE BY ID ───────────────────────────────────────────────────

  describe("getCourseById", () => {
    it("should return course by ID", async () => {
      const courseId = validObjectId();
      
      const mockCourse = {
        _id: courseId,
        title: "Test Course",
      };

      // Chain .findById().populate().populate().populate().populate()
      const populate4 = jest.fn().mockResolvedValue(mockCourse);
      const populate3 = jest.fn().mockReturnValue({ populate: populate4 });
      const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
      const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
      Course.findById.mockReturnValue({ populate: populate1 });

      const result = await courseService.getCourseById(courseId);

      expect(result.title).toBe("Test Course");
      expect(Course.findById).toHaveBeenCalledWith(courseId);
    });
  });

  // ─── UPDATE COURSE ──────────────────────────────────────────────────────

  describe("updateCourse", () => {
    it("should update course successfully", async () => {
      const courseId = validObjectId();
      
      const mockCourse = {
        _id: courseId,
        title: "Old Title",
        isPublished: false,
      };

      const updatedCourse = {
        _id: courseId,
        description: "Updated Description",
      };

      Course.findById.mockResolvedValue(mockCourse);
      
      // Chain for findByIdAndUpdate().populate().populate().populate().populate()
      const populate4 = jest.fn().mockResolvedValue(updatedCourse);
      const populate3 = jest.fn().mockReturnValue({ populate: populate4 });
      const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
      const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
      Course.findByIdAndUpdate.mockReturnValue({ populate: populate1 });

      const result = await courseService.updateCourse(courseId, {
        description: "Updated Description",
      });

      expect(Course.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.description).toBe("Updated Description");
    });
  });

  // ─── DELETE COURSE ──────────────────────────────────────────────────────

  describe("deleteCourse", () => {
    it("should delete course successfully", async () => {
      const courseId = validObjectId();
      
      const mockCourse = {
        _id: courseId,
        isPublished: false,
        totalLessons: 0,
        totalEnrollments: 0,
      };

      Course.findById.mockResolvedValue(mockCourse);
      Course.findByIdAndDelete.mockResolvedValue(mockCourse);

      const result = await courseService.deleteCourse(courseId);

      expect(Course.findByIdAndDelete).toHaveBeenCalledWith(courseId);
      expect(result._id).toBe(courseId);
    });
  });

  // ─── PUBLISH COURSE ─────────────────────────────────────────────────────

  describe("publishCourse", () => {
    it("should publish course successfully", async () => {
      const courseId = validObjectId();
      
      const mockCourse = {
        _id: courseId,
        isPublished: false,
        totalLessons: 3,
      };

      const publishedCourse = {
        _id: courseId,
        isPublished: true,
      };

      Course.findById.mockResolvedValue(mockCourse);
      
      // Chain for findByIdAndUpdate().populate().populate().populate().populate()
      const populate4 = jest.fn().mockResolvedValue(publishedCourse);
      const populate3 = jest.fn().mockReturnValue({ populate: populate4 });
      const populate2 = jest.fn().mockReturnValue({ populate: populate3 });
      const populate1 = jest.fn().mockReturnValue({ populate: populate2 });
      Course.findByIdAndUpdate.mockReturnValue({ populate: populate1 });

      const result = await courseService.publishCourse(courseId);

      expect(result.isPublished).toBe(true);
    });
  });
});

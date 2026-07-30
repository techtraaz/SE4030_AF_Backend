/**
 * Unit Tests - Enrollment Service
 * Tests enrollment business logic
 */

import mongoose from "mongoose";
import * as enrollmentService from "../../../../src/service/course/enrollmentService.js";
import Enrollment from "../../../../src/models/course/Enrollment.js";
import Course from "../../../../src/models/course/Course.js";
import User from "../../../../src/models/auth/user.js";
import * as courseService from "../../../../src/service/course/courseService.js";

// Mock dependencies
jest.mock("../../../../src/models/course/Enrollment.js");
jest.mock("../../../../src/models/course/Course.js");
jest.mock("../../../../src/models/auth/user.js");
jest.mock("../../../../src/service/course/courseService.js");

// Helper to create valid MongoDB ObjectIds
const validObjectId = () => new mongoose.Types.ObjectId().toString();

describe("Enrollment Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── ENROLL IN COURSE ───────────────────────────────────────────────────

  describe("enrollInCourse", () => {
    it("should enroll refugee successfully", async () => {
      const refugeeId = validObjectId();
      const courseId = validObjectId();
      const enrollmentId = validObjectId();
      
      const mockRefugee = { _id: refugeeId, role: "REFUGEE" };
      const mockCourse = { _id: courseId, isPublished: true };
      const mockEnrollment = {
        _id: enrollmentId,
        refugeeId: refugeeId,
        courseId: courseId,
        status: "ACTIVE",
        save: jest.fn().mockResolvedValue({}),
        populate: jest.fn().mockResolvedValue({
          _id: enrollmentId,
          status: "ACTIVE",
          courseId: mockCourse,
        }),
      };

      User.findById.mockResolvedValue(mockRefugee);
      Course.findById.mockResolvedValue(mockCourse);
      Enrollment.findOne.mockResolvedValue(null);
      Enrollment.mockImplementation(() => mockEnrollment);
      courseService.incrementTotalEnrollments.mockResolvedValue({});

      const result = await enrollmentService.enrollInCourse(
        refugeeId,
        courseId
      );

      expect(result.status).toBe("ACTIVE");
      expect(mockEnrollment.save).toHaveBeenCalled();
      expect(courseService.incrementTotalEnrollments).toHaveBeenCalledWith(
        courseId
      );
    });

    it("should prevent enrolling in unpublished courses", async () => {
      const refugeeId = validObjectId();
      const courseId = validObjectId();
      
      const mockRefugee = { _id: refugeeId, role: "REFUGEE" };
      const mockCourse = { _id: courseId, isPublished: false };

      User.findById.mockResolvedValue(mockRefugee);
      Course.findById.mockResolvedValue(mockCourse);

      await expect(
        enrollmentService.enrollInCourse(refugeeId, courseId)
      ).rejects.toThrow("Cannot enroll in unpublished courses");
    });

    it("should prevent duplicate enrollments", async () => {
      const refugeeId = validObjectId();
      const courseId = validObjectId();
      
      const mockRefugee = { _id: refugeeId, role: "REFUGEE" };
      const mockCourse = { _id: courseId, isPublished: true };
      const existingEnrollment = { status: "ACTIVE" };

      User.findById.mockResolvedValue(mockRefugee);
      Course.findById.mockResolvedValue(mockCourse);
      Enrollment.findOne.mockResolvedValue(existingEnrollment);

      await expect(
        enrollmentService.enrollInCourse(refugeeId, courseId)
      ).rejects.toThrow("Already enrolled in this course");
    });
  });

  // ─── GET MY ENROLLMENTS ─────────────────────────────────────────────────

  describe("getRefugeeEnrollments", () => {
    it("should return user enrollments", async () => {
      const refugeeId = validObjectId();
      
      const mockEnrollments = [
        { _id: "e1", status: "ACTIVE", courseId: { title: "Course 1" } },
        { _id: "e2", status: "COMPLETED", courseId: { title: "Course 2" } },
      ];

      // Chain .find().sort().populate()
      const populate = jest.fn().mockResolvedValue(mockEnrollments);
      const sort = jest.fn().mockReturnValue({ populate });
      Enrollment.find.mockReturnValue({ sort });

      const result = await enrollmentService.getRefugeeEnrollments(refugeeId);

      expect(result).toHaveLength(2);
      expect(Enrollment.find).toHaveBeenCalledWith({ refugeeId: refugeeId });
    });
  });

  // ─── UPDATE PROGRESS ────────────────────────────────────────────────────

  describe("updateEnrollmentProgress", () => {
    it("should update progress successfully", async () => {
      const refugeeId = validObjectId();
      const courseId = validObjectId();
      const enrollmentId = validObjectId();
      
      const mockEnrollment = {
        _id: enrollmentId,
        progress: 50,
        completedLessons: [],
        status: "ACTIVE",
        save: jest.fn().mockResolvedValue({}),
        populate: jest.fn().mockResolvedValue({
          _id: enrollmentId,
          progress: 75,
        }),
      };

      Enrollment.findOne.mockResolvedValue(mockEnrollment);

      const result = await enrollmentService.updateEnrollmentProgress(
        refugeeId,
        courseId,
        { progress: 75 }
      );

      expect(result.progress).toBe(75);
      expect(mockEnrollment.save).toHaveBeenCalled();
    });
  });

  // ─── UNENROLL ───────────────────────────────────────────────────────────

  describe("unenrollFromCourse", () => {
    it("should unenroll successfully", async () => {
      const refugeeId = validObjectId();
      const courseId = validObjectId();
      const enrollmentId = validObjectId();
      
      const mockEnrollment = {
        _id: enrollmentId,
        status: "ACTIVE",
        save: jest.fn().mockResolvedValue({
          status: "DROPPED",
        }),
      };

      Enrollment.findOne.mockResolvedValue(mockEnrollment);
      courseService.decrementTotalEnrollments.mockResolvedValue({});

      await enrollmentService.unenrollFromCourse(refugeeId, courseId);

      expect(mockEnrollment.status).toBe("DROPPED");
      expect(mockEnrollment.save).toHaveBeenCalled();
    });
  });
});

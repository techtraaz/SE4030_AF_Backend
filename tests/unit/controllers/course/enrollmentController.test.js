/**
 * Unit Tests - Enrollment Controller
 * Tests enrollment endpoint handlers
 */

import * as enrollmentController from "../../../../src/controller/course/enrollmentController.js";
import * as enrollmentService from "../../../../src/service/course/enrollmentService.js";

// Mock dependencies
jest.mock("../../../../src/service/course/enrollmentService.js");

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

describe("Enrollment Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── ENROLL IN COURSE ───────────────────────────────────────────────────

  describe("enrollInCourse", () => {
    it("should enroll in course and return 201", async () => {
      const req = {
        user: { userId: "refugee123" },
        body: { courseId: "course123" },
      };
      const res = mockResponse();

      const mockEnrollment = {
        _id: "enrollment123",
        status: "ACTIVE",
      };
      enrollmentService.enrollInCourse.mockResolvedValue(mockEnrollment);

      await enrollmentController.enrollInCourse(req, res);

      expect(enrollmentService.enrollInCourse).toHaveBeenCalledWith(
        "refugee123",
        "course123"
      );
      expect(res.created).toHaveBeenCalledWith(
        "Successfully enrolled in course",
        mockEnrollment
      );
    });
  });

  // ─── GET MY ENROLLMENTS ─────────────────────────────────────────────────

  describe("getMyEnrollments", () => {
    it("should return user enrollments", async () => {
      const req = { user: { userId: "refugee123" }, query: {} };
      const res = mockResponse();

      const mockEnrollments = [
        { _id: "e1", status: "ACTIVE" },
        { _id: "e2", status: "COMPLETED" },
      ];
      enrollmentService.getRefugeeEnrollments.mockResolvedValue(mockEnrollments);

      await enrollmentController.getMyEnrollments(req, res);

      expect(res.success).toHaveBeenCalledWith(
        "Enrollments retrieved successfully",
        mockEnrollments
      );
    });
  });

  // ─── UPDATE PROGRESS ────────────────────────────────────────────────────

  describe("updateEnrollmentProgress", () => {
    it("should update progress successfully", async () => {
      const req = {
        user: { userId: "refugee123" },
        params: { courseId: "course123" },
        body: { progress: 75 },
      };
      const res = mockResponse();

      const mockEnrollment = { _id: "enrollment123", progress: 75 };
      enrollmentService.updateEnrollmentProgress.mockResolvedValue(
        mockEnrollment
      );

      await enrollmentController.updateEnrollmentProgress(req, res);

      expect(res.success).toHaveBeenCalledWith(
        "Progress updated successfully",
        mockEnrollment
      );
    });
  });

  // ─── UNENROLL ───────────────────────────────────────────────────────────

  describe("unenrollFromCourse", () => {
    it("should unenroll successfully", async () => {
      const req = {
        user: { userId: "refugee123" },
        params: { courseId: "course123" },
      };
      const res = mockResponse();

      enrollmentService.unenrollFromCourse.mockResolvedValue();

      await enrollmentController.unenrollFromCourse(req, res);

      expect(res.success).toHaveBeenCalledWith(
        "Successfully unenrolled from course"
      );
    });
  });
});

/**
 * Integration Tests - Enrollment API
 * Tests enrollment workflow
 *
 * Endpoints tested:
 *   POST   /api/enrollments
 *   GET    /api/enrollments
 *   PATCH  /api/enrollments/:courseId/progress
 *   DELETE /api/enrollments/:courseId
 */

import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import app from "../../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import Course from "../../src/models/course/Course.js";
import Category from "../../src/models/lesson/category.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get refugee token */
const getRefugeeToken = async () => {
  await request(app)
    .post("/api/auth/refugee/signup")
    .send({ email: "refugee@test.com", password: "refugee123" });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "refugee@test.com", password: "refugee123" });

  return login.body.content.token;
};

/** Create published course */
const createPublishedCourse = async () => {
  const category = await Category.create({
    name: "Programming",
    slug: "programming",
    description: "Programming courses",
  });

  const User = (await import("../../src/models/auth/user.js")).default;
  const admin = await User.create({
    email: "admin@test.com",
    password: "admin123",
    role: "ADMIN",
  });

  return await Course.create({
    title: "Test Course",
    description: "Test Description",
    level: "Beginner",
    createdById: admin._id,
    categoryId: category._id,
    isPublished: true,
  });
};

// ─── DB lifecycle ─────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ─── POST /api/enrollments ─────────────────────────────────────────────

describe("POST /api/enrollments", () => {
  it("should enroll in course successfully", async () => {
    const token = await getRefugeeToken();
    const course = await createPublishedCourse();

    const res = await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseId: course._id.toString() });

    expect(res.status).toBe(201);
    expect(res.body.content.status).toBe("ACTIVE");
  });
});

// ─── GET /api/enrollments ──────────────────────────────────────────────

describe("GET /api/enrollments", () => {
  it("should retrieve user enrollments", async () => {
    const token = await getRefugeeToken();
    const course = await createPublishedCourse();

    // Enroll first
    await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseId: course._id.toString() });

    const res = await request(app)
      .get("/api/enrollments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content).toBeInstanceOf(Array);
    expect(res.body.content.length).toBe(1);
  });
});

// ─── PATCH /api/enrollments/:courseId/progress ─────────────────────────

describe("PATCH /api/enrollments/:courseId/progress", () => {
  it("should update enrollment progress", async () => {
    const token = await getRefugeeToken();
    const course = await createPublishedCourse();

    // Enroll first
    await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseId: course._id.toString() });

    const res = await request(app)
      .patch(`/api/enrollments/${course._id}/progress`)
      .set("Authorization", `Bearer ${token}`)
      .send({ progress: 50 });

    expect(res.status).toBe(200);
    expect(res.body.content.progress).toBe(50);
  });
});

// ─── DELETE /api/enrollments/:courseId ─────────────────────────────────

describe("DELETE /api/enrollments/:courseId", () => {
  it("should unenroll from course successfully", async () => {
    const token = await getRefugeeToken();
    const course = await createPublishedCourse();

    // Enroll first
    await request(app)
      .post("/api/enrollments")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseId: course._id.toString() });

    const res = await request(app)
      .delete(`/api/enrollments/${course._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Successfully unenrolled from course");
  });
});

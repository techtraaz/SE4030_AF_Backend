/**
 * Integration Tests - Course API
 * Tests full stack: route → controller → service → MongoDB
 *
 * Endpoints tested:
 *   POST   /api/course
 *   GET    /api/course
 *   GET    /api/course/:id
 *   PUT    /api/course/:id
 *   DELETE /api/course/:id
 *   PATCH  /api/course/:id/publish
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

/** Get content contributor token */
const getContributorToken = async () => {
  await request(app)
    .post("/api/auth/contributor/signup")
    .send({ email: "contrib@test.com", password: "contrib123" });

  await request(app)
    .post("/api/auth/admin/signup")
    .send({ email: "admin@test.com", password: "admin123" });

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "admin123" });

  const adminToken = adminLogin.body.content.token;

  const User = (await import("../../src/models/auth/user.js")).default;
  const contrib = await User.findOne({ email: "contrib@test.com" });

  await request(app)
    .patch(`/api/admin/contributors/${contrib._id}/approve`)
    .set("Authorization", `Bearer ${adminToken}`);

  const contribLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "contrib@test.com", password: "contrib123" });

  return { token: contribLogin.body.content.token, contributorId: contrib._id };
};

/** Seed a category */
const seedCategory = async () => {
  return await Category.create({
    name: "Programming",
    slug: "programming",
    description: "Programming courses",
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

// ─── POST /api/course ─────────────────────────────────────────────────

describe("POST /api/course", () => {
  it("should create a course successfully", async () => {
    const { token, contributorId } = await getContributorToken();
    const category = await seedCategory();

    const res = await request(app)
      .post("/api/course")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "JavaScript Fundamentals",
        description: "Learn JavaScript from scratch",
        level: "Beginner",
        language: "English",
        createdById: contributorId,
        categoryId: category._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.content.title).toBe("JavaScript Fundamentals");
    expect(res.body.content.isPublished).toBe(false);
  });
});

// ─── GET /api/course ──────────────────────────────────────────────────

describe("GET /api/course", () => {
  it("should retrieve all courses", async () => {
    const { token, contributorId } = await getContributorToken();
    const category = await seedCategory();

    await Course.create({
      title: "Course 1",
      description: "Description 1",
      level: "Beginner",
      createdById: contributorId,
      categoryId: category._id,
    });

    const res = await request(app)
      .get("/api/course")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content).toBeInstanceOf(Array);
  });
});

// ─── GET /api/course/:id ──────────────────────────────────────────────

describe("GET /api/course/:id", () => {
  it("should retrieve a course by ID", async () => {
    const { token, contributorId } = await getContributorToken();
    const category = await seedCategory();

    const course = await Course.create({
      title: "Test Course",
      description: "Test Description",
      level: "Beginner",
      createdById: contributorId,
      categoryId: category._id,
    });

    const res = await request(app)
      .get(`/api/course/${course._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content.title).toBe("Test Course");
  });
});

// ─── PUT /api/course/:id ──────────────────────────────────────────────

describe("PUT /api/course/:id", () => {
  it("should update a course successfully", async () => {
    const { token, contributorId } = await getContributorToken();
    const category = await seedCategory();

    const course = await Course.create({
      title: "Old Title",
      description: "Old Description",
      level: "Beginner",
      createdById: contributorId,
      categoryId: category._id,
    });

    const res = await request(app)
      .put(`/api/course/${course._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.content.title).toBe("Updated Title");
  });
});

// ─── DELETE /api/course/:id ───────────────────────────────────────────

describe("DELETE /api/course/:id", () => {
  it("should delete a course successfully", async () => {
    const { token, contributorId } = await getContributorToken();
    const category = await seedCategory();

    const course = await Course.create({
      title: "To Delete",
      description: "Will be deleted",
      level: "Beginner",
      createdById: contributorId,
      categoryId: category._id,
    });

    const res = await request(app)
      .delete(`/api/course/${course._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Course deleted successfully");
  });
});

// ─── PATCH /api/course/:id/publish ────────────────────────────────────

describe("PATCH /api/course/:id/publish", () => {
  it("should publish a course successfully", async () => {
    const { token, contributorId } = await getContributorToken();
    const category = await seedCategory();

    // Get admin token for publish
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.com", password: "admin123" });
    const adminToken = adminLogin.body.content.token;

    const course = await Course.create({
      title: "To Publish",
      description: "Will be published",
      level: "Beginner",
      createdById: contributorId,
      categoryId: category._id,
      totalLessons: 1, // At least one lesson required to publish
    });

    const res = await request(app)
      .patch(`/api/course/${course._id}/publish`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.content.isPublished).toBe(true);
  });
});

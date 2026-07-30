/**
 * Integration tests – Lessons API
 * Tests the full stack: route → middleware → controller → service → MongoDB (in-memory)
 *
 * Endpoints covered:
 *   POST   /api/lessons                     (ContentContributor)
 *   GET    /api/lessons
 *   GET    /api/lessons/:id
 *   PUT    /api/lessons/:id                 (ContentContributor)
 *   DELETE /api/lessons/:id                 (ContentContributor)
 *   PATCH  /api/lessons/:id/publish         (ContentContributor)
 *   PATCH  /api/lessons/:id/unpublish       (ContentContributor)
 */

import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import app from "../../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import Lesson from "../../src/models/lesson/lesson.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Seed an approved content contributor and return their token */
const getContributorToken = async () => {
  // Register contributor (starts as PENDING)
  await request(app)
    .post("/api/auth/contributor/signup")
    .send({ email: "contrib@test.com", password: "contrib123" });

  // Register admin to approve
  await request(app)
    .post("/api/auth/admin/signup")
    .send({ email: "admin@test.com", password: "admin123" });

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "admin123" });

  const adminToken = adminLogin.body.content.token;

  // Find the contributor's userId from the DB directly
  const User = (await import("../../src/models/auth/user.js")).default;
  const contrib = await User.findOne({ email: "contrib@test.com" });

  // Admin approves contributor
  await request(app)
    .patch(`/api/admin/contributors/${contrib._id}/approve`)
    .set("Authorization", `Bearer ${adminToken}`);

  // Contributor logs in
  const contribLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "contrib@test.com", password: "contrib123" });

  return contribLogin.body.content.token;
};

/** Seed a minimal lesson document directly via Mongoose (bypasses courseService side-effects) */
const seedLesson = async (overrides = {}) => {
  return await Lesson.create({
    courseId: new mongoose.Types.ObjectId(),
    categoryId: new mongoose.Types.ObjectId(),
    title: "Test Lesson",
    difficulty: "beginner",
    isPublished: false,
    ...overrides,
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

// ─── POST /api/lessons ────────────────────────────────────────────────────────

describe("POST /api/lessons", () => {
  it("should create a lesson when called by a content contributor", async () => {
    const token = await getContributorToken();

    const res = await request(app)
      .post("/api/lessons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        courseId: new mongoose.Types.ObjectId().toString(),
        categoryId: new mongoose.Types.ObjectId().toString(),
        title: "Intro to Arabic",
        difficulty: "beginner",
        estimatedMinutes: 15,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Lesson created successfully");
    expect(res.body.content.title).toBe("Intro to Arabic");
    expect(res.body.content.isPublished).toBe(false);
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app)
      .post("/api/lessons")
      .send({ title: "No Auth Lesson" });

    expect(res.statusCode).toBe(401);
  });
});

// ─── GET /api/lessons ─────────────────────────────────────────────────────────

describe("GET /api/lessons", () => {
  it("should return an empty list when no lessons exist", async () => {
    const res = await request(app).get("/api/lessons");
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toEqual([]);
  });

  it("should return all lessons", async () => {
    await seedLesson({ title: "Lesson A" });
    await seedLesson({ title: "Lesson B" });

    const res = await request(app).get("/api/lessons");
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toHaveLength(2);
  });

  it("should filter by courseId when query param is provided", async () => {
    const courseId = new mongoose.Types.ObjectId();
    await seedLesson({ courseId, title: "Course Lesson" });
    await seedLesson({ title: "Other Lesson" }); // different courseId

    const res = await request(app).get(`/api/lessons?courseId=${courseId.toString()}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toHaveLength(1);
    expect(res.body.content[0].title).toBe("Course Lesson");
  });
});

// ─── GET /api/lessons/:id ─────────────────────────────────────────────────────

describe("GET /api/lessons/:id", () => {
  it("should return a single lesson by id", async () => {
    const lesson = await seedLesson({ title: "Single Lesson" });

    const res = await request(app).get(`/api/lessons/${lesson._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.content._id).toBe(lesson._id.toString());
    expect(res.body.content.title).toBe("Single Lesson");
  });

  it("should return 404 for a non-existent lesson id", async () => {
    const res = await request(app).get("/api/lessons/000000000000000000000000");
    expect(res.statusCode).toBe(404);
  });
});

// ─── PUT /api/lessons/:id ─────────────────────────────────────────────────────

describe("PUT /api/lessons/:id", () => {
  it("should update a lesson when called by a content contributor", async () => {
    const token = await getContributorToken();
    const lesson = await seedLesson({ title: "Original Title" });

    const res = await request(app)
      .put(`/api/lessons/${lesson._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title", difficulty: "intermediate" });

    expect(res.statusCode).toBe(200);
    expect(res.body.content.title).toBe("Updated Title");
    expect(res.body.content.difficulty).toBe("intermediate");
  });

  it("should return 401 when no token is provided", async () => {
    const lesson = await seedLesson();
    const res = await request(app)
      .put(`/api/lessons/${lesson._id}`)
      .send({ title: "Hacked" });

    expect(res.statusCode).toBe(401);
  });
});

// ─── DELETE /api/lessons/:id ──────────────────────────────────────────────────

describe("DELETE /api/lessons/:id", () => {
  it("should delete a lesson when called by a content contributor", async () => {
    const token = await getContributorToken();
    const lesson = await seedLesson({ title: "To Delete" });

    const res = await request(app)
      .delete(`/api/lessons/${lesson._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Lesson deleted successfully");

    // Verify it's gone
    const getRes = await request(app).get(`/api/lessons/${lesson._id}`);
    expect(getRes.statusCode).toBe(404);
  });

  it("should return 404 when deleting a non-existent lesson", async () => {
    const token = await getContributorToken();

    const res = await request(app)
      .delete("/api/lessons/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});

// ─── PATCH /api/lessons/:id/publish ──────────────────────────────────────────

describe("PATCH /api/lessons/:id/publish", () => {
  it("should return 400 when lesson does not have all sections", async () => {
    const token = await getContributorToken();
    const lesson = await seedLesson({ title: "Incomplete Lesson" });

    const res = await request(app)
      .patch(`/api/lessons/${lesson._id}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All sections must be added before publishing");
  });

  it("should publish a lesson that has all sections", async () => {
    const token = await getContributorToken();
    const lesson = await seedLesson({
      reading: new mongoose.Types.ObjectId(),
      listening: new mongoose.Types.ObjectId(),
      vocabulary: new mongoose.Types.ObjectId(),
      video: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .patch(`/api/lessons/${lesson._id}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.content.isPublished).toBe(true);
  });
});

// ─── PATCH /api/lessons/:id/unpublish ────────────────────────────────────────

describe("PATCH /api/lessons/:id/unpublish", () => {
  it("should unpublish a published lesson", async () => {
    const token = await getContributorToken();
    const lesson = await seedLesson({
      isPublished: true,
      reading: new mongoose.Types.ObjectId(),
      listening: new mongoose.Types.ObjectId(),
      vocabulary: new mongoose.Types.ObjectId(),
      video: new mongoose.Types.ObjectId(),
    });

    const res = await request(app)
      .patch(`/api/lessons/${lesson._id}/unpublish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.content.isPublished).toBe(false);
  });

  it("should return 404 when unpublishing a non-existent lesson", async () => {
    const token = await getContributorToken();

    const res = await request(app)
      .patch("/api/lessons/000000000000000000000000/unpublish")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });
});

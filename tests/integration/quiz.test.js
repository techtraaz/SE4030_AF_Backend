/**
 * Integration tests – Quiz API
 * Tests the full stack: route → middleware → controller → service → MongoDB (in-memory)
 *
 * Endpoints covered:
 *   POST   /api/quiz/quizzes                (ContentContributor)
 *   GET    /api/quiz/quizzes
 *   GET    /api/quiz/quizzes/:id
 *   PUT    /api/quiz/quizzes/:id            (ContentContributor)
 *   DELETE /api/quiz/quizzes/:id            (ContentContributor)
 *   PATCH  /api/quiz/quizzes/:id/publish    (ContentContributor)
 *   PATCH  /api/quiz/quizzes/:id/unpublish  (ContentContributor)
 */

import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import app from "../../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import Quiz from "../../src/models/quiz/Quiz.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get content contributor token (approved) */
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

  return contribLogin.body.content.token;
};

/** Seed a quiz via Mongoose */
const seedQuiz = async (overrides = {}) => {
  return await Quiz.create({
    courseId: new mongoose.Types.ObjectId(),
    title: "Test Quiz",
    description: "A test quiz",
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

// ─── POST /api/quiz/quizzes ───────────────────────────────────────────────────

describe("POST /api/quiz/quizzes", () => {
  it("should create a quiz when called by content contributor", async () => {
    const token = await getContributorToken();

    const res = await request(app)
      .post("/api/quiz/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        courseId: new mongoose.Types.ObjectId().toString(),
        title: "JavaScript Fundamentals Quiz",
        description: "Test your knowledge of JavaScript",
        timeLimit: 30,
        passingScore: 70,
        maxAttempts: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.content).toHaveProperty("_id");
    expect(res.body.content.title).toBe("JavaScript Fundamentals Quiz");
    expect(res.body.content.isPublished).toBe(false);
  });
});

// ─── GET /api/quiz/quizzes ────────────────────────────────────────────────────

describe("GET /api/quiz/quizzes", () => {
  it("should retrieve all quizzes", async () => {
    const token = await getContributorToken();
    await seedQuiz({ title: "Quiz 1" });
    await seedQuiz({ title: "Quiz 2", isPublished: true });

    const res = await request(app)
      .get("/api/quiz/quizzes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content).toBeInstanceOf(Array);
    expect(res.body.content.length).toBe(2);
  });
});

// ─── GET /api/quiz/quizzes/:id ────────────────────────────────────────────────

describe("GET /api/quiz/quizzes/:id", () => {
  it("should retrieve a quiz by ID", async () => {
    const token = await getContributorToken();
    const quiz = await seedQuiz({ title: "Specific Quiz" });

    const res = await request(app)
      .get(`/api/quiz/quizzes/${quiz._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content.title).toBe("Specific Quiz");
    expect(res.body.content._id).toBe(quiz._id.toString());
  });
});

// ─── PUT /api/quiz/quizzes/:id ────────────────────────────────────────────────

describe("PUT /api/quiz/quizzes/:id", () => {
  it("should update a quiz successfully", async () => {
    const token = await getContributorToken();
    const quiz = await seedQuiz({ title: "Old Title" });

    const res = await request(app)
      .put(`/api/quiz/quizzes/${quiz._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Title",
        description: "Updated description",
      });

    expect(res.status).toBe(200);
    expect(res.body.content.title).toBe("Updated Title");
    expect(res.body.content.description).toBe("Updated description");
  });
});

// ─── DELETE /api/quiz/quizzes/:id ─────────────────────────────────────────────

describe("DELETE /api/quiz/quizzes/:id", () => {
  it("should delete a quiz successfully", async () => {
    const token = await getContributorToken();
    const quiz = await seedQuiz({ title: "To Delete" });

    const res = await request(app)
      .delete(`/api/quiz/quizzes/${quiz._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Quiz deleted successfully");

    const deleted = await Quiz.findById(quiz._id);
    expect(deleted).toBeNull();
  });
});

// ─── PATCH /api/quiz/quizzes/:id/publish ──────────────────────────────────────

describe("PATCH /api/quiz/quizzes/:id/publish", () => {
  it("should publish a quiz with questions", async () => {
    const token = await getContributorToken();
    const quiz = await seedQuiz({ title: "To Publish" });

    // Add a question to the quiz
    const Question = (await import("../../src/models/quiz/Question.js")).default;
    await Question.create({
      quizId: quiz._id,
      questionText: "Sample question",
      type: "multiple_choice",
      points: 10,
      order: 1,
    });

    const res = await request(app)
      .patch(`/api/quiz/quizzes/${quiz._id}/publish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content.isPublished).toBe(true);
  });
});

// ─── PATCH /api/quiz/quizzes/:id/unpublish ────────────────────────────────────

describe("PATCH /api/quiz/quizzes/:id/unpublish", () => {
  it("should unpublish a quiz successfully", async () => {
    const token = await getContributorToken();
    const quiz = await seedQuiz({ title: "Published Quiz", isPublished: true });

    const res = await request(app)
      .patch(`/api/quiz/quizzes/${quiz._id}/unpublish`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content.isPublished).toBe(false);
  });
});

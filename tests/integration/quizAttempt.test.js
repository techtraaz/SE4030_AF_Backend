/**
 * Integration tests – Quiz Attempt API
 * Tests the full quiz-taking flow: submit attempts, view results, statistics
 *
 * Endpoints covered:
 *   POST   /api/quiz/attempts                       (Refugee)
 *   GET    /api/quiz/attempts/:id                   (Refugee)
 *   GET    /api/quiz/attempts/user/:refugeeId       (Refugee)
 *   GET    /api/quiz/attempts/statistics/:quizId    (Admin/ContentContributor)
 */

import request from "supertest";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import app from "../../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import Quiz from "../../src/models/quiz/Quiz.js";
import Question from "../../src/models/quiz/Question.js";
import Option from "../../src/models/quiz/Option.js";

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

  return contribLogin.body.content.token;
};

/** Create a complete quiz with questions and options for testing */
const createCompleteQuiz = async () => {
  const quiz = await Quiz.create({
    courseId: new mongoose.Types.ObjectId(),
    title: "Sample Quiz",
    description: "A quiz for testing",
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
    isPublished: true,
  });

  // Question 1: multiple choice (10 points)
  const q1 = await Question.create({
    quizId: quiz._id,
    questionText: "What is 2+2?",
    type: "multiple_choice",
    points: 10,
    order: 1,
  });

  const q1opt1 = await Option.create({
    questionId: q1._id,
    optionText: "4",
    isCorrect: true,
  });

  await Option.create({
    questionId: q1._id,
    optionText: "5",
    isCorrect: false,
  });

  // Question 2: true/false (10 points)
  const q2 = await Question.create({
    quizId: quiz._id,
    questionText: "The sky is blue",
    type: "true_false",
    points: 10,
    order: 2,
  });

  const q2opt1 = await Option.create({
    questionId: q2._id,
    optionText: "True",
    isCorrect: true,
  });

  await Option.create({
    questionId: q2._id,
    optionText: "False",
    isCorrect: false,
  });

  return {
    quiz,
    questions: [q1, q2],
    correctOptions: [q1opt1, q2opt1],
  };
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

// ─── POST /api/quiz/attempts ──────────────────────────────────────────────────

describe("POST /api/quiz/attempts", () => {
  it("should submit a quiz attempt with 100% score", async () => {
    const token = await getRefugeeToken();
    const { quiz, questions, correctOptions } = await createCompleteQuiz();

    const User = (await import("../../src/models/auth/user.js")).default;
    const refugee = await User.findOne({ email: "refugee@test.com" });

    const res = await request(app)
      .post("/api/quiz/attempts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        quizId: quiz._id.toString(),
        refugeeId: refugee._id.toString(),
        responses: [
          {
            questionId: questions[0]._id.toString(),
            selectedOptionId: correctOptions[0]._id.toString(),
          },
          {
            questionId: questions[1]._id.toString(),
            selectedOptionId: correctOptions[1]._id.toString(),
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.content.score).toBe(100);
    expect(res.body.content.passed).toBe(true);
    expect(res.body.content.quizId).toBe(quiz._id.toString());
  });
});

// ─── GET /api/quiz/attempts/:id ───────────────────────────────────────────────

describe("GET /api/quiz/attempts/:id", () => {
  it("should retrieve an attempt with responses", async () => {
    const token = await getRefugeeToken();
    const { quiz, questions, correctOptions } = await createCompleteQuiz();

    const User = (await import("../../src/models/auth/user.js")).default;
    const refugee = await User.findOne({ email: "refugee@test.com" });

    const submitRes = await request(app)
      .post("/api/quiz/attempts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        quizId: quiz._id.toString(),
        refugeeId: refugee._id.toString(),
        responses: [
          {
            questionId: questions[0]._id.toString(),
            selectedOptionId: correctOptions[0]._id.toString(),
          },
          {
            questionId: questions[1]._id.toString(),
            selectedOptionId: correctOptions[1]._id.toString(),
          },
        ],
      });

    expect(submitRes.status).toBe(201);

    const attemptId = submitRes.body.content._id;

    const res = await request(app)
      .get(`/api/quiz/attempts/${attemptId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content.attempt._id).toBe(attemptId);
    expect(res.body.content.responses).toBeInstanceOf(Array);
  });
});

// ─── GET /api/quiz/attempts/statistics/:quizId ────────────────────────────────

describe("GET /api/quiz/attempts/statistics/:quizId", () => {
  it("should retrieve quiz statistics", async () => {
    const token = await getContributorToken();
    const refugeeToken = await getRefugeeToken();
    const { quiz, questions, correctOptions } = await createCompleteQuiz();

    const User = (await import("../../src/models/auth/user.js")).default;
    const refugee = await User.findOne({ email: "refugee@test.com" });

    // Submit some attempts
    await request(app)
      .post("/api/quiz/attempts")
      .set("Authorization", `Bearer ${refugeeToken}`)
      .send({
        quizId: quiz._id.toString(),
        refugeeId: refugee._id.toString(),
        responses: [
          {
            questionId: questions[0]._id.toString(),
            selectedOptionId: correctOptions[0]._id.toString(),
          },
          {
            questionId: questions[1]._id.toString(),
            selectedOptionId: correctOptions[1]._id.toString(),
          },
        ],
      });

    const res = await request(app)
      .get(`/api/quiz/attempts/quiz/${quiz._id}/statistics`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content).toHaveProperty("totalAttempts");
    expect(res.body.content).toHaveProperty("averageScore");
    expect(res.body.content).toHaveProperty("passRate");
  });
});

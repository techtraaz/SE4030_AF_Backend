/**
 * Integration tests – Distractor API (Third-Party API Integration)
 * Tests the Datamuse API integration for generating quiz distractors and hints
 *
 * Endpoints covered:
 *   POST   /api/quiz/distractors/generate      (ContentContributor)
 *   POST   /api/quiz/distractors/hints         (ContentContributor)
 *   GET    /api/quiz/distractors/context/:word (ContentContributor)
 */

import request from "supertest";
import dotenv from "dotenv";
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import app from "../../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";

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

  return contribLogin.body.content.token;
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

// ─── POST /api/quiz/distractors/generate ──────────────────────────────────────

describe("POST /api/quiz/distractors/generate", () => {
  it("should generate distractors for a given correct answer", async () => {
    const token = await getContributorToken();

    const res = await request(app)
      .post("/api/quiz/distractors/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({
        correctAnswer: "happy",
        count: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.content).toHaveProperty("distractors");
    expect(res.body.content.distractors).toBeInstanceOf(Array);
    expect(res.body.content.distractors.length).toBeGreaterThan(0);
    expect(res.body.content.distractors.length).toBeLessThanOrEqual(3);
    expect(res.body.content.correctAnswer).toBe("happy");

    // Verify distractors don't include the correct answer
    res.body.content.distractors.forEach((distractor) => {
      expect(distractor.toLowerCase()).not.toBe("happy");
    });
  }, 10000); // Increase timeout for API call
});

// ─── POST /api/quiz/distractors/hints ─────────────────────────────────────────

describe("POST /api/quiz/distractors/hints", () => {
  it("should generate hints for a correct answer", async () => {
    const token = await getContributorToken();

    const res = await request(app)
      .post("/api/quiz/distractors/hints")
      .set("Authorization", `Bearer ${token}`)
      .send({
        correctAnswer: "joyful",
        maxHints: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.content).toHaveProperty("hints");
    expect(res.body.content.hints).toBeInstanceOf(Array);
    expect(res.body.content.hints.length).toBeGreaterThan(0);
    expect(res.body.content).toHaveProperty("hintText");

    // Verify hint doesn't reveal the answer
    res.body.content.hints.forEach((hint) => {
      expect(hint.toLowerCase()).not.toBe("joyful");
    });
  }, 10000);
});

// ─── GET /api/quiz/distractors/context/:word ──────────────────────────────────

describe("GET /api/quiz/distractors/context/:word", () => {
  it("should retrieve educational context for a word", async () => {
    const token = await getContributorToken();

    const res = await request(app)
      .get("/api/quiz/distractors/context/happy")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.content).toHaveProperty("word", "happy");
    expect(res.body.content).toHaveProperty("synonyms");
    expect(res.body.content).toHaveProperty("related");
    expect(res.body.content.synonyms).toBeInstanceOf(Array);
    expect(res.body.content.related).toBeInstanceOf(Array);
  }, 10000);
});

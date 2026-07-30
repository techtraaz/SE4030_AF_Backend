/**
 * Integration tests – Auth API
 * Tests the full stack: route → middleware → controller → service → MongoDB (in-memory)
 *
 * Endpoints covered:
 *   POST /api/auth/refugee/signup
 *   POST /api/auth/contributor/signup
 *   POST /api/auth/login
 *   POST /api/auth/logout
 */

import request from "supertest";
import dotenv from "dotenv";
dotenv.config();

// Ensure a JWT secret exists for the test environment
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import app from "../../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ─── Signup ───────────────────────────────────────────────────────────────────

describe("POST /api/auth/refugee/signup", () => {
  it("should register a refugee and return 201", async () => {
    const res = await request(app)
      .post("/api/auth/refugee/signup")
      .send({ email: "refugee@test.com", password: "password123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Refugee registered successfully");
    expect(res.body.content).not.toHaveProperty("password");
    expect(res.body.content.role).toBe("REFUGEE");
    expect(res.body.content.status).toBe("ACTIVE");
  });

  it("should return 400 when registering with a duplicate email", async () => {
    await request(app)
      .post("/api/auth/refugee/signup")
      .send({ email: "dup@test.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/refugee/signup")
      .send({ email: "dup@test.com", password: "password123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });
});

describe("POST /api/auth/contributor/signup", () => {
  it("should register a contributor with PENDING status and return 201", async () => {
    const res = await request(app)
      .post("/api/auth/contributor/signup")
      .send({ email: "contrib@test.com", password: "password123" });

    expect(res.statusCode).toBe(201);
    expect(res.body.content.role).toBe("CONTENT_CONTRIBUTOR");
    expect(res.body.content.status).toBe("PENDING");
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    // Seed an active refugee user
    await request(app)
      .post("/api/auth/refugee/signup")
      .send({ email: "active@test.com", password: "password123" });
  });

  it("should login successfully and return a JWT token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "active@test.com", password: "password123" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.content).toHaveProperty("token");
    expect(res.body.content.user).not.toHaveProperty("password");
  });

  it("should return 401 for a non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@test.com", password: "password123" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should return 401 for a wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "active@test.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  it("should return 401 when a PENDING contributor tries to login", async () => {
    await request(app)
      .post("/api/auth/contributor/signup")
      .send({ email: "pending@test.com", password: "password123" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "pending@test.com", password: "password123" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Your account is pending admin approval");
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post("/api/auth/refugee/signup")
      .send({ email: "logme@test.com", password: "password123" });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "logme@test.com", password: "password123" });

    token = loginRes.body.content.token;
  });

  it("should logout successfully with a valid token", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 when using a blacklisted token", async () => {
    // Logout once to blacklist the token
    await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    // Try to logout again with the same token
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
  });
});

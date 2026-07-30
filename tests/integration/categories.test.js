/**
 * Integration tests – Categories API
 * Tests the full stack: route → middleware → controller → service → MongoDB (in-memory)
 *
 * Endpoints covered:
 *   POST   /api/categories          (Admin only)
 *   GET    /api/categories
 *   GET    /api/categories/:id
 *   PUT    /api/categories/:id      (Admin only)
 *   DELETE /api/categories/:id      (Admin only)
 */

import request from "supertest";
import dotenv from "dotenv";
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import app from "../../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Register and login an admin, return the JWT token */
const getAdminToken = async () => {
  await request(app)
    .post("/api/auth/admin/signup")
    .send({ email: "admin@test.com", password: "adminpass123" });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@test.com", password: "adminpass123" });

  return res.body.content.token;
};

/** Register and login a refugee, return the JWT token */
const getRefugeeToken = async () => {
  await request(app)
    .post("/api/auth/refugee/signup")
    .send({ email: "refugee@test.com", password: "refugeepass123" });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "refugee@test.com", password: "refugeepass123" });

  return res.body.content.token;
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

// ─── POST /api/categories ─────────────────────────────────────────────────────

describe("POST /api/categories", () => {
  it("should create a category when called by an admin", async () => {
    const token = await getAdminToken();

    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Grammar", slug: "grammar", description: "Basic grammar" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Category created successfully");
    expect(res.body.content.name).toBe("Grammar");
    expect(res.body.content.slug).toBe("grammar");
  });

  it("should return 400 when slug already exists", async () => {
    const token = await getAdminToken();

    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Grammar", slug: "grammar" });

    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Grammar Duplicate", slug: "grammar" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Category with this slug already exists");
  });

  it("should return 403 when called by a non-admin user", async () => {
    const token = await getRefugeeToken();

    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Grammar", slug: "grammar" });

    expect(res.statusCode).toBe(403);
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app)
      .post("/api/categories")
      .send({ name: "Grammar", slug: "grammar" });

    expect(res.statusCode).toBe(401);
  });
});

// ─── GET /api/categories ──────────────────────────────────────────────────────

describe("GET /api/categories", () => {
  it("should return an empty list when no categories exist", async () => {
    const res = await request(app).get("/api/categories");

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toEqual([]);
  });

  it("should return all existing categories", async () => {
    const token = await getAdminToken();

    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Grammar", slug: "grammar" });

    await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Vocabulary", slug: "vocabulary" });

    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(res.body.content).toHaveLength(2);
  });
});

// ─── GET /api/categories/:id ──────────────────────────────────────────────────

describe("GET /api/categories/:id", () => {
  it("should return a single category by id", async () => {
    const token = await getAdminToken();

    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Reading", slug: "reading" });

    const categoryId = createRes.body.content._id;

    const res = await request(app).get(`/api/categories/${categoryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.content._id).toBe(categoryId);
    expect(res.body.content.slug).toBe("reading");
  });

  it("should return 404 for a non-existent category id", async () => {
    const res = await request(app).get("/api/categories/000000000000000000000000");
    expect(res.statusCode).toBe(404);
  });
});

// ─── PUT /api/categories/:id ──────────────────────────────────────────────────

describe("PUT /api/categories/:id", () => {
  it("should update a category when called by admin", async () => {
    const token = await getAdminToken();

    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Old Name", slug: "old-slug" });

    const categoryId = createRes.body.content._id;

    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "New Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.content.name).toBe("New Name");
  });

  it("should return 403 when a non-admin tries to update", async () => {
    const adminToken = await getAdminToken();
    const refugeeToken = await getRefugeeToken();

    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Grammar", slug: "grammar" });

    const categoryId = createRes.body.content._id;

    const res = await request(app)
      .put(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${refugeeToken}`)
      .send({ name: "Hacked" });

    expect(res.statusCode).toBe(403);
  });
});

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────

describe("DELETE /api/categories/:id", () => {
  it("should delete a category when called by admin", async () => {
    const token = await getAdminToken();

    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Temp", slug: "temp" });

    const categoryId = createRes.body.content._id;

    const res = await request(app)
      .delete(`/api/categories/${categoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Category deleted successfully");

    // Verify it is gone
    const getRes = await request(app).get(`/api/categories/${categoryId}`);
    expect(getRes.statusCode).toBe(404);
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).delete("/api/categories/000000000000000000000000");
    expect(res.statusCode).toBe(401);
  });
});

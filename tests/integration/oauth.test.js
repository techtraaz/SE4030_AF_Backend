/**
 * Integration tests – OAuth (Auth0 Authorization Code) flow
 * Route -> controller -> (Auth0 mocked) -> user model -> app JWT
 */

import request from "supertest";
import dotenv from "dotenv";
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";
process.env.AUTH0_DOMAIN = "dev-test.us.auth0.com";
process.env.AUTH0_CLIENT_ID = "test-client-id";
process.env.AUTH0_CLIENT_SECRET = "test-client-secret";
process.env.AUTH0_REDIRECT_URI = "http://localhost:5000/api/auth/google/callback";
process.env.FRONTEND_URL = "http://localhost:5173";

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

describe("GET /api/auth/google", () => {
  it("should redirect (302) to the Auth0 authorize endpoint", async () => {
    const res = await request(app)
      .get("/api/auth/google")
      .redirects(0);

    expect(res.statusCode).toBe(302);
    const location = res.headers.location;
    expect(location).toContain("https://dev-test.us.auth0.com/authorize");
    expect(location).toContain("response_type=code");
    expect(location).toContain("client_id=test-client-id");
  });
});

describe("GET /api/auth/google/callback", () => {
  it("should reject a missing/invalid state with 400", async () => {
    const res = await request(app)
      .get("/api/auth/google/callback?code=abc&state=forged");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("Invalid OAuth state");
  });
});
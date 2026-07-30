import request from "supertest";
import dotenv from "dotenv";
dotenv.config();

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key";

import app from "../../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./setup.js";
import { DigitalContent } from "../../src/models/content/contentModel.js";
import User from "../../src/models/auth/user.js";

// Cloudinary Mocks are usually done at the module level if you are unit testing, 
// but for integration testing, we rely on the DB. If Cloudinary middleware is hit, 
// we normally either mock it or supply a mock file buffer.
// Assuming your router handles file uploads directly via uploadMiddleware, 
// we will submit mock attachments.

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Simple helper to register, login, and get token */
const getAuthDetails = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Test Contributor",
      email: "upload@test.com",
      password: "password123",
      role: "contentContributor", 
      age: 25,
      countryOfOrigin: "Test",
      currentCountry: "Test"
    });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "upload@test.com", password: "password123" });

  const user = await User.findOne({ email: "upload@test.com" });
  return { token: loginRes.body.content.token, userId: user._id };
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Digital Content Integration Tests", () => {
  
  describe("GET /api/digital-library", () => {
    it("should retrieve contents", async () => {
      // Seed content
      const content = new DigitalContent({
        title: "Test PDF",
        description: "Test PDF Description string",
        category: "Mathematics",
        contentType: "document",
        fileUrl: "http://mockurl.com/file.pdf",
        cloudinaryId: "mockId123"
      });
      await content.save();

      const res = await request(app).get("/api/digital-library");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe("Test PDF");
    });
  });

});

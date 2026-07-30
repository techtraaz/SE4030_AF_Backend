/**
 * Integration tests – Forum API
 * Tests the full stack: route → middleware → controller → service → MongoDB (in-memory)
 *
 * Endpoints covered:
 *   POST   /api/forum
 *   GET    /api/forum
 *   GET    /api/forum/:forumId
 *   PUT    /api/forum/:forumId
 *   POST   /api/forum/:forumId/join
 *   POST   /api/forum/:forumId/leave
 *   POST   /api/forum/:forumId/ban
 *   POST   /api/forum/:forumId/unban
 *   GET    /api/forum/:forumId/members
 */

import request from "supertest";
import dotenv from "dotenv";
dotenv.config();

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

// Helper: Create a user and get token
const createUserAndGetToken = async (email, role = "REFUGEE") => {
  let endpoint = "/api/auth/refugee/signup";
  if (role === "CONTENT_CONTRIBUTOR") {
    endpoint = "/api/auth/contributor/signup";
  }

  const signupRes = await request(app)
    .post(endpoint)
    .send({ email, password: "password123" });

  // If contributor, need to approve first (simulate admin approval by querying DB)
  if (role === "CONTENT_CONTRIBUTOR") {
    const User = (await import("../../src/models/auth/user.js")).default;
    await User.updateOne({ email }, { status: "ACTIVE" });
  }

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "password123" });

  return {
    token: loginRes.body.content.token,
    userId: loginRes.body.content.user._id,
    email
  };
};

// ─── Forum Creation ───────────────────────────────────────────────────────────

describe("POST /api/forum", () => {
  it("should create a forum as an admin", async () => {
    const admin = await createUserAndGetToken("admin@test.com", "CONTENT_CONTRIBUTOR");

    // Mock admin role by modifying user in DB
    const User = (await import("../../src/models/auth/user.js")).default;
    await User.updateOne({ _id: admin.userId }, { role: "ADMIN" });

    const res = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ name: "JavaScript Forum", description: "Discuss JavaScript" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Forum created successfully");
    expect(res.body.content.name).toBe("JavaScript Forum");
    expect(res.body.content.createdBy).toBe(admin.userId);
  });

  it("should create a forum as a content contributor", async () => {
    const contributor = await createUserAndGetToken("contrib@test.com", "CONTENT_CONTRIBUTOR");

    const res = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${contributor.token}`)
      .send({ name: "Python Forum", description: "Discuss Python" });

    expect(res.statusCode).toBe(201);
    expect(res.body.content.name).toBe("Python Forum");
  });

  it("should return 403 when a refugee tries to create a forum", async () => {
    const refugee = await createUserAndGetToken("refugee@test.com");

    const res = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${refugee.token}`)
      .send({ name: "Refugee Forum", description: "For refugees" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Unauthorized to create a forum");
  });

  it("should return 409 when creating a forum with duplicate name", async () => {
    const contributor = await createUserAndGetToken("contrib2@test.com", "CONTENT_CONTRIBUTOR");

    await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${contributor.token}`)
      .send({ name: "Duplicate Forum", description: "First" });

    const res = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${contributor.token}`)
      .send({ name: "Duplicate Forum", description: "Second" });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Forum with this name already exists");
  });
});

// ─── Get All Forums ───────────────────────────────────────────────────────────

describe("GET /api/forum", () => {
  it("should fetch all active forums", async () => {
    const contributor = await createUserAndGetToken("contrib3@test.com", "CONTENT_CONTRIBUTOR");

    // Create two forums
    await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${contributor.token}`)
      .send({ name: "Forum 1", description: "Desc 1" });

    await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${contributor.token}`)
      .send({ name: "Forum 2", description: "Desc 2" });

    const res = await request(app)
      .get("/api/forum");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Forums fetched successfully");
    expect(res.body.content.length).toBe(2);
    expect(res.body.content[0]).toHaveProperty("memberCount");
    expect(res.body.content[0]).toHaveProperty("postCount");
  });

  it("should return empty array when no forums exist", async () => {
    const res = await request(app)
      .get("/api/forum");

    expect(res.statusCode).toBe(200);
    expect(res.body.content.length).toBe(0);
  });
});

// ─── Get Forum By ID ──────────────────────────────────────────────────────────

describe("GET /api/forum/:forumId", () => {
  it("should fetch a forum by ID", async () => {
    const contributor = await createUserAndGetToken("contrib4@test.com", "CONTENT_CONTRIBUTOR");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${contributor.token}`)
      .send({ name: "Get Forum Test", description: "Test description" });

    const forumId = createRes.body.content._id;

    const res = await request(app)
      .get(`/api/forum/${forumId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Forum fetched successfully");
    expect(res.body.content._id).toBe(forumId);
    expect(res.body.content.name).toBe("Get Forum Test");
  });

  it("should return 404 when forum does not exist", async () => {
    const fakeId = "000000000000000000000000";
    const res = await request(app)
      .get(`/api/forum/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Forum not found");
  });
});

// ─── Update Forum ─────────────────────────────────────────────────────────────

describe("PUT /api/forum/:forumId", () => {
  it("should update a forum as the creator", async () => {
    const creator = await createUserAndGetToken("creator@test.com", "CONTENT_CONTRIBUTOR");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Original Name", description: "Original description" });

    const forumId = createRes.body.content._id;

    const res = await request(app)
      .put(`/api/forum/${forumId}`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Updated Name", description: "Updated description" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Forum updated successfully");
    expect(res.body.content.name).toBe("Updated Name");
    expect(res.body.content.description).toBe("Updated description");
  });

  it("should return 403 when non-creator tries to update", async () => {
    const creator = await createUserAndGetToken("creator2@test.com", "CONTENT_CONTRIBUTOR");
    const other = await createUserAndGetToken("other@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Forum to Update", description: "Desc" });

    const forumId = createRes.body.content._id;

    const res = await request(app)
      .put(`/api/forum/${forumId}`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ name: "Hacked Name" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Unauthorized to update this forum");
  });

  it("should return 404 when forum does not exist", async () => {
    const user = await createUserAndGetToken("user@test.com", "CONTENT_CONTRIBUTOR");
    const fakeId = "000000000000000000000000";

    const res = await request(app)
      .put(`/api/forum/${fakeId}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ name: "New Name" });

    expect(res.statusCode).toBe(404);
  });
});

// ─── Join Forum ───────────────────────────────────────────────────────────────

describe("POST /api/forum/:forumId/join", () => {
  it("should allow a user to join a forum", async () => {
    const creator = await createUserAndGetToken("creator3@test.com", "CONTENT_CONTRIBUTOR");
    const joiner = await createUserAndGetToken("joiner@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Join Test Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    const res = await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${joiner.token}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Joined forum successfully");
    expect(res.body.content.userId).toBe(joiner.userId);
    expect(res.body.content.forumId).toBe(forumId);
  });

  it("should return 409 when user tries to join twice", async () => {
    const creator = await createUserAndGetToken("creator4@test.com", "CONTENT_CONTRIBUTOR");
    const joiner = await createUserAndGetToken("joiner2@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Double Join Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    // First join
    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${joiner.token}`);

    // Second join attempt
    const res = await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${joiner.token}`);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("You are already a member of this forum");
  });

  it("should return 404 when joining a non-existent forum", async () => {
    const user = await createUserAndGetToken("user2@test.com");
    const fakeId = "000000000000000000000000";

    const res = await request(app)
      .post(`/api/forum/${fakeId}/join`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Forum not found");
  });
});

// ─── Leave Forum ──────────────────────────────────────────────────────────────

describe("POST /api/forum/:forumId/leave", () => {
  it("should allow a user to leave a forum", async () => {
    const creator = await createUserAndGetToken("creator5@test.com", "CONTENT_CONTRIBUTOR");
    const member = await createUserAndGetToken("member@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Leave Test Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    // Join first
    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${member.token}`);

    // Leave
    const res = await request(app)
      .post(`/api/forum/${forumId}/leave`)
      .set("Authorization", `Bearer ${member.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Left forum successfully");
  });

  it("should return 404 when leaving a forum without joining", async () => {
    const creator = await createUserAndGetToken("creator6@test.com", "CONTENT_CONTRIBUTOR");
    const nonMember = await createUserAndGetToken("nonmember@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Not Joined Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    const res = await request(app)
      .post(`/api/forum/${forumId}/leave`)
      .set("Authorization", `Bearer ${nonMember.token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("You are not a member of this forum");
  });
});

// ─── Ban User ─────────────────────────────────────────────────────────────────

describe("POST /api/forum/:forumId/ban", () => {
  it("should ban a user from a forum as the creator", async () => {
    const creator = await createUserAndGetToken("creator7@test.com", "CONTENT_CONTRIBUTOR");
    const toBan = await createUserAndGetToken("toban@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Ban Test Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    const res = await request(app)
      .post(`/api/forum/${forumId}/ban`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ targetUserId: toBan.userId, reason: "Violating rules" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User banned successfully");
    expect(res.body.content.userId).toBe(toBan.userId);
    expect(res.body.content.reason).toBe("Violating rules");
  });

  it("should prevent a banned user from joining", async () => {
    const creator = await createUserAndGetToken("creator8@test.com", "CONTENT_CONTRIBUTOR");
    const toBan = await createUserAndGetToken("toban2@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Ban Prevention Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    // Ban the user first
    await request(app)
      .post(`/api/forum/${forumId}/ban`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ targetUserId: toBan.userId, reason: "Banned" });

    // Try to join
    const res = await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${toBan.token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("You are banned from this forum");
  });

  it("should return 409 when banning an already banned user", async () => {
    const creator = await createUserAndGetToken("creator9@test.com", "CONTENT_CONTRIBUTOR");
    const toBan = await createUserAndGetToken("toban3@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Double Ban Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    // First ban
    await request(app)
      .post(`/api/forum/${forumId}/ban`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ targetUserId: toBan.userId, reason: "First ban" });

    // Second ban attempt
    const res = await request(app)
      .post(`/api/forum/${forumId}/ban`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ targetUserId: toBan.userId, reason: "Second ban" });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("User is already banned from this forum");
  });

  it("should return 403 when non-creator tries to ban", async () => {
    const creator = await createUserAndGetToken("creator10@test.com", "CONTENT_CONTRIBUTOR");
    const other = await createUserAndGetToken("other2@test.com");
    const toBan = await createUserAndGetToken("toban4@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Ban Unauthorized Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    const res = await request(app)
      .post(`/api/forum/${forumId}/ban`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ targetUserId: toBan.userId, reason: "Unauthorized ban" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Unauthorized/);
  });
});

// ─── Unban User ───────────────────────────────────────────────────────────────

describe("POST /api/forum/:forumId/unban", () => {
  it("should unban a user from a forum as the creator", async () => {
    const creator = await createUserAndGetToken("creator11@test.com", "CONTENT_CONTRIBUTOR");
    const toBan = await createUserAndGetToken("toban5@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Unban Test Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    // Ban the user first
    await request(app)
      .post(`/api/forum/${forumId}/ban`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ targetUserId: toBan.userId, reason: "Banned" });

    // Unban
    const res = await request(app)
      .post(`/api/forum/${forumId}/unban`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ targetUserId: toBan.userId });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User unbanned successfully");
    expect(res.body.content.isActive).toBe(false);
  });

  it("should return 404 when unbanning a non-banned user", async () => {
    const creator = await createUserAndGetToken("creator12@test.com", "CONTENT_CONTRIBUTOR");
    const user = await createUserAndGetToken("user3@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Unban Nonexistent Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    const res = await request(app)
      .post(`/api/forum/${forumId}/unban`)
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ targetUserId: user.userId });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No active ban found for this user");
  });
});

// ─── Get Forum Members ────────────────────────────────────────────────────────

describe("GET /api/forum/:forumId/members", () => {
  it("should fetch forum members with pagination", async () => {
    const creator = await createUserAndGetToken("creator13@test.com", "CONTENT_CONTRIBUTOR");
    const member1 = await createUserAndGetToken("member1@test.com");
    const member2 = await createUserAndGetToken("member2@test.com");

    const createRes = await request(app)
      .post("/api/forum")
      .set("Authorization", `Bearer ${creator.token}`)
      .send({ name: "Members Forum", description: "Test" });

    const forumId = createRes.body.content._id;

    // Add members
    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${member1.token}`);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${member2.token}`);

    const res = await request(app)
      .get(`/api/forum/${forumId}/members?page=1&limit=10`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Forum members fetched successfully");
    expect(res.body.content.members.length).toBe(2);
    expect(res.body.content.total).toBe(2);
  });

  it("should return 404 for non-existent forum members", async () => {
    const fakeId = "000000000000000000000000";
    const res = await request(app)
      .get(`/api/forum/${fakeId}/members`);

    expect(res.statusCode).toBe(404);
  });
});

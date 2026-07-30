/**
 * Integration tests – Forum Posts API
 * Tests post creation, retrieval, updates, and deletions
 *
 * Endpoints covered:
 *   POST   /api/forum/:forumId/posts
 *   GET    /api/forum/:forumId/posts
 *   GET    /api/forum/:forumId/posts/:postId
 *   PUT    /api/forum/:forumId/posts/:postId
 *   DELETE /api/forum/:forumId/posts/:postId
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

// Helper: Create user and get token
const createUserAndGetToken = async (email, role = "REFUGEE") => {
  let endpoint = "/api/auth/refugee/signup";
  if (role === "CONTENT_CONTRIBUTOR") {
    endpoint = "/api/auth/contributor/signup";
  }

  const signupRes = await request(app)
    .post(endpoint)
    .send({ email, password: "password123" });

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

// Helper: Create forum
const createForum = async (contributor) => {
  const res = await request(app)
    .post("/api/forum")
    .set("Authorization", `Bearer ${contributor.token}`)
    .send({ name: `Forum ${Date.now()}`, description: "Test forum" });

  return res.body.content._id;
};

// ─── Create Post ──────────────────────────────────────────────────────────────

describe("POST /api/forum/:forumId/posts", () => {
  it("should create a post as a forum member", async () => {
    const contributor = await createUserAndGetToken("contrib@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author@test.com");

    const forumId = await createForum(contributor);

    // Join forum first
    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${author.token}`);

    const res = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({
        title: "My First Post",
        content: "This is the content of my post"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Post created successfully");
    expect(res.body.content.title).toBe("My First Post");
    expect(res.body.content.content).toBe("This is the content of my post");
    expect(res.body.content.authorId).toBe(author.userId);
  });

  it("should return 403 when non-member tries to post", async () => {
    const contributor = await createUserAndGetToken("contrib2@test.com", "CONTENT_CONTRIBUTOR");
    const nonMember = await createUserAndGetToken("nonmember@test.com");

    const forumId = await createForum(contributor);

    const res = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${nonMember.token}`)
      .send({
        title: "Unauthorized Post",
        content: "Should fail"
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/join|banned/);
  });

  it("should return 403 when banned user tries to post", async () => {
    const contributor = await createUserAndGetToken("contrib3@test.com", "CONTENT_CONTRIBUTOR");
    const toBan = await createUserAndGetToken("toban@test.com");

    const forumId = await createForum(contributor);

    // Join first
    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${toBan.token}`);

    // Ban the user
    await request(app)
      .post(`/api/forum/${forumId}/ban`)
      .set("Authorization", `Bearer ${contributor.token}`)
      .send({ targetUserId: toBan.userId, reason: "Spam" });

    const res = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${toBan.token}`)
      .send({
        title: "Banned Post",
        content: "Should fail"
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/banned/);
  });

  it("should return 404 when posting to non-existent forum", async () => {
    const user = await createUserAndGetToken("user@test.com");
    const fakeId = "000000000000000000000000";

    const res = await request(app)
      .post(`/api/forum/${fakeId}/posts`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({
        title: "Nonexistent Forum Post",
        content: "Content"
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Forum not found");
  });
});

// ─── Get Posts By Forum ───────────────────────────────────────────────────────

describe("GET /api/forum/:forumId/posts", () => {
  it("should fetch posts from a forum with pagination", async () => {
    const contributor = await createUserAndGetToken("contrib4@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author2@test.com");

    const forumId = await createForum(contributor);

    // Join and create posts
    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${author.token}`);

    await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "Post 1", content: "Content 1" });

    await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "Post 2", content: "Content 2" });

    const res = await request(app)
      .get(`/api/forum/${forumId}/posts?page=1&limit=10`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Posts fetched successfully");
    expect(res.body.content.posts.length).toBe(2);
    expect(res.body.content.total).toBe(2);
  });

  it("should return 404 for non-existent forum posts", async () => {
    const fakeId = "000000000000000000000000";
    const res = await request(app)
      .get(`/api/forum/${fakeId}/posts`);

    expect(res.statusCode).toBe(404);
  });
});

// ─── Get Post By ID ───────────────────────────────────────────────────────────

describe("GET /api/forum/:forumId/posts/:postId", () => {
  it("should fetch a single post", async () => {
    const contributor = await createUserAndGetToken("contrib5@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author3@test.com");

    const forumId = await createForum(contributor);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${author.token}`);

    const createRes = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "Single Post", content: "Content" });

    const postId = createRes.body.content._id;

    const res = await request(app)
      .get(`/api/forum/${forumId}/posts/${postId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Post fetched successfully");
    expect(res.body.content._id).toBe(postId);
    expect(res.body.content.title).toBe("Single Post");
  });

  it("should return 404 for non-existent post", async () => {
    const contributor = await createUserAndGetToken("contrib6@test.com", "CONTENT_CONTRIBUTOR");
    const forumId = await createForum(contributor);
    const fakePostId = "000000000000000000000000";

    const res = await request(app)
      .get(`/api/forum/${forumId}/posts/${fakePostId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Post not found");
  });
});

// ─── Update Post ──────────────────────────────────────────────────────────────

describe("PUT /api/forum/:forumId/posts/:postId", () => {
  it("should update a post as the author", async () => {
    const contributor = await createUserAndGetToken("contrib7@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author4@test.com");

    const forumId = await createForum(contributor);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${author.token}`);

    const createRes = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "Original Title", content: "Original Content" });

    const postId = createRes.body.content._id;

    const res = await request(app)
      .put(`/api/forum/${forumId}/posts/${postId}`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "Updated Title", content: "Updated Content" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Post updated successfully");
    expect(res.body.content.title).toBe("Updated Title");
    expect(res.body.content.content).toBe("Updated Content");
  });

  it("should return 403 when non-author tries to update", async () => {
    const contributor = await createUserAndGetToken("contrib8@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author5@test.com");
    const other = await createUserAndGetToken("other@test.com");

    const forumId = await createForum(contributor);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${author.token}`);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${other.token}`);

    const createRes = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "Protected Post", content: "Content" });

    const postId = createRes.body.content._id;

    const res = await request(app)
      .put(`/api/forum/${forumId}/posts/${postId}`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ title: "Hacked Title" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Unauthorized/);
  });

  it("should return 404 when updating non-existent post", async () => {
    const contributor = await createUserAndGetToken("contrib9@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author6@test.com");

    const forumId = await createForum(contributor);
    const fakePostId = "000000000000000000000000";

    const res = await request(app)
      .put(`/api/forum/${forumId}/posts/${fakePostId}`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "New Title" });

    expect(res.statusCode).toBe(404);
  });
});

// ─── Delete Post ──────────────────────────────────────────────────────────────

describe("DELETE /api/forum/:forumId/posts/:postId", () => {
  it("should delete a post as the author", async () => {
    const contributor = await createUserAndGetToken("contrib10@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author7@test.com");

    const forumId = await createForum(contributor);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${author.token}`);

    const createRes = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "To Delete", content: "Content" });

    const postId = createRes.body.content._id;

    const res = await request(app)
      .delete(`/api/forum/${forumId}/posts/${postId}`)
      .set("Authorization", `Bearer ${author.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Post deleted successfully");
  });

  it("should not allow re-accessing a deleted post", async () => {
    const contributor = await createUserAndGetToken("contrib11@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author8@test.com");

    const forumId = await createForum(contributor);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${author.token}`);

    const createRes = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "To Delete", content: "Content" });

    const postId = createRes.body.content._id;

    // Delete
    await request(app)
      .delete(`/api/forum/${forumId}/posts/${postId}`)
      .set("Authorization", `Bearer ${author.token}`);

    // Try to access
    const res = await request(app)
      .get(`/api/forum/${forumId}/posts/${postId}`);

    expect(res.statusCode).toBe(404);
  });

  it("should return 403 when non-author tries to delete", async () => {
    const contributor = await createUserAndGetToken("contrib12@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author9@test.com");
    const other = await createUserAndGetToken("other2@test.com");

    const forumId = await createForum(contributor);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${author.token}`);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${other.token}`);

    const createRes = await request(app)
      .post(`/api/forum/${forumId}/posts`)
      .set("Authorization", `Bearer ${author.token}`)
      .send({ title: "Protected Post", content: "Content" });

    const postId = createRes.body.content._id;

    const res = await request(app)
      .delete(`/api/forum/${forumId}/posts/${postId}`)
      .set("Authorization", `Bearer ${other.token}`);

    expect(res.statusCode).toBe(403);
  });
});

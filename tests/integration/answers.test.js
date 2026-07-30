/**
 * Integration tests – Forum Answers API
 * Tests answer creation, retrieval, updates, deletions, and acceptance
 *
 * Endpoints covered:
 *   POST   /api/forum/:forumId/posts/:postId/answers
 *   GET    /api/forum/:forumId/posts/:postId/answers
 *   PUT    /api/forum/:forumId/answers/:answerId
 *   DELETE /api/forum/:forumId/answers/:answerId
 *   POST   /api/forum/:forumId/answers/:answerId/accept
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

// Helper: Create forum and post
const createForumAndPost = async (contributor, author) => {
  const forumRes = await request(app)
    .post("/api/forum")
    .set("Authorization", `Bearer ${contributor.token}`)
    .send({ name: `Forum ${Date.now()}`, description: "Test forum" });

  const forumId = forumRes.body.content._id;

  // Join forum
  await request(app)
    .post(`/api/forum/${forumId}/join`)
    .set("Authorization", `Bearer ${author.token}`);

  // Create post
  const postRes = await request(app)
    .post(`/api/forum/${forumId}/posts`)
    .set("Authorization", `Bearer ${author.token}`)
    .send({ title: "Question Post", content: "What is this?" });

  const postId = postRes.body.content._id;

  return { forumId, postId };
};

// ─── Create Answer ────────────────────────────────────────────────────────────

describe("POST /api/forum/:forumId/posts/:postId/answers", () => {
  it("should create an answer as a forum member", async () => {
    const contributor = await createUserAndGetToken("contrib@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author@test.com");
    const answerer = await createUserAndGetToken("answerer@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    // Answerer joins forum
    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    const res = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "This is an answer" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Answer created successfully");
    expect(res.body.content.content).toBe("This is an answer");
    expect(res.body.content.authorId).toBe(answerer.userId);
  });

  it("should return 403 when non-member tries to answer", async () => {
    const contributor = await createUserAndGetToken("contrib2@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author2@test.com");
    const nonMember = await createUserAndGetToken("nonmember@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    const res = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${nonMember.token}`)
      .send({ content: "Unauthorized answer" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/join|banned/);
  });

  it("should return 404 when posting answer to non-existent post", async () => {
    const user = await createUserAndGetToken("user@test.com");
    const fakeForumId = "000000000000000000000000";
    const fakePostId = "000000000000000000000000";

    const res = await request(app)
      .post(`/api/forum/${fakeForumId}/posts/${fakePostId}/answers`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Answer" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Post not found");
  });

  it("should increment post answerCount when creating answer", async () => {
    const contributor = await createUserAndGetToken("contrib3@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author3@test.com");
    const answerer = await createUserAndGetToken("answerer2@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    // Get initial post
    const initialPost = await request(app)
      .get(`/api/forum/${forumId}/posts/${postId}`);

    const initialAnswerCount = initialPost.body.content.answerCount || 0;

    // Create answer
    await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Answer 1" });

    // Check updated post
    const updatedPost = await request(app)
      .get(`/api/forum/${forumId}/posts/${postId}`);

    expect(updatedPost.body.content.answerCount).toBe(initialAnswerCount + 1);
  });
});

// ─── Get Answers By Post ──────────────────────────────────────────────────────

describe("GET /api/forum/:forumId/posts/:postId/answers", () => {
  it("should fetch answers for a post", async () => {
    const contributor = await createUserAndGetToken("contrib4@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author4@test.com");
    const answerer = await createUserAndGetToken("answerer3@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    // Create multiple answers
    await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Answer 1" });

    await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Answer 2" });

    const res = await request(app)
      .get(`/api/forum/${forumId}/posts/${postId}/answers`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Answers fetched successfully");
    expect(res.body.content.length).toBe(2);
  });

  it("should return 404 for non-existent post answers", async () => {
    const fakeForumId = "000000000000000000000000";
    const fakePostId = "000000000000000000000000";

    const res = await request(app)
      .get(`/api/forum/${fakeForumId}/posts/${fakePostId}/answers`);

    expect(res.statusCode).toBe(404);
  });
});

// ─── Update Answer ────────────────────────────────────────────────────────────

describe("PUT /api/forum/:forumId/answers/:answerId", () => {
  it("should update an answer as the author", async () => {
    const contributor = await createUserAndGetToken("contrib5@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author5@test.com");
    const answerer = await createUserAndGetToken("answerer4@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    const answerRes = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Original answer" });

    const answerId = answerRes.body.content._id;

    const res = await request(app)
      .put(`/api/forum/${forumId}/answers/${answerId}`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Updated answer" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Answer updated successfully");
    expect(res.body.content.content).toBe("Updated answer");
  });

  it("should return 403 when non-author tries to update", async () => {
    const contributor = await createUserAndGetToken("contrib6@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author6@test.com");
    const answerer = await createUserAndGetToken("answerer5@test.com");
    const other = await createUserAndGetToken("other@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${other.token}`);

    const answerRes = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Protected answer" });

    const answerId = answerRes.body.content._id;

    const res = await request(app)
      .put(`/api/forum/${forumId}/answers/${answerId}`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ content: "Hacked answer" });

    expect(res.statusCode).toBe(403);
  });

  it("should return 404 when updating non-existent answer", async () => {
    const user = await createUserAndGetToken("user@test.com");
    const fakeAnswerId = "000000000000000000000000";

    const res = await request(app)
      .put(`/api/forum/any-forum-id/answers/${fakeAnswerId}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "New content" });

    expect(res.statusCode).toBe(404);
  });
});

// ─── Delete Answer ────────────────────────────────────────────────────────────

describe("DELETE /api/forum/:forumId/answers/:answerId", () => {
  it("should delete an answer as the author", async () => {
    const contributor = await createUserAndGetToken("contrib7@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author7@test.com");
    const answerer = await createUserAndGetToken("answerer6@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    const answerRes = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "To delete" });

    const answerId = answerRes.body.content._id;

    const res = await request(app)
      .delete(`/api/forum/${forumId}/answers/${answerId}`)
      .set("Authorization", `Bearer ${answerer.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Answer deleted successfully");
  });

  it("should decrement post answerCount when deleting", async () => {
    const contributor = await createUserAndGetToken("contrib8@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author8@test.com");
    const answerer = await createUserAndGetToken("answerer7@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    const answerRes = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Answer" });

    const answerId = answerRes.body.content._id;

    // Check count before delete
    const beforeDelete = await request(app)
      .get(`/api/forum/${forumId}/posts/${postId}`);

    const countBeforeDelete = beforeDelete.body.content.answerCount;

    // Delete
    await request(app)
      .delete(`/api/forum/${forumId}/answers/${answerId}`)
      .set("Authorization", `Bearer ${answerer.token}`);

    // Check count after delete
    const afterDelete = await request(app)
      .get(`/api/forum/${forumId}/posts/${postId}`);

    expect(afterDelete.body.content.answerCount).toBe(countBeforeDelete - 1);
  });

  it("should return 403 when non-author tries to delete", async () => {
    const contributor = await createUserAndGetToken("contrib9@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author9@test.com");
    const answerer = await createUserAndGetToken("answerer8@test.com");
    const other = await createUserAndGetToken("other2@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${other.token}`);

    const answerRes = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Protected answer" });

    const answerId = answerRes.body.content._id;

    const res = await request(app)
      .delete(`/api/forum/${forumId}/answers/${answerId}`)
      .set("Authorization", `Bearer ${other.token}`);

    expect(res.statusCode).toBe(403);
  });
});

// ─── Accept Answer ────────────────────────────────────────────────────────────

describe("POST /api/forum/:forumId/answers/:answerId/accept", () => {
  it("should accept an answer as the post author", async () => {
    const contributor = await createUserAndGetToken("contrib10@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author10@test.com");
    const answerer = await createUserAndGetToken("answerer9@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    const answerRes = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Good answer" });

    const answerId = answerRes.body.content._id;

    const res = await request(app)
      .post(`/api/forum/${forumId}/answers/${answerId}/accept`)
      .set("Authorization", `Bearer ${author.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Answer accepted successfully");
    expect(res.body.content.isAccepted).toBe(true);
  });

  it("should return 403 when non-post-author tries to accept", async () => {
    const contributor = await createUserAndGetToken("contrib11@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author11@test.com");
    const answerer = await createUserAndGetToken("answerer10@test.com");
    const other = await createUserAndGetToken("other3@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${other.token}`);

    const answerRes = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Answer" });

    const answerId = answerRes.body.content._id;

    const res = await request(app)
      .post(`/api/forum/${forumId}/answers/${answerId}/accept`)
      .set("Authorization", `Bearer ${other.token}`);

    expect(res.statusCode).toBe(403);
  });

  it("should unaccept previous answer when accepting a new one", async () => {
    const contributor = await createUserAndGetToken("contrib12@test.com", "CONTENT_CONTRIBUTOR");
    const author = await createUserAndGetToken("author12@test.com");
    const answerer = await createUserAndGetToken("answerer11@test.com");

    const { forumId, postId } = await createForumAndPost(contributor, author);

    await request(app)
      .post(`/api/forum/${forumId}/join`)
      .set("Authorization", `Bearer ${answerer.token}`);

    // Create two answers
    const answer1Res = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "First answer" });

    const answer2Res = await request(app)
      .post(`/api/forum/${forumId}/posts/${postId}/answers`)
      .set("Authorization", `Bearer ${answerer.token}`)
      .send({ content: "Second answer" });

    const answerId1 = answer1Res.body.content._id;
    const answerId2 = answer2Res.body.content._id;

    // Accept first
    await request(app)
      .post(`/api/forum/${forumId}/answers/${answerId1}/accept`)
      .set("Authorization", `Bearer ${author.token}`);

    // Accept second
    await request(app)
      .post(`/api/forum/${forumId}/answers/${answerId2}/accept`)
      .set("Authorization", `Bearer ${author.token}`);

    // Verify second is accepted
    const answer2Check = await request(app)
      .get(`/api/forum/${forumId}/posts/${postId}/answers`);

    // Only one answer should be accepted
    const acceptedAnswers = answer2Check.body.content.filter(a => a.isAccepted);
    expect(acceptedAnswers.length).toBe(1);
    expect(acceptedAnswers[0]._id).toBe(answerId2);
  });

  it("should return 404 when accepting non-existent answer", async () => {
    const user = await createUserAndGetToken("user@test.com");
    const fakeAnswerId = "000000000000000000000000";

    const res = await request(app)
      .post(`/api/forum/any-forum/answers/${fakeAnswerId}/accept`)
      .set("Authorization", `Bearer ${user.token}`);

    expect(res.statusCode).toBe(404);
  });
});

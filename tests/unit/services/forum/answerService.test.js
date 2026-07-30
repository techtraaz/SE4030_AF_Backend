/**
 * Unit tests – Answer Service
 * Tests answer business logic
 */

import * as answerService from "../../../../src/service/forum/answerService.js";
import Forum from "../../../../src/models/forum/forum.js";
import ForumMembership from "../../../../src/models/forum/forumMembership.js";
import ForumBan from "../../../../src/models/forum/forumBan.js";
import Post from "../../../../src/models/forum/post.js";
import Answer from "../../../../src/models/forum/answer.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../../../integration/setup.js";
import { ROLES } from "../../../../src/utils/constants.js";

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

const mockUserId = "000000000000000000000001";
const mockUserId2 = "000000000000000000000002";
const mockUserId3 = "000000000000000000000003";

// Helper: Setup forum and post
const setupForumAndPost = async (authorId = mockUserId, memberId = mockUserId) => {
  const forum = await Forum.create({
    name: `Forum ${Date.now()}`,
    description: "Test forum",
    createdBy: mockUserId,
    isActive: true
  });

  // Add members
  if (authorId !== mockUserId) {
    await ForumMembership.create({
      forumId: forum._id,
      userId: authorId
    });
  }

  await ForumMembership.create({
    forumId: forum._id,
    userId: memberId
  });

  const post = await Post.create({
    forumId: forum._id,
    authorId: authorId,
    title: "Question",
    content: "What is this?"
  });

  return { forumId: forum._id, postId: post._id };
};

describe("Answer Service", () => {
  // ─── Create Answer ────────────────────────────────────────────────────

  describe("createAnswer", () => {
    it("should create an answer as a forum member", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId,
        postId,
        "This is the answer"
      );

      expect(answer.content).toBe("This is the answer");
      expect(answer.authorId.toString()).toBe(mockUserId);
      expect(answer.isDeleted).toBe(false);
    });

    it("should increment post answerCount", async () => {
      const { forumId, postId } = await setupForumAndPost();

      const post1 = await Post.findById(postId);
      const initialCount = post1.answerCount || 0;

      await answerService.createAnswer(mockUserId, postId, "Answer");

      const post2 = await Post.findById(postId);
      expect(post2.answerCount).toBe(initialCount + 1);
    });

    it("should throw error when non-member creates answer", async () => {
      const { postId } = await setupForumAndPost();

      await expect(
        answerService.createAnswer(mockUserId2, postId, "Unauthorized")
      ).rejects.toThrow("You must join the forum first");
    });

    it("should throw error when banned user creates answer", async () => {
      const { forumId, postId } = await setupForumAndPost();

      await ForumBan.create({
        forumId,
        userId: mockUserId2,
        bannedBy: mockUserId,
        reason: "Spam",
        isActive: true
      });

      await ForumMembership.create({
        forumId,
        userId: mockUserId2
      });

      await expect(
        answerService.createAnswer(mockUserId2, postId, "Banned")
      ).rejects.toThrow("You are banned from this forum");
    });

    it("should throw error for non-existent post", async () => {
      const fakePostId = "000000000000000000000000";

      await expect(
        answerService.createAnswer(mockUserId, fakePostId, "Answer")
      ).rejects.toThrow("Post not found");
    });
  });

  // ─── Get Answers By Post ───────────────────────────────────────────────

  describe("getAnswersByPost", () => {
    it("should fetch answers for a post", async () => {
      const { postId } = await setupForumAndPost();

      await answerService.createAnswer(mockUserId, postId, "Answer 1");
      await answerService.createAnswer(mockUserId, postId, "Answer 2");

      const answers = await answerService.getAnswersByPost(postId);

      expect(answers.length).toBe(2);
    });

    it("should not include deleted answers", async () => {
      const { postId } = await setupForumAndPost();

      const ans1 = await answerService.createAnswer(
        mockUserId,
        postId,
        "Answer 1"
      );

      await answerService.createAnswer(mockUserId, postId, "Answer 2");

      // Delete first answer
      await Answer.updateOne({ _id: ans1._id }, { isDeleted: true });

      const answers = await answerService.getAnswersByPost(postId);

      expect(answers.length).toBe(1);
      expect(answers[0]._id.toString()).not.toBe(ans1._id.toString());
    });

    it("should sort by accepted status and upvotes", async () => {
      const { postId } = await setupForumAndPost();

      const ans1 = await answerService.createAnswer(
        mockUserId,
        postId,
        "Answer 1"
      );

      const ans2 = await answerService.createAnswer(
        mockUserId,
        postId,
        "Answer 2"
      );

      // Upvote ans2
      await Answer.updateOne({ _id: ans2._id }, { upvoteCount: 10 });

      const answers = await answerService.getAnswersByPost(postId);

      // Accepted first, then by upvotes
      expect(answers[0]._id.toString()).toBe(ans2._id.toString());
    });

    it("should throw error for non-existent post", async () => {
      const fakePostId = "000000000000000000000000";

      await expect(
        answerService.getAnswersByPost(fakePostId)
      ).rejects.toThrow("Post not found");
    });
  });

  // ─── Update Answer ────────────────────────────────────────────────────

  describe("updateAnswer", () => {
    it("should update an answer as author", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId,
        postId,
        "Original content"
      );

      const updated = await answerService.updateAnswer(
        mockUserId,
        answer._id,
        "Updated content"
      );

      expect(updated.content).toBe("Updated content");
    });

    it("should throw error when non-author updates", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId,
        postId,
        "Protected"
      );

      await expect(
        answerService.updateAnswer(mockUserId2, answer._id, "Hacked")
      ).rejects.toThrow("Unauthorized to update this answer");
    });

    it("should throw error for non-existent answer", async () => {
      const fakeAnswerId = "000000000000000000000000";

      await expect(
        answerService.updateAnswer(mockUserId, fakeAnswerId, "New content")
      ).rejects.toThrow("Answer not found");
    });
  });

  // ─── Delete Answer ────────────────────────────────────────────────────

  describe("deleteAnswer", () => {
    it("should delete an answer as author", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId,
        postId,
        "To delete"
      );

      const deleted = await answerService.deleteAnswer(
        mockUserId,
        ROLES.REFUGEE,
        answer._id
      );

      expect(deleted.isDeleted).toBe(true);
    });

    it("should delete an answer as admin", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId,
        postId,
        "To delete"
      );

      const deleted = await answerService.deleteAnswer(
        mockUserId2,
        ROLES.ADMIN,
        answer._id
      );

      expect(deleted.isDeleted).toBe(true);
    });

    it("should decrement post answerCount", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId,
        postId,
        "Answer"
      );

      const post1 = await Post.findById(postId);
      const countBefore = post1.answerCount;

      await answerService.deleteAnswer(mockUserId, ROLES.REFUGEE, answer._id);

      const post2 = await Post.findById(postId);
      expect(post2.answerCount).toBe(countBefore - 1);
    });

    it("should throw error when unauthorized user deletes", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId,
        postId,
        "Protected"
      );

      await expect(
        answerService.deleteAnswer(mockUserId2, ROLES.REFUGEE, answer._id)
      ).rejects.toThrow("Unauthorized to delete this answer");
    });
  });

  // ─── Accept Answer ────────────────────────────────────────────────────

  describe("acceptAnswer", () => {
    it("should accept an answer as post author", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId2,
        postId,
        "Great answer"
      );

      const accepted = await answerService.acceptAnswer(mockUserId, answer._id);

      expect(accepted.isAccepted).toBe(true);
    });

    it("should unaccept previous answer when accepting new one", async () => {
      const { postId } = await setupForumAndPost();

      const ans1 = await answerService.createAnswer(
        mockUserId2,
        postId,
        "Answer 1"
      );

      const ans2 = await answerService.createAnswer(
        mockUserId2,
        postId,
        "Answer 2"
      );

      // Accept first
      await answerService.acceptAnswer(mockUserId, ans1._id);

      // Accept second
      await answerService.acceptAnswer(mockUserId, ans2._id);

      // Check states
      const checkAns1 = await Answer.findById(ans1._id);
      const checkAns2 = await Answer.findById(ans2._id);

      expect(checkAns1.isAccepted).toBe(false);
      expect(checkAns2.isAccepted).toBe(true);
    });

    it("should throw error when non-post-author tries to accept", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId2,
        postId,
        "Answer"
      );

      await expect(
        answerService.acceptAnswer(mockUserId2, answer._id)
      ).rejects.toThrow("Only the post author can accept an answer");
    });

    it("should throw error for non-existent answer", async () => {
      const fakeAnswerId = "000000000000000000000000";

      await expect(
        answerService.acceptAnswer(mockUserId, fakeAnswerId)
      ).rejects.toThrow("Answer not found");
    });

    it("should throw error when post is not found", async () => {
      const { postId } = await setupForumAndPost();

      const answer = await answerService.createAnswer(
        mockUserId2,
        postId,
        "Answer"
      );

      // Delete the post
      await Post.updateOne({ _id: postId }, { isDeleted: true });

      await expect(
        answerService.acceptAnswer(mockUserId, answer._id)
      ).rejects.toThrow("Post not found");
    });
  });
});

/**
 * Unit tests – Vote Service
 * Tests voting business logic
 */

import * as voteService from "../../../../src/service/forum/voteService.js";
import Forum from "../../../../src/models/forum/forum.js";
import ForumMembership from "../../../../src/models/forum/forumMembership.js";
import ForumBan from "../../../../src/models/forum/forumBan.js";
import Post from "../../../../src/models/forum/post.js";
import Answer from "../../../../src/models/forum/answer.js";
import Vote from "../../../../src/models/forum/vote.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "../../../integration/setup.js";

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

// Helper: Setup forum, post and answer
const setupForumAndContent = async () => {
  const forum = await Forum.create({
    name: `Forum ${Date.now()}`,
    description: "Test forum",
    createdBy: mockUserId,
    isActive: true
  });

  await ForumMembership.create({
    forumId: forum._id,
    userId: mockUserId
  });

  await ForumMembership.create({
    forumId: forum._id,
    userId: mockUserId2
  });

  const post = await Post.create({
    forumId: forum._id,
    authorId: mockUserId,
    title: "Question",
    content: "What?"
  });

  const answer = await Answer.create({
    postId: post._id,
    authorId: mockUserId2,
    content: "Answer"
  });

  return { forumId: forum._id, postId: post._id, answerId: answer._id };
};

describe("Vote Service", () => {
  // ─── Cast Vote on Post ─────────────────────────────────────────────────

  describe("castVote - Post", () => {
    it("should upvote a post", async () => {
      const { postId } = await setupForumAndContent();

      const result = await voteService.castVote(
        mockUserId2,
        postId,
        "Post",
        "upvote"
      );

      expect(result.actionType).toBe("created");
      expect(result.upvoteCount).toBe(1);

      const vote = await Vote.findOne({
        userId: mockUserId2,
        targetId: postId,
        targetType: "Post"
      });

      expect(vote).toBeTruthy();
      expect(vote.voteType).toBe("upvote");
    });

    it("should downvote a post", async () => {
      const { postId } = await setupForumAndContent();

      const result = await voteService.castVote(
        mockUserId2,
        postId,
        "Post",
        "downvote"
      );

      expect(result.actionType).toBe("created");
      expect(result.upvoteCount).toBe(-1);
    });

    it("should remove vote when voting same type twice", async () => {
      const { postId } = await setupForumAndContent();

      // First upvote
      await voteService.castVote(mockUserId2, postId, "Post", "upvote");

      // Second upvote (remove)
      const result = await voteService.castVote(
        mockUserId2,
        postId,
        "Post",
        "upvote"
      );

      expect(result.actionType).toBe("removed");
      expect(result.upvoteCount).toBe(0);

      const vote = await Vote.findOne({
        userId: mockUserId2,
        targetId: postId
      });

      expect(vote).toBeNull();
    });

    it("should change vote when switching type", async () => {
      const { postId } = await setupForumAndContent();

      // Upvote
      await voteService.castVote(mockUserId2, postId, "Post", "upvote");

      // Change to downvote
      const result = await voteService.castVote(
        mockUserId2,
        postId,
        "Post",
        "downvote"
      );

      expect(result.actionType).toBe("updated");
      expect(result.upvoteCount).toBe(-1);

      const vote = await Vote.findOne({
        userId: mockUserId2,
        targetId: postId
      });

      expect(vote.voteType).toBe("downvote");
    });

    it("should throw error when non-member votes", async () => {
      const { postId } = await setupForumAndContent();

      await expect(
        voteService.castVote(mockUserId3, postId, "Post", "upvote")
      ).rejects.toThrow("You must join the forum first");
    });

    it("should throw error when banned user votes", async () => {
      const { forumId, postId } = await setupForumAndContent();

      await ForumBan.create({
        forumId,
        userId: mockUserId3,
        bannedBy: mockUserId,
        reason: "Spam",
        isActive: true
      });

      await ForumMembership.create({
        forumId,
        userId: mockUserId3
      });

      await expect(
        voteService.castVote(mockUserId3, postId, "Post", "upvote")
      ).rejects.toThrow("You are banned from this forum");
    });

    it("should throw error for non-existent post", async () => {
      const fakePostId = "000000000000000000000000";

      await expect(
        voteService.castVote(mockUserId2, fakePostId, "Post", "upvote")
      ).rejects.toThrow("Post not found");
    });
  });

  // ─── Cast Vote on Answer ───────────────────────────────────────────────

  describe("castVote - Answer", () => {
    it("should upvote an answer", async () => {
      const { answerId } = await setupForumAndContent();

      const result = await voteService.castVote(
        mockUserId2,
        answerId,
        "Answer",
        "upvote"
      );

      expect(result.actionType).toBe("created");
      expect(result.upvoteCount).toBe(1);

      const vote = await Vote.findOne({
        userId: mockUserId2,
        targetId: answerId,
        targetType: "Answer"
      });

      expect(vote).toBeTruthy();
      expect(vote.voteType).toBe("upvote");
    });

    it("should remove vote when voting same type twice", async () => {
      const { answerId } = await setupForumAndContent();

      await voteService.castVote(mockUserId2, answerId, "Answer", "upvote");

      const result = await voteService.castVote(
        mockUserId2,
        answerId,
        "Answer",
        "upvote"
      );

      expect(result.actionType).toBe("removed");
      expect(result.upvoteCount).toBe(0);
    });

    it("should change vote when switching type", async () => {
      const { answerId } = await setupForumAndContent();

      await voteService.castVote(mockUserId2, answerId, "Answer", "upvote");

      const result = await voteService.castVote(
        mockUserId2,
        answerId,
        "Answer",
        "downvote"
      );

      expect(result.actionType).toBe("updated");
      expect(result.upvoteCount).toBe(-1);
    });

    it("should throw error for non-existent answer", async () => {
      const fakeAnswerId = "000000000000000000000000";

      await expect(
        voteService.castVote(mockUserId2, fakeAnswerId, "Answer", "upvote")
      ).rejects.toThrow("Answer not found");
    });
  });

  // ─── Vote Count Increments ────────────────────────────────────────────

  describe("Vote count updates", () => {
    it("should correctly increment post upvote count with multiple users", async () => {
      const { postId } = await setupForumAndContent();

      // Three upvotes
      await voteService.castVote(mockUserId, postId, "Post", "upvote");
      await voteService.castVote(mockUserId2, postId, "Post", "upvote");
      await voteService.castVote(mockUserId3, postId, "Post", "upvote");

      const post = await Post.findById(postId);
      expect(post.upvoteCount).toBe(3);
    });

    it("should correctly handle mixed upvotes and downvotes", async () => {
      const { postId } = await setupForumAndContent();

      await voteService.castVote(mockUserId, postId, "Post", "upvote");
      await voteService.castVote(mockUserId2, postId, "Post", "upvote");
      await voteService.castVote(mockUserId3, postId, "Post", "downvote");

      const post = await Post.findById(postId);
      // 1 + 1 - 1 = 1
      expect(post.upvoteCount).toBe(1);
    });

    it("should correctly net upvotes when changing votes", async () => {
      const { postId } = await setupForumAndContent();

      // Initial upvotes: 2
      await voteService.castVote(mockUserId, postId, "Post", "upvote");
      await voteService.castVote(mockUserId2, postId, "Post", "upvote");

      let post = await Post.findById(postId);
      expect(post.upvoteCount).toBe(2);

      // Change mockUserId2's upvote to downvote (delta = -2)
      await voteService.castVote(mockUserId2, postId, "Post", "downvote");

      post = await Post.findById(postId);
      // 2 - 2 = 0
      expect(post.upvoteCount).toBe(0);
    });
  });

  // ─── Error Cases ──────────────────────────────────────────────────────

  describe("Error handling", () => {
    it("should throw error for invalid target type", async () => {
      const { postId } = await setupForumAndContent();

      await expect(
        voteService.castVote(mockUserId2, postId, "InvalidType", "upvote")
      ).rejects.toThrow("Invalid target type");
    });

    it("should throw error when voting on deleted post", async () => {
      const { postId } = await setupForumAndContent();

      await Post.updateOne({ _id: postId }, { isDeleted: true });

      await expect(
        voteService.castVote(mockUserId2, postId, "Post", "upvote")
      ).rejects.toThrow("Post not found");
    });

    it("should throw error when voting on deleted answer", async () => {
      const { answerId } = await setupForumAndContent();

      await Answer.updateOne({ _id: answerId }, { isDeleted: true });

      await expect(
        voteService.castVote(mockUserId2, answerId, "Answer", "upvote")
      ).rejects.toThrow("Answer not found");
    });
  });
});

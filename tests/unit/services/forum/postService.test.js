/**
 * Unit tests – Post Service
 * Tests post business logic
 */

import * as postService from "../../../../src/service/forum/postService.js";
import Forum from "../../../../src/models/forum/forum.js";
import ForumMembership from "../../../../src/models/forum/forumMembership.js";
import ForumBan from "../../../../src/models/forum/forumBan.js";
import Post from "../../../../src/models/forum/post.js";
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

// Helper: Create forum and add member
const setupForum = async () => {
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

  return forum._id;
};

describe("Post Service", () => {
  // ─── Create Post ──────────────────────────────────────────────────────

  describe("createPost", () => {
    it("should create a post as a forum member", async () => {
      const forumId = await setupForum();

      const post = await postService.createPost(mockUserId, forumId, {
        title: "Test Post",
        content: "This is a test post"
      });

      expect(post.title).toBe("Test Post");
      expect(post.content).toBe("This is a test post");
      expect(post.authorId.toString()).toBe(mockUserId);
      expect(post.forumId.toString()).toBe(forumId.toString());
      expect(post.isDeleted).toBe(false);
    });

    it("should throw error when non-member creates post", async () => {
      const forumId = await setupForum();

      await expect(
        postService.createPost(mockUserId2, forumId, {
          title: "Unauthorized",
          content: "Content"
        })
      ).rejects.toThrow("You must join the forum first");
    });

    it("should throw error when banned user creates post", async () => {
      const forumId = await setupForum();

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
        postService.createPost(mockUserId2, forumId, {
          title: "Banned Post",
          content: "Content"
        })
      ).rejects.toThrow("You are banned from this forum");
    });

    it("should throw error when forum not found", async () => {
      const fakeForumId = "000000000000000000000000";

      await expect(
        postService.createPost(mockUserId, fakeForumId, {
          title: "No Forum",
          content: "Content"
        })
      ).rejects.toThrow("Forum not found");
    });
  });

  // ─── Get Posts By Forum ───────────────────────────────────────────────

  describe("getPostsByForum", () => {
    it("should fetch posts with pagination", async () => {
      const forumId = await setupForum();

      await postService.createPost(mockUserId, forumId, {
        title: "Post 1",
        content: "Content 1"
      });

      await postService.createPost(mockUserId, forumId, {
        title: "Post 2",
        content: "Content 2"
      });

      const result = await postService.getPostsByForum(forumId, 1, 10);

      expect(result.posts.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it("should not include deleted posts", async () => {
      const forumId = await setupForum();

      const post1 = await postService.createPost(mockUserId, forumId, {
        title: "Post 1",
        content: "Content 1"
      });

      const post2 = await postService.createPost(mockUserId, forumId, {
        title: "Post 2",
        content: "Content 2"
      });

      // Delete first post
      await Post.updateOne({ _id: post1._id }, { isDeleted: true });

      const result = await postService.getPostsByForum(forumId, 1, 10);

      expect(result.posts.length).toBe(1);
      expect(result.posts[0]._id.toString()).toBe(post2._id.toString());
    });

    it("should throw error for non-existent forum", async () => {
      const fakeForumId = "000000000000000000000000";

      await expect(
        postService.getPostsByForum(fakeForumId, 1, 10)
      ).rejects.toThrow("Forum not found");
    });
  });

  // ─── Get Post By ID ───────────────────────────────────────────────────

  describe("getPostById", () => {
    it("should fetch a post by ID", async () => {
      const forumId = await setupForum();

      const created = await postService.createPost(mockUserId, forumId, {
        title: "Fetch Post",
        content: "Content"
      });

      const post = await postService.getPostById(created._id);

      expect(post._id.toString()).toBe(created._id.toString());
      expect(post.title).toBe("Fetch Post");
    });

    it("should throw error for non-existent post", async () => {
      const fakePostId = "000000000000000000000000";

      await expect(postService.getPostById(fakePostId)).rejects.toThrow(
        "Post not found"
      );
    });

    it("should throw error for deleted post", async () => {
      const forumId = await setupForum();

      const post = await postService.createPost(mockUserId, forumId, {
        title: "To Delete",
        content: "Content"
      });

      await Post.updateOne({ _id: post._id }, { isDeleted: true });

      await expect(postService.getPostById(post._id)).rejects.toThrow(
        "Post not found"
      );
    });
  });

  // ─── Update Post ──────────────────────────────────────────────────────

  describe("updatePost", () => {
    it("should update a post as author", async () => {
      const forumId = await setupForum();

      const post = await postService.createPost(mockUserId, forumId, {
        title: "Original",
        content: "Original content"
      });

      const updated = await postService.updatePost(mockUserId, post._id, {
        title: "Updated",
        content: "Updated content"
      });

      expect(updated.title).toBe("Updated");
      expect(updated.content).toBe("Updated content");
    });

    it("should only update title and content", async () => {
      const forumId = await setupForum();

      const post = await postService.createPost(mockUserId, forumId, {
        title: "Title",
        content: "Content"
      });

      const updated = await postService.updatePost(mockUserId, post._id, {
        title: "New Title",
        authorId: mockUserId2 // Should be ignored
      });

      expect(updated.title).toBe("New Title");
      expect(updated.authorId.toString()).toBe(mockUserId); // Unchanged
    });

    it("should throw error when non-author updates", async () => {
      const forumId = await setupForum();

      const post = await postService.createPost(mockUserId, forumId, {
        title: "Protected",
        content: "Content"
      });

      await expect(
        postService.updatePost(mockUserId2, post._id, {
          title: "Hacked"
        })
      ).rejects.toThrow("Unauthorized to update this post");
    });

    it("should throw error for non-existent post", async () => {
      const fakePostId = "000000000000000000000000";

      await expect(
        postService.updatePost(mockUserId, fakePostId, {
          title: "New"
        })
      ).rejects.toThrow("Post not found");
    });
  });

  // ─── Delete Post ──────────────────────────────────────────────────────

  describe("deletePost", () => {
    it("should delete a post as author", async () => {
      const forumId = await setupForum();

      const post = await postService.createPost(mockUserId, forumId, {
        title: "To Delete",
        content: "Content"
      });

      const deleted = await postService.deletePost(
        mockUserId,
        ROLES.REFUGEE,
        post._id
      );

      expect(deleted.isDeleted).toBe(true);
    });

    it("should delete a post as admin", async () => {
      const forumId = await setupForum();

      const post = await postService.createPost(mockUserId, forumId, {
        title: "To Delete",
        content: "Content"
      });

      const deleted = await postService.deletePost(
        mockUserId2,
        ROLES.ADMIN,
        post._id
      );

      expect(deleted.isDeleted).toBe(true);
    });

    it("should throw error when non-owner non-admin deletes", async () => {
      const forumId = await setupForum();

      const post = await postService.createPost(mockUserId, forumId, {
        title: "Protected",
        content: "Content"
      });

      await expect(
        postService.deletePost(mockUserId2, ROLES.REFUGEE, post._id)
      ).rejects.toThrow("Unauthorized to delete this post");
    });

    it("should throw error for non-existent post", async () => {
      const fakePostId = "000000000000000000000000";

      await expect(
        postService.deletePost(mockUserId, ROLES.REFUGEE, fakePostId)
      ).rejects.toThrow("Post not found");
    });
  });
});

/**
 * Unit tests – Forum Service
 * Tests business logic without full HTTP stack
 */

import * as forumService from "../../../../src/service/forum/forumService.js";
import Forum from "../../../../src/models/forum/forum.js";
import ForumMembership from "../../../../src/models/forum/forumMembership.js";
import ForumBan from "../../../../src/models/forum/forumBan.js";
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

// Helper: Create a mock user ID
const mockUserId = "000000000000000000000001";
const mockUserId2 = "000000000000000000000002";
const mockUserId3 = "000000000000000000000003";

describe("Forum Service", () => {
  // ─── Create Forum ─────────────────────────────────────────────────────

  describe("createForum", () => {
    it("should create a forum as an admin", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Test Forum",
        description: "A test forum"
      });

      expect(forum).toHaveProperty("_id");
      expect(forum.name).toBe("Test Forum");
      expect(forum.description).toBe("A test forum");
      expect(forum.createdBy.toString()).toBe(mockUserId);
      expect(forum.isActive).toBe(true);
    });

    it("should create a forum as a content contributor", async () => {
      const forum = await forumService.createForum(
        mockUserId,
        ROLES.CONTENT_CONTRIBUTOR,
        {
          name: "Contributor Forum",
          description: "Forum by contributor"
        }
      );

      expect(forum.name).toBe("Contributor Forum");
    });

    it("should throw error when refugee tries to create", async () => {
      await expect(
        forumService.createForum(mockUserId, ROLES.REFUGEE, {
          name: "Refugee Forum",
          description: "Not allowed"
        })
      ).rejects.toThrow("Unauthorized to create a forum");
    });

    it("should throw error for duplicate forum name", async () => {
      await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Unique Forum",
        description: "First"
      });

      await expect(
        forumService.createForum(mockUserId, ROLES.ADMIN, {
          name: "Unique Forum",
          description: "Second"
        })
      ).rejects.toThrow("Forum with this name already exists");
    });
  });

  // ─── Get All Forums ───────────────────────────────────────────────────

  describe("getAllForums", () => {
    it("should fetch all active forums", async () => {
      await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Forum 1",
        description: "Desc 1"
      });

      await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Forum 2",
        description: "Desc 2"
      });

      const forums = await forumService.getAllForums();

      expect(forums.length).toBe(2);
      expect(forums[0]).toHaveProperty("memberCount");
      expect(forums[0]).toHaveProperty("postCount");
    });

    it("should return empty array when no forums exist", async () => {
      const forums = await forumService.getAllForums();
      expect(forums.length).toBe(0);
    });

    it("should not include inactive forums", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Inactive Forum",
        description: "Test"
      });

      // Set inactive
      await Forum.updateOne({ _id: forum._id }, { isActive: false });

      const forums = await forumService.getAllForums();
      expect(forums.length).toBe(0);
    });
  });

  // ─── Get Forum By ID ───────────────────────────────────────────────────

  describe("getForumById", () => {
    it("should fetch a forum by ID with counts", async () => {
      const created = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Get By ID Forum",
        description: "Test"
      });

      const forum = await forumService.getForumById(created._id);

      expect(forum._id.toString()).toBe(created._id.toString());
      expect(forum.name).toBe("Get By ID Forum");
      expect(forum.memberCount).toBe(0);
      expect(forum.postCount).toBe(0);
    });

    it("should throw error for non-existent forum", async () => {
      const fakeId = "000000000000000000000000";
      await expect(forumService.getForumById(fakeId)).rejects.toThrow(
        "Forum not found"
      );
    });

    it("should throw error for inactive forum", async () => {
      const created = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Inactive Forum",
        description: "Test"
      });

      await Forum.updateOne({ _id: created._id }, { isActive: false });

      await expect(forumService.getForumById(created._id)).rejects.toThrow(
        "Forum not found"
      );
    });
  });

  // ─── Update Forum ─────────────────────────────────────────────────────

  describe("updateForum", () => {
    it("should update a forum as the creator", async () => {
      const created = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Original Name",
        description: "Original Description"
      });

      const updated = await forumService.updateForum(
        mockUserId,
        ROLES.ADMIN,
        created._id,
        {
          name: "Updated Name",
          description: "Updated Description"
        }
      );

      expect(updated.name).toBe("Updated Name");
      expect(updated.description).toBe("Updated Description");
    });

    it("should allow admin to update any forum", async () => {
      const created = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Someone Else's Forum",
        description: "Test"
      });

      const updated = await forumService.updateForum(
        mockUserId2,
        ROLES.ADMIN,
        created._id,
        {
          name: "Admin Updated"
        }
      );

      expect(updated.name).toBe("Admin Updated");
    });

    it("should throw error when non-creator tries to update", async () => {
      const created = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Protected Forum",
        description: "Test"
      });

      await expect(
        forumService.updateForum(
          mockUserId2,
          ROLES.REFUGEE,
          created._id,
          {
            name: "Hacked"
          }
        )
      ).rejects.toThrow("Unauthorized to update this forum");
    });

    it("should throw error for non-existent forum", async () => {
      const fakeId = "000000000000000000000000";
      await expect(
        forumService.updateForum(mockUserId, ROLES.ADMIN, fakeId, {
          name: "New Name"
        })
      ).rejects.toThrow("Forum not found");
    });
  });

  // ─── Join Forum ───────────────────────────────────────────────────────

  describe("joinForum", () => {
    it("should allow user to join a forum", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Join Test",
        description: "Test"
      });

      const membership = await forumService.joinForum(mockUserId2, forum._id);

      expect(membership.userId.toString()).toBe(mockUserId2);
      expect(membership.forumId.toString()).toBe(forum._id.toString());
    });

    it("should throw error when joining twice", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Double Join",
        description: "Test"
      });

      await forumService.joinForum(mockUserId2, forum._id);

      await expect(
        forumService.joinForum(mockUserId2, forum._id)
      ).rejects.toThrow("You are already a member of this forum");
    });

    it("should throw error when banned user tries to join", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Ban Test",
        description: "Test"
      });

      // Ban the user
      await forumService.banUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId2,
        "Spam"
      );

      // Try to join
      await expect(
        forumService.joinForum(mockUserId2, forum._id)
      ).rejects.toThrow("You are banned from this forum");
    });

    it("should throw error when joining non-existent forum", async () => {
      const fakeId = "000000000000000000000000";
      await expect(
        forumService.joinForum(mockUserId, fakeId)
      ).rejects.toThrow("Forum not found");
    });
  });

  // ─── Leave Forum ──────────────────────────────────────────────────────

  describe("leaveForum", () => {
    it("should allow user to leave a forum", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Leave Test",
        description: "Test"
      });

      await forumService.joinForum(mockUserId2, forum._id);
      await forumService.leaveForum(mockUserId2, forum._id);

      const membership = await ForumMembership.findOne({
        userId: mockUserId2,
        forumId: forum._id
      });

      expect(membership).toBeNull();
    });

    it("should throw error when leaving forum not joined", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Not Joined",
        description: "Test"
      });

      await expect(
        forumService.leaveForum(mockUserId2, forum._id)
      ).rejects.toThrow("You are not a member of this forum");
    });
  });

  // ─── Ban User ──────────────────────────────────────────────────────────

  describe("banUser", () => {
    it("should ban a user as forum creator", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Ban Test",
        description: "Test"
      });

      const ban = await forumService.banUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId2,
        "Violating rules"
      );

      expect(ban.userId.toString()).toBe(mockUserId2);
      expect(ban.reason).toBe("Violating rules");
      expect(ban.isActive).toBe(true);
    });

    it("should throw error when banning already banned user", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Double Ban",
        description: "Test"
      });

      await forumService.banUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId2,
        "First ban"
      );

      await expect(
        forumService.banUser(
          mockUserId,
          ROLES.ADMIN,
          forum._id,
          mockUserId2,
          "Second ban"
        )
      ).rejects.toThrow("User is already banned from this forum");
    });

    it("should throw error when non-creator tries to ban", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Unauthorized Ban",
        description: "Test"
      });

      await expect(
        forumService.banUser(
          mockUserId2,
          ROLES.REFUGEE,
          forum._id,
          mockUserId3,
          "Unauthorized"
        )
      ).rejects.toThrow("Unauthorized to ban users from this forum");
    });

    it("should remove membership when banning", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Ban Membership",
        description: "Test"
      });

      await forumService.joinForum(mockUserId2, forum._id);

      // Verify member exists
      let membership = await ForumMembership.findOne({
        userId: mockUserId2,
        forumId: forum._id
      });
      expect(membership).toBeNull() === false;

      // Ban
      await forumService.banUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId2,
        "Spam"
      );

      // Verify member removed
      membership = await ForumMembership.findOne({
        userId: mockUserId2,
        forumId: forum._id
      });
      expect(membership).toBeNull();
    });
  });

  // ─── Unban User ───────────────────────────────────────────────────────

  describe("unbanUser", () => {
    it("should unban a user as forum creator", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Unban Test",
        description: "Test"
      });

      await forumService.banUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId2,
        "Banned"
      );

      const unbanned = await forumService.unbanUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId2
      );

      expect(unbanned.isActive).toBe(false);
    });

    it("should throw error when unbanning non-banned user", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Not Banned",
        description: "Test"
      });

      await expect(
        forumService.unbanUser(mockUserId, ROLES.ADMIN, forum._id, mockUserId2)
      ).rejects.toThrow("No active ban found for this user");
    });

    it("should throw error when non-creator tries to unban", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Unban Unauthorized",
        description: "Test"
      });

      await forumService.banUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId2,
        "Banned"
      );

      await expect(
        forumService.unbanUser(
          mockUserId3,
          ROLES.REFUGEE,
          forum._id,
          mockUserId2
        )
      ).rejects.toThrow("Unauthorized to unban users");
    });
  });

  // ─── Get Forum Members ────────────────────────────────────────────────

  describe("getForumMembersPaginated", () => {
    it("should fetch forum members with pagination", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Members Test",
        description: "Test"
      });

      await forumService.joinForum(mockUserId2, forum._id);
      await forumService.joinForum(mockUserId3, forum._id);

      const result = await forumService.getForumMembersPaginated(
        forum._id,
        1,
        10
      );

      expect(result.members.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });

    it("should return 404 for non-existent forum", async () => {
      const fakeId = "000000000000000000000000";
      await expect(
        forumService.getForumMembersPaginated(fakeId, 1, 10)
      ).rejects.toThrow("Forum not found");
    });
  });

  // ─── Get Banned Users ─────────────────────────────────────────────────

  describe("getBannedUsersPaginated", () => {
    it("should fetch banned users as forum creator", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Banned Test",
        description: "Test"
      });

      await forumService.banUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId2,
        "Reason 1"
      );

      await forumService.banUser(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        mockUserId3,
        "Reason 2"
      );

      const result = await forumService.getBannedUsersPaginated(
        mockUserId,
        ROLES.ADMIN,
        forum._id,
        1,
        10
      );

      expect(result.banned.length).toBe(2);
      expect(result.total).toBe(2);
    });

    it("should throw error when non-creator tries to view banned users", async () => {
      const forum = await forumService.createForum(mockUserId, ROLES.ADMIN, {
        name: "Banned Unauthorized",
        description: "Test"
      });

      await expect(
        forumService.getBannedUsersPaginated(
          mockUserId2,
          ROLES.REFUGEE,
          forum._id,
          1,
          10
        )
      ).rejects.toThrow("Unauthorized to view banned users from this forum");
    });
  });
});

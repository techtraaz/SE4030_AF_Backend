import Forum from "../../models/forum/forum.js";
import ForumMembership from "../../models/forum/forumMembership.js";
import ForumBan from "../../models/forum/forumBan.js";
import Post from "../../models/forum/post.js";
import { ROLES } from "../../utils/constants.js";

// Helper: Get member and post counts for a forum
const getForumCounts = async (forumId) => {
    const [memberCount, postCount] = await Promise.all([
        ForumMembership.countDocuments({ forumId }),
        Post.countDocuments({ forumId, isDeleted: false })
    ]);
    return { memberCount, postCount };
};

// Only admin or content contributor can create a forum
const createForum = async (userId, role, data) => {
    if (role !== ROLES.ADMIN && role !== ROLES.CONTENT_CONTRIBUTOR) {
        throw new Error("Unauthorized to create a forum");
    }

    const existing = await Forum.findOne({ name: data.name });
    if (existing) {
        throw new Error("Forum with this name already exists");
    }

    const forum = await Forum.create({ ...data, createdBy: userId });
    return forum;
};

// Get all active forums
const getAllForums = async () => {
    const forums = await Forum.find({ isActive: true }).populate("createdBy", "email role");
    return await Promise.all(forums.map(async (forum) => {
        const { memberCount, postCount } = await getForumCounts(forum._id);
        return { ...forum.toObject(), memberCount, postCount };
    }));
};

// Get a single forum by ID
const getForumById = async (forumId) => {
    const forum = await Forum.findById(forumId).populate("createdBy", "email role");
    if (!forum || !forum.isActive) {
        throw new Error("Forum not found");
    }
    const { memberCount, postCount } = await getForumCounts(forumId);
    return { ...forum.toObject(), memberCount, postCount };
};

// Update forum - only creator, admin or content contributor
const updateForum = async (userId, role, forumId, data) => {
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) throw new Error("Forum not found");

    const isCreator = forum.createdBy.toString() === userId.toString();
    const isPrivileged = role === ROLES.ADMIN || role === ROLES.CONTENT_CONTRIBUTOR;

    if (!isCreator && !isPrivileged) {
        throw new Error("Unauthorized to update this forum");
    }

    Object.assign(forum, data);
    await forum.save();
    return forum;
};

// Join a forum
const joinForum = async (userId, forumId) => {
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) throw new Error("Forum not found");

    // Check if user is banned
    const ban = await ForumBan.findOne({ forumId, userId, isActive: true });
    if (ban) throw new Error("You are banned from this forum");

    // Check if user is already a member
    const existingMembership = await ForumMembership.findOne({ forumId, userId });
    if (existingMembership) throw new Error("You are already a member of this forum");

    const membership = await ForumMembership.create({ forumId, userId });
    return membership;
};

// Leave a forum
const leaveForum = async (userId, forumId) => {
    const membership = await ForumMembership.findOneAndDelete({ forumId, userId });
    if (!membership) throw new Error("You are not a member of this forum");
    return membership;
};

// Ban a user from a forum
const banUser = async (requesterId, requesterRole, forumId, targetUserId, reason) => {
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) throw new Error("Forum not found");

    const isCreator = forum.createdBy.toString() === requesterId.toString();
    const isPrivileged = requesterRole === ROLES.ADMIN || requesterRole === ROLES.CONTENT_CONTRIBUTOR;

    if (!isCreator && !isPrivileged) {
        throw new Error("Unauthorized to ban users from this forum");
    }

    // Check existing active ban
    const existingBan = await ForumBan.findOne({ forumId, userId: targetUserId, isActive: true });
    if (existingBan) throw new Error("User is already banned from this forum");

    // Remove membership if exists
    await ForumMembership.findOneAndDelete({ forumId, userId: targetUserId });

    const ban = await ForumBan.create({
        forumId,
        userId: targetUserId,
        bannedBy: requesterId,
        reason,
        isActive: true
    });

    return ban;
};

// Unban a user from a forum
const unbanUser = async (requesterId, requesterRole, forumId, targetUserId) => {
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) throw new Error("Forum not found");

    const isCreator = forum.createdBy.toString() === requesterId.toString();
    const isPrivileged = requesterRole === ROLES.ADMIN || requesterRole === ROLES.CONTENT_CONTRIBUTOR;

    if (!isCreator && !isPrivileged) {
        throw new Error("Unauthorized to unban users");
    }

    const ban = await ForumBan.findOneAndUpdate(
        { forumId, userId: targetUserId, isActive: true },
        { isActive: false },
        { new: true }
    );

    if (!ban) throw new Error("No active ban found for this user");
    return ban;
};

// Get forum members with pagination - public endpoint
const getForumMembersPaginated = async (forumId, page = 1, limit = 10) => {
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) throw new Error("Forum not found");

    const skip = (page - 1) * limit;
    const members = await ForumMembership.find({ forumId })
        .populate("userId", "email")
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await ForumMembership.countDocuments({ forumId });

    return {
        members,
        total,
        page,
        limit
    };
};

// Get banned users for a forum with pagination - restricted endpoint
const getBannedUsersPaginated = async (requesterId, requesterRole, forumId, page = 1, limit = 10) => {
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) throw new Error("Forum not found");

    const isCreator = forum.createdBy.toString() === requesterId.toString();
    const isPrivileged = requesterRole === ROLES.ADMIN || requesterRole === ROLES.CONTENT_CONTRIBUTOR;

    if (!isCreator && !isPrivileged) {
        throw new Error("Unauthorized to view banned users from this forum");
    }

    const skip = (page - 1) * limit;
    const banned = await ForumBan.find({ forumId, isActive: true })
        .populate("userId", "email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await ForumBan.countDocuments({ forumId, isActive: true });

    return {
        banned,
        total,
        page,
        limit
    };
};

// Get forums a user has joined with pagination - can retrieve own forums or admin can retrieve others
const getUserForumsPaginated = async (userId, requesterId, requesterRole, page = 1, limit = 10) => {
    // Authorization: users can only see their own forums unless requester is admin
    if (userId.toString() !== requesterId.toString() && requesterRole !== ROLES.ADMIN) {
        throw new Error("Unauthorized to view forums for this user");
    }

    const skip = (page - 1) * limit;
    const userForums = await ForumMembership.find({ userId })
        .populate({
            path: "forumId",
            select: "name description createdBy isActive",
            match: { isActive: true }
        })
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limit);

    // Filter out nulls from match
    const filteredForums = userForums.filter(fm => fm.forumId !== null);

    // Get member and post counts for each forum
    const forumsWithCounts = await Promise.all(
        filteredForums.map(async (fm) => {
            const { memberCount, postCount } = await getForumCounts(fm.forumId._id);
            return {
                ...fm.toObject(),
                memberCount,
                postCount
            };
        })
    );

    const total = await ForumMembership.countDocuments({ userId });

    return {
        forums: forumsWithCounts,
        total,
        page,
        limit
    };
};

// Delete forum - only creator, admin or content contributor (soft delete)
const deleteForum = async (userId, role, forumId) => {
    const forum = await Forum.findById(forumId);
    if (!forum) throw new Error("Forum not found");

    const isCreator = forum.createdBy.toString() === userId.toString();
    const isPrivileged = role === ROLES.ADMIN || role === ROLES.CONTENT_CONTRIBUTOR;

    if (!isCreator && !isPrivileged) {
        throw new Error("Unauthorized to delete this forum");
    }

    forum.isActive = false;
    await forum.save();
    return forum;
};

export { createForum, getAllForums, getForumById, updateForum, joinForum, leaveForum, banUser, unbanUser, getForumMembersPaginated, getBannedUsersPaginated, getUserForumsPaginated, deleteForum };
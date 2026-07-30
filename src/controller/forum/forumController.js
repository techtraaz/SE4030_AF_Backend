import * as forumService from "../../service/forum/forumService.js";

const createForum = async (req, res) => {
    try {
        const forum = await forumService.createForum(req.user._id, req.user.role, req.body);
        return res.created("Forum created successfully", forum);
    } catch (error) {
        if (error.message === "Unauthorized to create a forum") return res.forbidden(error.message);
        if (error.message === "Forum with this name already exists") return res.conflict(error.message);
        return res.error(error.message);
    }
};

const getAllForums = async (req, res) => {
    try {
        const forums = await forumService.getAllForums();
        return res.success("Forums fetched successfully", forums);
    } catch (error) {
        return res.error(error.message);
    }
};

const getForumById = async (req, res) => {
    try {
        const forum = await forumService.getForumById(req.params.forumId);
        return res.success("Forum fetched successfully", forum);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        return res.error(error.message);
    }
};

const updateForum = async (req, res) => {
    try {
        const forum = await forumService.updateForum(req.user._id, req.user.role, req.params.forumId, req.body);
        return res.success("Forum updated successfully", forum);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        if (error.message === "Unauthorized to update this forum") return res.forbidden(error.message);
        return res.error(error.message);
    }
};

const joinForum = async (req, res) => {
    try {
        const membership = await forumService.joinForum(req.user._id, req.params.forumId);
        return res.created("Joined forum successfully", membership);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        if (error.message === "You are banned from this forum") return res.forbidden(error.message);
        if (error.message === "You are already a member of this forum") return res.conflict(error.message);
        if (error.code === 11000) return res.conflict("You are already a member of this forum");
        return res.error(error.message);
    }
};

const leaveForum = async (req, res) => {
    try {
        await forumService.leaveForum(req.user._id, req.params.forumId);
        return res.success("Left forum successfully", null);
    } catch (error) {
        if (error.message === "You are not a member of this forum") return res.notFound(error.message);
        return res.error(error.message);
    }
};

const banUser = async (req, res) => {
    try {
        const { targetUserId, reason } = req.body;
        const ban = await forumService.banUser(req.user._id, req.user.role, req.params.forumId, targetUserId, reason);
        return res.created("User banned successfully", ban);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        if (error.message.startsWith("Unauthorized")) return res.forbidden(error.message);
        if (error.message === "User is already banned from this forum") return res.conflict(error.message);
        return res.error(error.message);
    }
};

const unbanUser = async (req, res) => {
    try {
        const ban = await forumService.unbanUser(req.user._id, req.user.role, req.params.forumId, req.body.targetUserId);
        return res.success("User unbanned successfully", ban);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        if (error.message.startsWith("Unauthorized")) return res.forbidden(error.message);
        if (error.message === "No active ban found for this user") return res.notFound(error.message);
        return res.error(error.message);
    }
};

const getForumMembers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await forumService.getForumMembersPaginated(req.params.forumId, page, limit);
        return res.success("Forum members fetched successfully", result);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        return res.error(error.message);
    }
};

const getBannedUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await forumService.getBannedUsersPaginated(req.user._id, req.user.role, req.params.forumId, page, limit);
        return res.success("Banned users fetched successfully", result);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        if (error.message.startsWith("Unauthorized")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

const getUserForums = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await forumService.getUserForumsPaginated(req.user._id, req.user._id, req.user.role, page, limit);
        return res.success("User forums fetched successfully", result);
    } catch (error) {
        if (error.message.startsWith("Unauthorized")) return res.forbidden(error.message);
        return res.error(error.message);
    }
};

const deleteForum = async (req, res) => {
    try {
        const forum = await forumService.deleteForum(req.user._id, req.user.role, req.params.forumId);
        return res.success("Forum deleted successfully", forum);
    } catch (error) {
        if (error.message === "Forum not found") return res.notFound(error.message);
        if (error.message === "Unauthorized to delete this forum") return res.forbidden(error.message);
        return res.error(error.message);
    }
};

export { createForum, getAllForums, getForumById, updateForum, joinForum, leaveForum, banUser, unbanUser, getForumMembers, getBannedUsers, getUserForums, deleteForum };
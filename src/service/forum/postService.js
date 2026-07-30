import Post from "../../models/forum/post.js";
import ForumMembership from "../../models/forum/forumMembership.js";
import ForumBan from "../../models/forum/forumBan.js";
import Forum from "../../models/forum/forum.js";

// Helper: Verify user is a member and not banned
const verifyForumAccess = async (userId, forumId) => {
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) throw new Error("Forum not found");

    const ban = await ForumBan.findOne({ forumId, userId, isActive: true });
    if (ban) throw new Error("You are banned from this forum");

    const membership = await ForumMembership.findOne({ forumId, userId });
    if (!membership) throw new Error("You must join the forum first");
};

const createPost = async (userId, forumId, data) => {
    await verifyForumAccess(userId, forumId);

    const post = await Post.create({
        forumId,
        authorId: userId,
        ...data
    });
    return post;
};

const getPostsByForum = async (forumId, page = 1, limit = 10) => {
    const forum = await Forum.findById(forumId);
    if (!forum || !forum.isActive) throw new Error("Forum not found");

    const skip = (page - 1) * limit;

    const posts = await Post.find({ forumId, isDeleted: false })
        .populate("authorId", "email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Post.countDocuments({ forumId, isDeleted: false });

    return { posts, total, page, totalPages: Math.ceil(total / limit) };
};

const getPostById = async (postId) => {
    const post = await Post.findOne({ _id: postId, isDeleted: false })
        .populate("authorId", "email role")
        .populate("forumId", "name");

    if (!post) throw new Error("Post not found");
    return post;
};

const updatePost = async (userId, postId, data) => {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new Error("Post not found");

    if (post.authorId.toString() !== userId.toString()) {
        throw new Error("Unauthorized to update this post");
    }

    // Only allow title and content updates
    const { title, content } = data;
    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();
    return post;
};

const deletePost = async (userId, role, postId) => {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new Error("Post not found");

    const isOwner = post.authorId.toString() === userId.toString();
    const isAdmin = role === "admin";

    if (!isOwner && !isAdmin) {
        throw new Error("Unauthorized to delete this post");
    }

    post.isDeleted = true;
    await post.save();
    return post;
};

export { createPost, getPostsByForum, getPostById, updatePost, deletePost };
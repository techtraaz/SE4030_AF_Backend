import Answer from "../../models/forum/answer.js";
import Post from "../../models/forum/post.js";
import ForumBan from "../../models/forum/forumBan.js";
import ForumMembership from "../../models/forum/forumMembership.js";
import { ROLES } from "../../utils/constants.js";

const createAnswer = async (userId, postId, content) => {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new Error("Post not found");

    // Check membership and ban on the post's forum
    const ban = await ForumBan.findOne({ forumId: post.forumId, userId, isActive: true });
    if (ban) throw new Error("You are banned from this forum");

    const membership = await ForumMembership.findOne({ forumId: post.forumId, userId });
    if (!membership) throw new Error("You must join the forum first");

    const answer = await Answer.create({ postId, authorId: userId, content });
    await Post.findByIdAndUpdate(postId, { $inc: { answerCount: 1 } });

    return { ...answer.toObject(), postId, forumId: post.forumId };
};

const getAnswersByPost = async (postId) => {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw new Error("Post not found");

    const answers = await Answer.find({ postId, isDeleted: false })
        .populate("authorId", "email role")
        .sort({ isAccepted: -1, upvoteCount: -1, createdAt: -1 });

    // Add postId and forumId to each answer
    return answers.map(answer => ({ ...answer.toObject(), postId, forumId: post.forumId }));
};

const updateAnswer = async (userId, answerId, content) => {
    const answer = await Answer.findOne({ _id: answerId, isDeleted: false });
    if (!answer) throw new Error("Answer not found");

    if (answer.authorId.toString() !== userId.toString()) {
        throw new Error("Unauthorized to update this answer");
    }

    answer.content = content;
    await answer.save();
    return answer;
};

const deleteAnswer = async (userId, role, answerId) => {
    const answer = await Answer.findOne({ _id: answerId, isDeleted: false });
    if (!answer) throw new Error("Answer not found");

    const isOwner = answer.authorId.toString() === userId.toString();
    const isAdmin = role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
        throw new Error("Unauthorized to delete this answer");
    }

    answer.isDeleted = true;
    await answer.save();

    // Decrement post answerCount
    await Post.findByIdAndUpdate(answer.postId, { $inc: { answerCount: -1 } });

    return answer;
};

// Only post author can accept an answer
const acceptAnswer = async (userId, answerId) => {
    const answer = await Answer.findOne({ _id: answerId, isDeleted: false });
    if (!answer) throw new Error("Answer not found");

    const post = await Post.findOne({ _id: answer.postId, isDeleted: false });
    if (!post) throw new Error("Post not found");

    if (post.authorId.toString() !== userId.toString()) {
        throw new Error("Only the post author can accept an answer");
    }

    // Unaccept any previously accepted answer
    await Answer.updateMany({ postId: answer.postId }, { isAccepted: false });

    answer.isAccepted = true;
    await answer.save();
    return answer;
};

export { createAnswer, getAnswersByPost, updateAnswer, deleteAnswer, acceptAnswer };
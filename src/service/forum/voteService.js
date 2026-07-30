import Vote from "../../models/forum/vote.js";
import Post from "../../models/forum/post.js";
import Answer from "../../models/forum/answer.js";
import ForumBan from "../../models/forum/forumBan.js";
import ForumMembership from "../../models/forum/forumMembership.js";

const TARGET_MODELS = {
    Post,
    Answer
};

// Resolve the forumId from a target (Post or Answer)
const resolveForumId = async (targetType, targetId) => {
    if (targetType === "Post") {
        const post = await Post.findById(targetId);
        if (!post || post.isDeleted) throw new Error("Post not found");
        return post.forumId;
    }

    if (targetType === "Answer") {
        const answer = await Answer.findById(targetId);
        if (!answer || answer.isDeleted) throw new Error("Answer not found");
        const post = await Post.findById(answer.postId);
        if (!post || post.isDeleted) throw new Error("Post not found");
        return post.forumId;
    }

    throw new Error("Invalid target type");
};

const castVote = async (userId, targetId, targetType, voteType) => {
    const forumId = await resolveForumId(targetType, targetId);

    // Check ban and membership
    const ban = await ForumBan.findOne({ forumId, userId, isActive: true });
    if (ban) throw new Error("You are banned from this forum");

    const membership = await ForumMembership.findOne({ forumId, userId });
    if (!membership) throw new Error("You must join the forum first");

    const TargetModel = TARGET_MODELS[targetType];
    const existingVote = await Vote.findOne({ userId, targetId, targetType });

    let actionType = "created";
    if (existingVote) {
        if (existingVote.voteType === voteType) {
            await existingVote.deleteOne();
            await TargetModel.findByIdAndUpdate(targetId, { $inc: { upvoteCount: voteType === "upvote" ? -1 : 1 } });
            actionType = "removed";
        } else {
            const delta = voteType === "upvote" ? 2 : -2;
            existingVote.voteType = voteType;
            await existingVote.save();
            await TargetModel.findByIdAndUpdate(targetId, { $inc: { upvoteCount: delta } });
            actionType = "updated";
        }
    } else {
        await Vote.create({ userId, targetId, targetType, voteType });
        await TargetModel.findByIdAndUpdate(targetId, {
            $inc: { upvoteCount: voteType === "upvote" ? 1 : -1 }
        });
    }

    // Fetch updated target with new vote count
    const updatedTarget = await TargetModel.findById(targetId);
    
    // Add context data
    const result = { ...updatedTarget.toObject(), forumId, actionType };
    if (targetType === "Answer") result.postId = updatedTarget.postId;
    return result;
};

export { castVote };
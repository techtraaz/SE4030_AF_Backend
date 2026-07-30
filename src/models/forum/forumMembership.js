import mongoose from "mongoose";

const forumMembershipSchema = new mongoose.Schema(
    {
        forumId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Forum",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// A user can only join a forum once
forumMembershipSchema.index({ forumId: 1, userId: 1 }, { unique: true });

export default mongoose.model("ForumMembership", forumMembershipSchema);
import mongoose from "mongoose";

const forumBanSchema = new mongoose.Schema(
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
        bannedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("ForumBan", forumBanSchema);
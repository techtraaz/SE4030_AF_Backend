import mongoose from "mongoose";
import { VOTE_TARGET_TYPES, VOTE_TYPES } from "../../utils/constants.js";

const voteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "targetType"
        },
        targetType: {
            type: String,
            required: true,
            enum: Object.values(VOTE_TARGET_TYPES)
        },
        voteType: {
            type: String,
            required: true,
            enum: Object.values(VOTE_TYPES)
        }
    },
    { timestamps: true }
);

// A user can only vote once per target
voteSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
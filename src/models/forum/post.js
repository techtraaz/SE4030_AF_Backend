import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        forumId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Forum",
            required: true
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        upvoteCount: {
            type: Number,
            default: 0
        },
        answerCount: {
            type: Number,
            default: 0
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("Post", postSchema);
import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
    {
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },
        optionText: {
            type: String,
            required: true,
            trim: true
        },
        isCorrect: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    { timestamps: true }
);

// Index for fetching options by question
optionSchema.index({ questionId: 1 });

export default mongoose.model("Option", optionSchema);
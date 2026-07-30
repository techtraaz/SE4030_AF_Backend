import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },
        questionText: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["multiple_choice", "true_false", "multiple_select", "fill_blank"],
            required: true,
            default: "multiple_choice"
        },
        explanation: {
            type: String,
            required: false
        },
        points: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        order: {
            type: Number,
            required: true,
            min: 1
        }
    },
    { timestamps: true }
);

// Index for ordering questions within a quiz
questionSchema.index({ quizId: 1, order: 1 });

export default mongoose.model("Question", questionSchema);
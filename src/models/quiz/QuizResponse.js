import mongoose from "mongoose";

const quizResponseSchema = new mongoose.Schema(
    {
        attemptId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QuizAttempt",
            required: true
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true
        },
        selectedOptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Option",
            required: function() {
                return this.selectedOptionIds === undefined || this.selectedOptionIds.length === 0;
            }
        },
        selectedOptionIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Option"
        }],
        isCorrect: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    { timestamps: true }
);

// Index for retrieving responses by attempt
quizResponseSchema.index({ attemptId: 1 });

export default mongoose.model("QuizResponse", quizResponseSchema);
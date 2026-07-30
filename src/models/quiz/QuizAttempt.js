import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
    {
        refugeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: true
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1
        },
        correctAnswers: {
            type: Number,
            required: true,
            min: 0
        },
        passed: {
            type: Boolean,
            required: true,
            default: false
        },
        timeTakenSeconds: {
            type: Number,
            required: false,
            min: 0
        },
        attemptedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Index for retrieving user's quiz attempts
quizAttemptSchema.index({ refugeeId: 1, quizId: 1, attemptedAt: -1 });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
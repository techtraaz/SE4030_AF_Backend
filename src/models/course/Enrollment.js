import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
    {
        refugeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        completedLessons: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson"
        }],
        lastAccessedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["ACTIVE", "COMPLETED", "DROPPED"],
            default: "ACTIVE"
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// Compound unique index to prevent duplicate enrollments
enrollmentSchema.index({ refugeeId: 1, courseId: 1 }, { unique: true });

// Index for quick lookup of user's enrollments
enrollmentSchema.index({ refugeeId: 1, status: 1 });

// Index for course enrollment counts
enrollmentSchema.index({ courseId: 1, status: 1 });

export default mongoose.model("Enrollment", enrollmentSchema);

import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: function() {
                return !this.lessonId;
            }
        },
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
            required: false
        },
        passingScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
            default: 60
        },
        timeLimit: {
            type: Number,
            required: false,
            min: 0,
            default: null
        },
        maxAttempts: {
            type: Number,
            required: false,
            min: 1,
            default: null
        },
        instructions: {
            type: String,
            required: false,
            trim: true
        },
        isRandomOrder: {
            type: Boolean,
            default: false
        },
        isPublished: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// Index for better query performance
quizSchema.index({ courseId: 1, isPublished: 1 });
quizSchema.index({ lessonId: 1, isPublished: 1 });

// Validate that at least one of courseId or lessonId is provided
quizSchema.pre('validate', function(next) {
    if (!this.courseId && !this.lessonId) {
        next(new Error('Quiz must belong to either a course or a lesson'));
    } else {
        next();
    }
});

export default mongoose.model("Quiz", quizSchema);
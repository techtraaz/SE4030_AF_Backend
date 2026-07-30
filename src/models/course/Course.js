import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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
        languageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Language",
            required: false 
        },
        levelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseLevel",
            required: false 
        },
        language: {
            type: String,
            default: "English"
        },
        level: {
            type: String
        },
        createdById: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        totalLessons: {
            type: Number,
            default: 0,
            min: 0
        },
        totalEnrollments: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true }
);

// Indexes for better query performance
courseSchema.index({ categoryId: 1, isPublished: 1 });
courseSchema.index({ createdById: 1 });
courseSchema.index({ levelId: 1, languageId: 1, isPublished: 1 });
courseSchema.index({ level: 1, language: 1, isPublished: 1 }); // Legacy index

export default mongoose.model("Course", courseSchema);
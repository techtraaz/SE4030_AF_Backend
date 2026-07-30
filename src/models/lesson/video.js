import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    videoUrl: { type: String, required: true },
    subtitlesUrl: { type: String },
    estimatedMb: { type: Number }
}, { timestamps: true })


export default mongoose.models.Video || mongoose.model("Video", videoSchema)
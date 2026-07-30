import mongoose from "mongoose";


const listeningSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    audioUrl: { type: String, required: true },
    slowAudioUrl: { type: String },
    transcript: { type: String, required: true }
}, { timestamps: true })



export default mongoose.models.Listening || mongoose.model("Listening", listeningSchema);

import mongoose from "mongoose";


const readingSchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    content: { type: String, required: true },
    highlightWords: [
        {
            word: { type: String },
            meaning: { type: String },
            translation: { type: String }
        }
    ]
}, { timestamps: true })

export default mongoose.models.Reading || mongoose.model("Reading", readingSchema);
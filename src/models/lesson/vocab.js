import mongoose from "mongoose";

const vocabularySchema = new mongoose.Schema({
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    words: [
        {
            word: { type: String, required: true },
            meaning: { type: String, required: true },
            exampleSentence: { type: String },
            audioUrl: { type: String },
            imageUrl: { type: String }
        }
    ]
}, { timestamps: true })

export default mongoose.models.Vocabulary || mongoose.model("Vocabulary", vocabularySchema);
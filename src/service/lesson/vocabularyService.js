
import Lesson from "../../models/lesson/lesson.js";
import Vocabulary from "../../models/lesson/vocab.js";

const createVocabulary = async (lessonId, data) => {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.vocabulary) throw new Error("Vocabulary section already exists for this lesson");
    const vocabulary = await Vocabulary.create({ lessonId, words: data.words });
    lesson.vocabulary = vocabulary._id;
    await lesson.save();
    return vocabulary;
};

const getVocabulary = async (lessonId) => {
    const vocabulary = await Vocabulary.findOne({ lessonId });
    if (!vocabulary) throw new Error("Vocabulary section not found");
    return vocabulary;
};

const updateVocabulary = async (lessonId, data) => {
    const vocabulary = await Vocabulary.findOneAndUpdate({ lessonId }, data, { new: true });
    if (!vocabulary) throw new Error("Vocabulary section not found");
    return vocabulary;
};

const deleteVocabulary = async (lessonId) => {
    const vocabulary = await Vocabulary.findOneAndDelete({ lessonId });
    if (!vocabulary) throw new Error("Vocabulary section not found");
    await Lesson.findByIdAndUpdate(lessonId, { vocabulary: null });
    return vocabulary;
};

export { createVocabulary, getVocabulary, updateVocabulary, deleteVocabulary };
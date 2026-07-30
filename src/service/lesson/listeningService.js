
import Lesson from "../../models/lesson/lesson.js";
import Listening from "../../models/lesson/listening.js";

const createListening = async (lessonId, data) => {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.listening) throw new Error("Listening section already exists for this lesson");
    const listening = await Listening.create({ lessonId, ...data });
    lesson.listening = listening._id;
    await lesson.save();
    return listening;
};

const getListening = async (lessonId) => {
    const listening = await Listening.findOne({ lessonId });
    if (!listening) throw new Error("Listening section not found");
    return listening;
};

const updateListening = async (lessonId, data) => {
    const listening = await Listening.findOneAndUpdate({ lessonId }, data, { new: true });
    if (!listening) throw new Error("Listening section not found");
    return listening;
};

const deleteListening = async (lessonId) => {
    const listening = await Listening.findOneAndDelete({ lessonId });
    if (!listening) throw new Error("Listening section not found");
    await Lesson.findByIdAndUpdate(lessonId, { listening: null });
    return listening;
};

export { createListening, getListening, updateListening, deleteListening };
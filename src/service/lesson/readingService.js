
import Lesson from "../../models/lesson/lesson.js";
import Reading from "../../models/lesson/reading.js";

const createReading = async (lessonId, data) => {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.reading) throw new Error("Reading section already exists for this lesson");
    const reading = await Reading.create({ lessonId, ...data });
    lesson.reading = reading._id;
    await lesson.save();
    return reading;
};

const getReading = async (lessonId) => {
    const reading = await Reading.findOne({ lessonId });
    if (!reading) throw new Error("Reading section not found");
    return reading;
};

const updateReading = async (lessonId, data) => {
    const reading = await Reading.findOneAndUpdate({ lessonId }, data, { new: true });
    if (!reading) throw new Error("Reading section not found");
    return reading;
};

const deleteReading = async (lessonId) => {
    const reading = await Reading.findOneAndDelete({ lessonId });
    if (!reading) throw new Error("Reading section not found");
    await Lesson.findByIdAndUpdate(lessonId, { reading: null });
    return reading;
};

export { createReading, getReading, updateReading, deleteReading };

import Lesson from "../../models/lesson/lesson.js";
import Video from "../../models/lesson/video.js";

const createVideo = async (lessonId, data) => {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new Error("Lesson not found");
    if (lesson.video) throw new Error("Video section already exists for this lesson");
    const video = await Video.create({ lessonId, ...data });
    lesson.video = video._id;
    await lesson.save();
    return video;
};

const getVideo = async (lessonId) => {
    const video = await Video.findOne({ lessonId });
    if (!video) throw new Error("Video section not found");
    return video;
};

const updateVideo = async (lessonId, data) => {
    const video = await Video.findOneAndUpdate({ lessonId }, data, { new: true });
    if (!video) throw new Error("Video section not found");
    return video;
};

const deleteVideo = async (lessonId) => {
    const video = await Video.findOneAndDelete({ lessonId });
    if (!video) throw new Error("Video section not found");
    await Lesson.findByIdAndUpdate(lessonId, { video: null });
    return video;
};

export { createVideo, getVideo, updateVideo, deleteVideo };
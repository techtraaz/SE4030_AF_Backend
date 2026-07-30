
import express from "express";
import * as lessonController from "../../controller/lesson/lessonController.js";
import readingRoutes from "./readingRoutes.js";
import listeningRoutes from "./listeningRoutes.js";
import vocabularyRoutes from "./vocabularyRoutes.js";
import videoRoutes from "./videoRoutes.js";
import { authenticate,authorizeContentContributor} from "../../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authenticate,authorizeContentContributor,lessonController.createLesson);
router.get("/", lessonController.getAllLessons);
router.get("/:id", lessonController.getLessonById);
router.put("/:id",authenticate,authorizeContentContributor, lessonController.updateLesson);
router.delete("/:id",authenticate,authorizeContentContributor, lessonController.deleteLesson);
router.patch("/:id/publish", authenticate,authorizeContentContributor,lessonController.publishLesson);
router.patch("/:id/unpublish", authenticate,authorizeContentContributor,lessonController.unpublishLesson);


router.use("/:lessonId/reading", readingRoutes);
router.use("/:lessonId/listening", listeningRoutes);
router.use("/:lessonId/vocabulary", vocabularyRoutes);
router.use("/:lessonId/video", videoRoutes);

export default router;



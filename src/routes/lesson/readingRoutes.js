
import express from "express";
import * as readingController from "../../controller/lesson/readingController.js";
import { authenticate,authorizeContentContributor} from "../../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true }); // mergeParams to access lessonId

router.post("/", authenticate,authorizeContentContributor,readingController.createReading);
router.get("/", readingController.getReading);
router.put("/",authenticate,authorizeContentContributor, readingController.updateReading);
router.delete("/", authenticate,authorizeContentContributor,readingController.deleteReading);

export default router;
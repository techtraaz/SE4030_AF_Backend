
import express from "express";
import * as videoController from "../../controller/lesson/videoController.js";
import { authenticate,authorizeContentContributor} from "../../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate,authorizeContentContributor,videoController.createVideo);
router.get("/", videoController.getVideo);
router.put("/",authenticate,authorizeContentContributor, videoController.updateVideo);
router.delete("/",authenticate,authorizeContentContributor, videoController.deleteVideo);

export default router;
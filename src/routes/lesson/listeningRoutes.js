
import express from "express";
import * as listeningController from "../../controller/lesson/listeningController.js";
import { authenticate,authorizeContentContributor} from "../../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.post("/",authenticate,authorizeContentContributor, listeningController.createListening);
router.get("/", listeningController.getListening);
router.put("/", authenticate,authorizeContentContributor,listeningController.updateListening);
router.delete("/",authenticate,authorizeContentContributor, listeningController.deleteListening);

export default router;
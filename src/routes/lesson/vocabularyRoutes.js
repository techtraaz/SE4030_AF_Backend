
import express from "express";
import * as vocabularyController from "../../controller/lesson/vocabularyController.js";
import { authenticate,authorizeContentContributor} from "../../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.post("/",authenticate,authorizeContentContributor, vocabularyController.createVocabulary);
router.get("/", vocabularyController.getVocabulary);
router.put("/",authenticate,authorizeContentContributor, vocabularyController.updateVocabulary);
router.delete("/", authenticate,authorizeContentContributor,vocabularyController.deleteVocabulary);

export default router;
import express from 'express';
const router = express.Router();
import {translate} from "../../controller/translate/translateController.js";

// POST /api/translate
router.post("/translate", translate);

export default router;
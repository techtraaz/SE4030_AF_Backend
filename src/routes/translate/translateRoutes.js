import express from 'express';
const router = express.Router();
import { translate } from "../../controller/translate/translateController.js";
import { authenticate } from "../../middleware/authMiddleware.js";

// POST /api/translate — now requires authentication
router.post("/translate", authenticate, translate);

export default router;
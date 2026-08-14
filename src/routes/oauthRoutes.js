import express from "express";
import { redirectToProvider, handleCallback } from "../controller/oauthController.js";

const router = express.Router();

router.get("/google", redirectToProvider);
router.get("/google/callback", handleCallback);

export default router;
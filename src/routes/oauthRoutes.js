import express from "express";
import { redirectToProvider, handleCallback, redirectToGithub, handleGithubCallback } from "../controller/oauthController.js";

const router = express.Router();

router.get("/google", redirectToProvider);
router.get("/google/callback", handleCallback);

router.get("/github", redirectToGithub);
router.get("/github/callback", handleGithubCallback);

export default router;
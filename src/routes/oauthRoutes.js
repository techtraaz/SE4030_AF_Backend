import express from "express";
import { redirectToProvider, handleCallback, redirectToGithub, handleGithubCallback, redirectToFacebook, handleFacebookCallback } from "../controller/oauthController.js";

const router = express.Router();

router.get("/google", redirectToProvider);
router.get("/google/callback", handleCallback);

router.get("/github", redirectToGithub);
router.get("/github/callback", handleGithubCallback);

router.get("/facebook", redirectToFacebook);
router.get("/facebook/callback", handleFacebookCallback);

export default router;
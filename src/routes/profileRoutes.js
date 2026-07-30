import express from "express";
import { createProfile, getProfile, updateProfile } from "../controller/profileController.js";
import { authenticate, authorizeAdmin, authorizeRefugee, authorizeContentContributor, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/create-refugee", 
    authenticate, 
    authorizeRefugee, 
    createProfile
);

router.post(
    "/create-contributor", 
    authenticate, 
    authorizeContentContributor,
    createProfile
);

router.post(
    "/create-admin", 
    authenticate, 
    authorizeAdmin, 
    createProfile
);

router.patch(
    "/update", 
    authenticate, 
    authorizeRoles(), 
    updateProfile
);

router.get(
    "/get", 
    authenticate,
    authorizeRoles(), 
    getProfile
);

export default router;
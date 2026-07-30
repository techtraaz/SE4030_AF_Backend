import express from "express";
import { getPendingContributors, approveContributor, rejectContributor } from "../controller/adminController.js";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/contributors/pending", 
    authenticate, 
    authorizeAdmin, 
    getPendingContributors
);

router.patch(
    "/contributors/:userId/approve", 
    authenticate, 
    authorizeAdmin, 
    approveContributor
);

router.patch(
    "/contributors/:userId/reject", 
    authenticate, 
    authorizeAdmin, 
    rejectContributor
);

export default router;
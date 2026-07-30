import express from "express";
import {
    createForum, getAllForums, getForumById,
    updateForum, joinForum, leaveForum, banUser, unbanUser, getForumMembers, getBannedUsers, getUserForums, deleteForum
} from "../../controller/forum/forumController.js";
import { authenticate, authorizeRoles, authorizeAdmin, authorizeContentContributor } from "../../middleware/authMiddleware.js";
import { ROLES } from "../../utils/constants.js";


const router = express.Router();

// Public - all authenticated users can view forums
router.get(
    "/", 
    authenticate, 
    authorizeRoles(),
    getAllForums
);

// Any authenticated user can view their own forums - MUST BE BEFORE /:forumId
router.get(
    "/user/forums", 
    authenticate,
    authorizeRoles(),
    getUserForums
);

// Only admin or content contributor can create/update
router.post(
    "/", 
    authenticate, 
    authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR),
    createForum
);

router.get(
    "/:forumId", 
    authenticate,
    authorizeRoles(), 
    getForumById
);

router.patch(
    "/:forumId", 
    authenticate, 
    authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR),
    updateForum
);

// Admin or contributor only - delete forum
router.delete(
    "/:forumId", 
    authenticate, 
    authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR),
    deleteForum
);

// Any authenticated user can join/leave
router.post(
    "/:forumId/join", 
    authenticate,
    authorizeRoles(),
    joinForum
);

router.delete(
    "/:forumId/leave", 
    authenticate,
    authorizeRoles(), 
    leaveForum
);

// Admin or contributor only - ban management
router.post(
    "/:forumId/ban", 
    authenticate, 
    authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR),
    banUser
);

router.patch(
    "/:forumId/unban", 
    authenticate, 
    authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR),
    unbanUser
);

// Public - all authenticated users can view forum members
router.get(
    "/:forumId/members", 
    authenticate,
    authorizeRoles(),
    getForumMembers
);

// Admin or contributor only - view banned users
router.get(
    "/:forumId/banned", 
    authenticate, 
    authorizeRoles(ROLES.ADMIN, ROLES.CONTENT_CONTRIBUTOR),
    getBannedUsers
);

export default router;
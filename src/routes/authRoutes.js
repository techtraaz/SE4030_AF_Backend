import express from "express";
import * as authController from "../controller/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/refugee/signup", 
    authController.signupRefugee
);

router.post(
    "/contributor/signup", 
    authController.signupContributor
);

router.post(
    "/admin/signup", 
    authController.signupAdmin
);

router.post(
    "/login", 
    authController.login
);

router.post(
    "/logout",
    authenticate,
    authController.logout
);

export default router;

import express from "express";
import * as authController from "../controller/authController.js";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { validateSignup, validateLogin } from "../middleware/authValidation.js";

const router = express.Router();

router.post("/refugee/signup", validateSignup, authController.signupRefugee);
router.post("/contributor/signup", validateSignup, authController.signupContributor);
router.post("/admin/signup", authenticate, authorizeAdmin, validateSignup, authController.signupAdmin);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authenticate, authController.logout);

export default router;


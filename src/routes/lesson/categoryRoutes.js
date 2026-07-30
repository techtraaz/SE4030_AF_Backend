
import express from "express";
import * as categoryController from "../../controller/lesson/categoryController.js";
import { authenticate, authorizeAdmin} from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",authenticate,authorizeAdmin, categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", authenticate,authorizeAdmin,categoryController.updateCategory);
router.delete("/:id", authenticate,authorizeAdmin,categoryController.deleteCategory);

export default router;







import express from 'express';
import * as languageController from '../../controller/course/languageController.js';
import { authenticate, authorizeAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view available languages
router.get('/', languageController.getAllLanguages);
router.get('/:id', languageController.getLanguageById);

// Admin only routes
router.post('/', authenticate, authorizeAdmin, languageController.createLanguage);
router.put('/:id', authenticate, authorizeAdmin, languageController.updateLanguage);
router.delete('/:id', authenticate, authorizeAdmin, languageController.deleteLanguage);

export default router;

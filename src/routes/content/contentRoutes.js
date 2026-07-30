/**
 * @fileoverview Express routes for DigitalContent (Digital Library) module.
 * Connects middleware and controllers for upload, retrieval, update, and deletion.
 */

import express from 'express';
import { digitalContentUploadMiddleware } from '../../middleware/content/uploadMiddleware.js';
import { validateDigitalContent } from '../../middleware/content/contentValidationMiddleware.js';
import * as contentController from '../../controller/content/contentController.js';

// Import authentication and authorization middlewares
import { authenticate, authorizeContentContributor } from '../../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/digital-library/ (Publicly accessible to everyone)
router.get(
  '/',
  contentController.getAllContent
);

// POST /api/digital-library/upload (Restricted to authenticated Content Contributors only)
router.post(
  '/upload',
  authenticate,
  authorizeContentContributor,
  digitalContentUploadMiddleware, 
  validateDigitalContent,         
  contentController.createContent
);

// PUT /api/digital-library/:id (Restricted to authenticated Content Contributors only)
router.put(
  '/:id',
  authenticate,
  authorizeContentContributor,
  digitalContentUploadMiddleware,
  validateDigitalContent,         
  contentController.updateContent
);

// DELETE /api/digital-library/:id (Restricted to authenticated Content Contributors only)
router.delete(
  '/:id',
  authenticate,
  authorizeContentContributor,
  contentController.deleteContent
);

export default router;
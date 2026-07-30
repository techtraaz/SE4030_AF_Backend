/**
 * @swagger
 * tags:
 *   - name: Digital Content
 *     description: Endpoints for uploading, reading, updating and deleting digital library content.
 */

/**
 * @swagger
 * /api/digital-library:
 *   get:
 *     tags:
 *       - Digital Content
 *     summary: List all digital content
 *     description: Retrieve a list of all digital content items. Optionally filter by category.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *     responses:
 *       200:
 *         description: Successfully retrieved the content list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DigitalContent'
 */

/**
 * @swagger
 * /api/digital-library/upload:
 *   post:
 *     tags:
 *       - Digital Content
 *     summary: Upload a new digital content item
 *     description: Create a new resource with a file upload (image, video, audio, or document). Requires Content Contributor access.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ContentCreate'
 *     responses:
 *       201:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Digital content created successfully."
 *                 data:
 *                   $ref: '#/components/schemas/DigitalContent'
 *       400:
 *         description: Validation failed (e.g., missing fields, invalid file)
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Requires Content Contributor role
 */

/**
 * @swagger
 * /api/digital-library/{id}:
 *   get:
 *     tags:
 *       - Digital Content
 *     summary: Get content by ID
 *     description: Retrieve a single digital content item by its ID.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DigitalContent'
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /api/digital-library/{id}:
 *   put:
 *     tags:
 *       - Digital Content
 *     summary: Update an existing content item
 *     description: Update text fields or replace the media file. If a new file is uploaded, the old one is deleted from Cloudinary. Only the original uploader can perform this action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ContentUpdate'
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Digital content updated successfully."
 *                 data:
 *                   $ref: '#/components/schemas/DigitalContent'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only the original uploader can modify this content
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /api/digital-library/{id}:
 *   delete:
 *     tags:
 *       - Digital Content
 *     summary: Delete a content item
 *     description: Removes the content from the database and deletes the associated file from Cloudinary. Only the original uploader can perform this action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Digital content and associated files deleted successfully."
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only the original uploader can delete this content
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   parameters:
 *     IdParam:
 *       name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: The MongoDB ObjectId of the digital content
 *
 *   schemas:
 *     DigitalContent:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         uploaderId:
 *           type: string
 *           nullable: true
 *         title:
 *           type: string
 *           example: Grocery Dialog - Listening
 *         description:
 *           type: string
 *           example: Short listening practice at a supermarket.
 *         category:
 *           type: string
 *           example: Listening
 *         contentType:
 *           type: string
 *           enum: [video, audio, document, image]
 *         fileUrl:
 *           type: string
 *           example: https://res.cloudinary.com/your-cloud/video/upload/...
 *         cloudinaryId:
 *           type: string
 *           example: 1678901234-grocery-dialog
 *         approvalStatus:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *           example: Pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ContentCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - contentType
 *         - file
 *       properties:
 *         title:
 *           type: string
 *           description: Minimum 3 characters, letters/numbers/spaces (no symbols).
 *           example: Grocery Dialog - Listening
 *         description:
 *           type: string
 *           description: Minimum 10 characters.
 *           example: A short listening exercise for shopping dialogues.
 *         category:
 *           type: string
 *           description: Letters and spaces only.
 *           example: Listening
 *         contentType:
 *           type: string
 *           enum: [video, audio, document, image]
 *           example: audio
 *         file:
 *           type: string
 *           format: binary
 *           description: The media file to upload (image/video/audio/pdf).
 *
 *     ContentUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: Grocery Dialog - Listening (Updated)
 *         description:
 *           type: string
 *           example: Updated description
 *         category:
 *           type: string
 *           example: Listening
 *         contentType:
 *           type: string
 *           enum: [video, audio, document, image]
 *         file:
 *           type: string
 *           format: binary
 *           description: Optional new media file to replace the existing one.
 */
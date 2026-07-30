/**
 * @swagger
 * tags:
 *   name: Video
 *   description: Video section management for lessons
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/video:
 *   post:
 *     summary: Create video section for a lesson
 *     tags: [Video]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVideoRequest'
 *     responses:
 *       201:
 *         description: Video section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       400:
 *         description: Video already exists
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/video:
 *   get:
 *     summary: Get video section of a lesson
 *     tags: [Video]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Video section details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video section not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/video:
 *   put:
 *     summary: Update video section
 *     tags: [Video]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVideoRequest'
 *     responses:
 *       200:
 *         description: Video section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video section not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/video:
 *   delete:
 *     summary: Delete video section
 *     tags: [Video]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Video section deleted successfully
 *       404:
 *         description: Video section not found
 */
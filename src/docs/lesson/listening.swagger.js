/**
 * @swagger
 * tags:
 *   name: Listening
 *   description: Listening section management for lessons
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/listening:
 *   post:
 *     summary: Create listening section for a lesson
 *     tags: [Listening]
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
 *             $ref: '#/components/schemas/CreateListeningRequest'
 *     responses:
 *       201:
 *         description: Listening section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listening'
 *       400:
 *         description: Listening already exists
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/listening:
 *   get:
 *     summary: Get listening section of a lesson
 *     tags: [Listening]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Listening section details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listening'
 *       404:
 *         description: Listening section not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/listening:
 *   put:
 *     summary: Update listening section
 *     tags: [Listening]
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
 *             $ref: '#/components/schemas/UpdateListeningRequest'
 *     responses:
 *       200:
 *         description: Listening section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listening'
 *       404:
 *         description: Listening section not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/listening:
 *   delete:
 *     summary: Delete listening section
 *     tags: [Listening]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Listening section deleted successfully
 *       404:
 *         description: Listening section not found
 */
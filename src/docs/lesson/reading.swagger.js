/**
 * @swagger
 * tags:
 *   name: Reading
 *   description: Reading section management for lessons
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/reading:
 *   post:
 *     summary: Create reading section for a lesson
 *     tags: [Reading]
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
 *             $ref: '#/components/schemas/CreateReadingRequest'
 *     responses:
 *       201:
 *         description: Reading section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reading'
 *       400:
 *         description: Reading already exists
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/reading:
 *   get:
 *     summary: Get reading section of a lesson
 *     tags: [Reading]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Reading section details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reading'
 *       404:
 *         description: Reading section not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/reading:
 *   put:
 *     summary: Update reading section
 *     tags: [Reading]
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
 *             $ref: '#/components/schemas/UpdateReadingRequest'
 *     responses:
 *       200:
 *         description: Reading section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reading'
 *       404:
 *         description: Reading section not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/reading:
 *   delete:
 *     summary: Delete reading section
 *     tags: [Reading]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Reading section deleted successfully
 *       404:
 *         description: Reading section not found
 */
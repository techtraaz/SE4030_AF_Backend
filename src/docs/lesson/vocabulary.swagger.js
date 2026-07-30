/**
 * @swagger
 * tags:
 *   name: Vocabulary
 *   description: Vocabulary section management for lessons
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/vocabulary:
 *   post:
 *     summary: Create vocabulary section for a lesson
 *     tags: [Vocabulary]
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
 *             $ref: '#/components/schemas/CreateVocabularyRequest'
 *     responses:
 *       201:
 *         description: Vocabulary section created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vocabulary'
 *       400:
 *         description: Vocabulary already exists
 *       404:
 *         description: Lesson not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/vocabulary:
 *   get:
 *     summary: Get vocabulary section of a lesson
 *     tags: [Vocabulary]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Vocabulary section details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vocabulary'
 *       404:
 *         description: Vocabulary section not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/vocabulary:
 *   put:
 *     summary: Update vocabulary section
 *     tags: [Vocabulary]
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
 *             $ref: '#/components/schemas/UpdateVocabularyRequest'
 *     responses:
 *       200:
 *         description: Vocabulary section updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vocabulary'
 *       404:
 *         description: Vocabulary section not found
 */

/**
 * @swagger
 * /api/lessons/{lessonId}/vocabulary:
 *   delete:
 *     summary: Delete vocabulary section
 *     tags: [Vocabulary]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Vocabulary section deleted successfully
 *       404:
 *         description: Vocabulary section not found
 */

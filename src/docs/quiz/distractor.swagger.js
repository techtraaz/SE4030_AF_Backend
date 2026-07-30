/**
 * @swagger
 * tags:
 *   name: Quiz Distractors (Third-Party API)
 *   description: AI-powered quiz enhancement using Datamuse API for generating distractors, hints, and educational context
 */

/**
 * @swagger
 * /api/quiz/distractors/generate:
 *   post:
 *     summary: Generate distractor options (AI-powered wrong answers)
 *     description: Uses Datamuse API to generate plausible wrong answers based on the correct answer. Useful for content creators to quickly generate multiple choice options.
 *     tags: [Quiz Distractors (Third-Party API)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correctAnswer
 *             properties:
 *               correctAnswer:
 *                 type: string
 *                 description: The correct answer text to base distractors on
 *                 example: "Happy"
 *               count:
 *                 type: integer
 *                 description: Number of distractors to generate (1-10)
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 3
 *                 example: 3
 *     responses:
 *       200:
 *         description: Distractors generated successfully
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
 *                   example: "Distractors generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     correctAnswer:
 *                       type: string
 *                       example: "Happy"
 *                     distractors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Cheerful", "Glad", "Joyful"]
 *                     count:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Invalid request (empty correct answer or invalid count)
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - User role not authorized (requires ADMIN or CONTENT_CONTRIBUTOR)
 *       500:
 *         description: Server error or third-party API failure
 */

/**
 * @swagger
 * /api/quiz/distractors/hints:
 *   post:
 *     summary: Generate contextual hints for a quiz question
 *     description: Uses Datamuse API to generate hint words related to the correct answer without revealing it directly
 *     tags: [Quiz Distractors (Third-Party API)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correctAnswer
 *             properties:
 *               correctAnswer:
 *                 type: string
 *                 description: The correct answer to generate hints for
 *                 example: "Joyful"
 *               maxHints:
 *                 type: integer
 *                 description: Maximum number of hint words to return
 *                 default: 3
 *                 example: 3
 *     responses:
 *       200:
 *         description: Hints generated successfully
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
 *                   example: "Hints generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     hints:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["cheerful", "glad", "happy"]
 *                     hintText:
 *                       type: string
 *                       example: "This word is related to: cheerful, glad, happy"
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/quiz/distractors/context/{word}:
 *   get:
 *     summary: Get educational context for a word
 *     description: Retrieves synonyms and related words using Datamuse API for educational feedback after quiz completion
 *     tags: [Quiz Distractors (Third-Party API)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: word
 *         required: true
 *         schema:
 *           type: string
 *         description: The word to get educational context for
 *         example: "Happy"
 *     responses:
 *       200:
 *         description: Educational context retrieved successfully
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
 *                   example: "Educational context retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     word:
 *                       type: string
 *                       example: "Happy"
 *                     synonyms:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["joyful", "cheerful", "glad"]
 *                     related:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["smile", "laugh", "joy"]
 *       400:
 *         description: Invalid request (empty word)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

export default {};

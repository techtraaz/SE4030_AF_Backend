/**
 * @swagger
 * tags:
 *   name: Quiz - Quizzes
 *   description: Quiz CRUD operations
 */

/**
 * @swagger
 * /api/quiz/quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quiz - Quizzes]
 *     description: Create a quiz for either a course or a lesson (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuizRequest'
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResponse'
 *       400:
 *         description: Bad request - Quiz must belong to either course or lesson
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 */

/**
 * @swagger
 * /api/quiz/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quiz - Quizzes]
 *     description: Retrieve all quizzes with optional filters (Requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *         example: 64f1c2e4a12b3456789abcde
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: string
 *         description: Filter by lesson ID
 *         example: 64f1c2e4a12b3456789abcdf
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *         example: true
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Quizzes retrieved successfully
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * /api/quiz/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quiz - Quizzes]
 *     description: Retrieve a specific quiz by ID (Requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Quiz not found
 */

/**
 * @swagger
 * /api/quiz/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quiz - Quizzes]
 *     description: Update quiz details (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *         example: 64f1c2e4a12b3456789abcde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuizRequest'
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Quiz not found
 */

/**
 * @swagger
 * /api/quiz/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quiz - Quizzes]
 *     description: Delete quiz and all associated questions and options (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Quiz not found
 */

/**
 * @swagger
 * /api/quiz/quizzes/{id}/publish:
 *   patch:
 *     summary: Publish quiz
 *     tags: [Quiz - Quizzes]
 *     description: Publish a quiz (requires at least one question) (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Quiz published successfully
 *       400:
 *         description: Cannot publish quiz without questions
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Quiz not found
 */

/**
 * @swagger
 * /api/quiz/quizzes/{id}/unpublish:
 *   patch:
 *     summary: Unpublish quiz
 *     tags: [Quiz - Quizzes]
 *     description: Unpublish a quiz (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Quiz unpublished successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Quiz not found
 */
/**
 * @swagger
 * tags:
 *   name: Quiz - Options
 *   description: Option management APIs
 */

/**
 * @swagger
 * /api/quiz/options:
 *   post:
 *     summary: Create an option
 *     tags: [Quiz - Options]
 *     description: Create an option for a question (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOptionRequest'
 *     responses:
 *       201:
 *         description: Option created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Question not found
 */

/**
 * @swagger
 * /api/quiz/options/question/{questionId}:
 *   get:
 *     summary: Get all options for a question
 *     tags: [Quiz - Options]
 *     description: Retrieve all options for a specific question (Requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Options retrieved successfully
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
 *                   example: Options retrieved successfully
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Option'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * /api/quiz/options/{id}:
 *   put:
 *     summary: Update option
 *     tags: [Quiz - Options]
 *     description: Update option details (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Option ID
 *         example: 64f1c2e4a12b3456789abcde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOptionRequest'
 *     responses:
 *       200:
 *         description: Option updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Option not found
 */

/**
 * @swagger
 * /api/quiz/options/{id}:
 *   delete:
 *     summary: Delete option
 *     tags: [Quiz - Options]
 *     description: Delete an option (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Option ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Option deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Option not found
 */
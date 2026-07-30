/**
 * @swagger
 * tags:
 *   name: Forum - Answers
 *   description: Forum answer management endpoints
 *
 * /api/forums/{forumId}/posts/{postId}/answers:
 *   get:
 *     summary: Get all answers for a post
 *     description: Returns answers sorted by accepted status, upvote count, then newest first
 *     tags: [Forum - Answers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum ID
 *         example: 64f1c2e4a12b3456789abcde
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: 64f1c2e4a12b3456789abcdf
 *     responses:
 *       200:
 *         description: Answers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Answer'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Post not found
 *
 *   post:
 *     summary: Create an answer for a post
 *     description: User must be a forum member and not banned to submit an answer. Also increments post answerCount.
 *     tags: [Forum - Answers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum ID
 *         example: 64f1c2e4a12b3456789abcde
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: 64f1c2e4a12b3456789abcdf
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnswerRequest'
 *     responses:
 *       201:
 *         description: Answer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Answer'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: You are banned from this forum or must join first
 *       404:
 *         description: Post not found
 *
 * /api/forums/{forumId}/posts/{postId}/answers/{answerId}:
 *   patch:
 *     summary: Update an answer
 *     description: Only the answer author can update their answer
 *     tags: [Forum - Answers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum ID
 *         example: 64f1c2e4a12b3456789abcde
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: 64f1c2e4a12b3456789abcdf
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The answer ID
 *         example: 64f1c2e4a12b3456789abce0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAnswerRequest'
 *     responses:
 *       200:
 *         description: Answer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Answer'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Unauthorized to update this answer
 *       404:
 *         description: Answer not found
 *
 *   delete:
 *     summary: Delete an answer
 *     description: Answer author or ADMIN can soft-delete an answer. Also decrements post answerCount.
 *     tags: [Forum - Answers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum ID
 *         example: 64f1c2e4a12b3456789abcde
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: 64f1c2e4a12b3456789abcdf
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The answer ID
 *         example: 64f1c2e4a12b3456789abce0
 *     responses:
 *       200:
 *         description: Answer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       nullable: true
 *                       example: null
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Unauthorized to delete this answer
 *       404:
 *         description: Answer not found
 *
 * /api/forums/{forumId}/posts/{postId}/answers/{answerId}/accept:
 *   patch:
 *     summary: Accept an answer
 *     description: Only the post author can accept an answer. Accepting a new answer will unaccept any previously accepted answer.
 *     tags: [Forum - Answers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum ID
 *         example: 64f1c2e4a12b3456789abcde
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *         example: 64f1c2e4a12b3456789abcdf
 *       - in: path
 *         name: answerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The answer ID
 *         example: 64f1c2e4a12b3456789abce0
 *     responses:
 *       200:
 *         description: Answer accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Answer'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Only the post author can accept an answer
 *       404:
 *         description: Answer not found or Post not found
 */
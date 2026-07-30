/**
 * @swagger
 * tags:
 *   name: Forum - Posts
 *   description: Forum post management endpoints
 *
 * /api/forums/{forumId}/posts:
 *   get:
 *     summary: Get all posts in a forum (paginated)
 *     description: Returns paginated posts for a forum, sorted by newest first
 *     tags: [Forum - Posts]
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: Posts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/PaginatedPostsResponse'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Forum not found
 *
 *   post:
 *     summary: Create a post in a forum
 *     description: User must be a forum member and not banned to create a post
 *     tags: [Forum - Posts]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: You are banned from this forum or must join first
 *       404:
 *         description: Forum not found
 *
 * /api/forums/{forumId}/posts/{postId}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Forum - Posts]
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
 *         description: Post fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Post not found
 *
 *   patch:
 *     summary: Update a post
 *     description: Only the post author can update. Only title and content can be changed.
 *     tags: [Forum - Posts]
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
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Unauthorized to update this post
 *       404:
 *         description: Post not found
 *
 *   delete:
 *     summary: Delete a post
 *     description: Post author or ADMIN can soft-delete a post
 *     tags: [Forum - Posts]
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
 *         description: Post deleted successfully
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
 *         description: Unauthorized to delete this post
 *       404:
 *         description: Post not found
 */
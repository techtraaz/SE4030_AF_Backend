/**
 * @swagger
 * tags:
 *   name: Forums
 *   description: Forum management endpoints
 *
 * /api/forums:
 *   get:
 *     summary: Get all active forums
 *     tags: [Forums]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Forums fetched successfully
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
 *                         $ref: '#/components/schemas/Forum'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *
 *   post:
 *     summary: Create a new forum
 *     description: Only ADMIN or CONTENT_CONTRIBUTOR roles can create forums
 *     tags: [Forums]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateForumRequest'
 *     responses:
 *       201:
 *         description: Forum created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Forum'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient role
 *       409:
 *         description: Forum with this name already exists
 *
 * /api/forums/{forumId}:
 *   get:
 *     summary: Get a forum by ID
 *     tags: [Forums]
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
 *     responses:
 *       200:
 *         description: Forum fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Forum'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Forum not found
 *
 *   patch:
 *     summary: Update a forum
 *     description: Only the forum creator, ADMIN, or CONTENT_CONTRIBUTOR can update a forum
 *     tags: [Forums]
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
 *             $ref: '#/components/schemas/UpdateForumRequest'
 *     responses:
 *       200:
 *         description: Forum updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/Forum'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Unauthorized to update this forum
 *       404:
 *         description: Forum not found
 *
 * /api/forums/{forumId}/join:
 *   post:
 *     summary: Join a forum
 *     description: Any authenticated user can join a forum unless they are banned
 *     tags: [Forums]
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
 *     responses:
 *       201:
 *         description: Joined forum successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/ForumMembership'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: You are banned from this forum
 *       404:
 *         description: Forum not found
 *       409:
 *         description: You are already a member of this forum
 *
 * /api/forums/{forumId}/leave:
 *   delete:
 *     summary: Leave a forum
 *     description: Any authenticated member can leave a forum
 *     tags: [Forums]
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
 *     responses:
 *       200:
 *         description: Left forum successfully
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
 *       404:
 *         description: You are not a member of this forum
 *
 * /api/forums/{forumId}/ban:
 *   post:
 *     summary: Ban a user from a forum
 *     description: Only the forum creator, ADMIN, or CONTENT_CONTRIBUTOR can ban users
 *     tags: [Forums]
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
 *             $ref: '#/components/schemas/BanUserRequest'
 *     responses:
 *       201:
 *         description: User banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/ForumBan'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Unauthorized to ban users from this forum
 *       404:
 *         description: Forum not found
 *       409:
 *         description: User is already banned from this forum
 *
 * /api/forums/{forumId}/unban:
 *   patch:
 *     summary: Unban a user from a forum
 *     description: Only the forum creator, ADMIN, or CONTENT_CONTRIBUTOR can unban users
 *     tags: [Forums]
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
 *             $ref: '#/components/schemas/UnbanUserRequest'
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/ForumBan'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Unauthorized to unban users
 *       404:
 *         description: Forum not found or no active ban found for this user
 */
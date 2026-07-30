/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs - requires ADMIN role
 */

/**
 * @swagger
 * /api/admin/contributors/pending:
 *   get:
 *     summary: Get all pending contributors
 *     description: >
 *       Returns a list of all content contributor accounts with PENDING status
 *       waiting for admin approval. Requires ADMIN role.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pending contributors fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 200
 *               message: Pending contributors fetched
 *               content:
 *                 - _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                   email: contributor1@example.com
 *                   role: CONTENT_CONTRIBUTOR
 *                   status: PENDING
 *                   isActive: false
 *                   createdAt: 2026-02-22T10:00:00.000Z
 *                 - _id: 65f1a2b3c4d5e6f7a8b9c0d2
 *                   email: contributor2@example.com
 *                   role: CONTENT_CONTRIBUTOR
 *                   status: PENDING
 *                   isActive: false
 *                   createdAt: 2026-02-23T10:00:00.000Z
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               code: 401
 *               message: No token provided
 *               content: null
 *       403:
 *         description: Forbidden - not an admin
 *         content:
 *           application/json:
 *             example:
 *               code: 403
 *               message: Admin access required
 *               content: null
 */

/**
 * @swagger
 * /api/admin/contributors/{userId}/approve:
 *   patch:
 *     summary: Approve a pending contributor
 *     description: >
 *       Approves a content contributor account by setting their status to ACTIVE.
 *       Only works for users with CONTENT_CONTRIBUTOR role and PENDING status.
 *       Requires ADMIN role.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the contributor to approve
 *         example: 65f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Contributor approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 200
 *               message: Contributor approved successfully
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 email: contributor@example.com
 *                 role: CONTENT_CONTRIBUTOR
 *                 status: ACTIVE
 *                 isActive: true
 *                 createdAt: 2026-02-22T10:00:00.000Z
 *                 updatedAt: 2026-02-27T10:00:00.000Z
 *       404:
 *         description: Pending contributor not found
 *         content:
 *           application/json:
 *             example:
 *               code: 404
 *               message: Pending contributor not found
 *               content: null
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               code: 401
 *               message: No token provided
 *               content: null
 *       403:
 *         description: Forbidden - not an admin
 *         content:
 *           application/json:
 *             example:
 *               code: 403
 *               message: Admin access required
 *               content: null
 */

/**
 * @swagger
 * /api/admin/contributors/{userId}/reject:
 *   patch:
 *     summary: Reject a pending contributor
 *     description: >
 *       Rejects a content contributor account by setting their status to REJECTED.
 *       Only works for users with CONTENT_CONTRIBUTOR role and PENDING status.
 *       Rejected users cannot login. Requires ADMIN role.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the contributor to reject
 *         example: 65f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Contributor rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 200
 *               message: Contributor rejected
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 email: contributor@example.com
 *                 role: CONTENT_CONTRIBUTOR
 *                 status: REJECTED
 *                 isActive: false
 *                 createdAt: 2026-02-22T10:00:00.000Z
 *                 updatedAt: 2026-02-27T10:00:00.000Z
 *       404:
 *         description: Pending contributor not found
 *         content:
 *           application/json:
 *             example:
 *               code: 404
 *               message: Pending contributor not found
 *               content: null
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               code: 401
 *               message: No token provided
 *               content: null
 *       403:
 *         description: Forbidden - not an admin
 *         content:
 *           application/json:
 *             example:
 *               code: 403
 *               message: Admin access required
 *               content: null
 */
/**
 * @swagger
 * tags:
 *   name: Course Level
 *   description: Course difficulty level management APIs
 */

/**
 * @swagger
 * /api/course-level:
 *   get:
 *     summary: Get all course levels
 *     tags: [Course Level]
 *     description: Retrieve all available course difficulty levels
 *     responses:
 *       200:
 *         description: Course levels retrieved successfully
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
 *                   example: Course levels retrieved successfully
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseLevel'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/course-level/{id}:
 *   get:
 *     summary: Get course level by ID
 *     tags: [Course Level]
 *     description: Retrieve a specific course level by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Level ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Course level retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseLevelResponse'
 *       404:
 *         description: Course level not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/course-level:
 *   post:
 *     summary: Create a new course level
 *     tags: [Course Level]
 *     description: Create a new difficulty level for courses (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseLevelRequest'
 *     responses:
 *       201:
 *         description: Course level created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseLevelResponse'
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/course-level/{id}:
 *   put:
 *     summary: Update course level
 *     tags: [Course Level]
 *     description: Update a course difficulty level (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Level ID
 *         example: 64f1c2e4a12b3456789abcde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCourseLevelRequest'
 *     responses:
 *       200:
 *         description: Course level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseLevelResponse'
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course level not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/course-level/{id}:
 *   delete:
 *     summary: Delete course level
 *     tags: [Course Level]
 *     description: Delete a course difficulty level (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course Level ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Course level deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course level not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * tags:
 *   name: Course
 *   description: Course management APIs
 */

/**
 * @swagger
 * /api/course:
 *   post:
 *     summary: Create a new course
 *     tags: [Course]
 *     description: Create a new course (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 */

/**
 * @swagger
 * /api/course:
 *   get:
 *     summary: Get all courses
 *     tags: [Course]
 *     description: Retrieve all courses with optional filters (Requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *         example: 64f1c2e4a12b3456789abcde
 *       - in: query
 *         name: levelId
 *         schema:
 *           type: string
 *         description: Filter by difficulty level ID
 *         example: 64f1c2e4a12b3456789abcdf
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Filter by language ID
 *         example: 64f1c2e4a12b3456789abce0
 *       - in: query
 *         name: createdById
 *         schema:
 *           type: string
 *         description: Filter by creator ID
 *         example: 64f1c2e4a12b3456789abcdf
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *         example: true
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                   example: Courses retrieved successfully
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * /api/course/statistics/global:
 *   get:
 *     summary: Get global course statistics
 *     tags: [Course]
 *     description: Retrieve aggregated statistics for all courses (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Global course statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GlobalCourseStatisticsResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/course/creator/{creatorId}:
 *   get:
 *     summary: Get courses by creator
 *     tags: [Course]
 *     description: Retrieve all courses created by a specific user (Requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creatorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Creator/User ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                   example: Courses retrieved successfully
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */

/**
 * @swagger
 * /api/course/{id}/statistics:
 *   get:
 *     summary: Get course statistics
 *     tags: [Course]
 *     description: Get statistics for a specific course (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Course statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatisticsResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/course/{id}/publish:
 *   patch:
 *     summary: Publish course
 *     tags: [Course]
 *     description: Make a course publicly available (Requires Admin authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Course published successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/course/{id}/unpublish:
 *   patch:
 *     summary: Unpublish course
 *     tags: [Course]
 *     description: Make a course unavailable (Requires Admin authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Course unpublished successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/course/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Course]
 *     description: Retrieve a specific course by ID (Requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/course/{id}:
 *   put:
 *     summary: Update course
 *     tags: [Course]
 *     description: Update course details (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64f1c2e4a12b3456789abcde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCourseRequest'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /api/course/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Course]
 *     description: Delete a course (Requires Admin or Content Contributor authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin or Content Contributor access required
 *       404:
 *         description: Course not found
 */
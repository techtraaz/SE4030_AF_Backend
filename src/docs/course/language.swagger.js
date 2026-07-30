/**
 * @swagger
 * tags:
 *   name: Language
 *   description: Language management APIs
 */

/**
 * @swagger
 * /api/language:
 *   get:
 *     summary: Get all languages
 *     tags: [Language]
 *     description: Retrieve all available course languages
 *     responses:
 *       200:
 *         description: Languages retrieved successfully
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
 *                   example: Languages retrieved successfully
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Language'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/language/{id}:
 *   get:
 *     summary: Get language by ID
 *     tags: [Language]
 *     description: Retrieve a specific language by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Language ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Language retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LanguageResponse'
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/language:
 *   post:
 *     summary: Create a new language
 *     tags: [Language]
 *     description: Create a new language for courses (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLanguageRequest'
 *     responses:
 *       201:
 *         description: Language created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LanguageResponse'
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
 * /api/language/{id}:
 *   put:
 *     summary: Update language
 *     tags: [Language]
 *     description: Update a language (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Language ID
 *         example: 64f1c2e4a12b3456789abcde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLanguageRequest'
 *     responses:
 *       200:
 *         description: Language updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LanguageResponse'
 *       400:
 *         description: Bad request - invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/language/{id}:
 *   delete:
 *     summary: Delete language
 *     tags: [Language]
 *     description: Delete a language (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Language ID
 *         example: 64f1c2e4a12b3456789abcde
 *     responses:
 *       200:
 *         description: Language deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 */

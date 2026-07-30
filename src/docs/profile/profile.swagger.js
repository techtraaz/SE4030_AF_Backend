/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: Profile management for all user roles
 */

// ==============================
// CREATE PROFILE ROUTES
// ==============================

/**
 * @swagger
 * /api/profile/create-refugee:
 *   post:
 *     summary: Create refugee profile
 *     description: Creates a profile for the authenticated refugee user. Only REFUGEE role allowed.
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRefugeeProfileRequest'
 *           example:
 *             fullName: John Doe
 *             dateOfBirth: 1990-05-15
 *             nationality: Syrian
 *             preferredLanguage: Arabic
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 201
 *               message: Profile created successfully
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 userId: 65f1a2b3c4d5e6f7a8b9c0d2
 *                 fullName: John Doe
 *                 dateOfBirth: 1990-05-15
 *                 nationality: Syrian
 *                 preferredLanguage: Arabic
 *       409:
 *         description: Profile already exists
 *         content:
 *           application/json:
 *             example:
 *               code: 409
 *               message: Profile already exists
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
 *         description: Forbidden - not a refugee
 *         content:
 *           application/json:
 *             example:
 *               code: 403
 *               message: Refugee access required
 *               content: null
 */

/**
 * @swagger
 * /api/profile/create-contributor:
 *   post:
 *     summary: Create content contributor profile
 *     description: Creates a profile for the authenticated content contributor. Only CONTENT_CONTRIBUTOR role allowed.
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContributorProfileRequest'
 *           example:
 *             fullName: Jane Smith
 *             bio: Experienced language teacher with 10 years of teaching English.
 *             expertise: [English, Grammar, Vocabulary]
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 201
 *               message: Profile created successfully
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 userId: 65f1a2b3c4d5e6f7a8b9c0d2
 *                 fullName: Jane Smith
 *                 bio: Experienced language teacher with 10 years of teaching English.
 *                 expertise: [English, Grammar, Vocabulary]
 *       409:
 *         description: Profile already exists
 *         content:
 *           application/json:
 *             example:
 *               code: 409
 *               message: Profile already exists
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
 *         description: Forbidden - not a content contributor
 *         content:
 *           application/json:
 *             example:
 *               code: 403
 *               message: Content Contributor access required
 *               content: null
 */

/**
 * @swagger
 * /api/profile/create-admin:
 *   post:
 *     summary: Create admin profile
 *     description: Creates a profile for the authenticated admin user. Only ADMIN role allowed.
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminProfileRequest'
 *           example:
 *             fullName: Admin User
 *             accessLevel: STANDARD
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 201
 *               message: Profile created successfully
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 userId: 65f1a2b3c4d5e6f7a8b9c0d2
 *                 fullName: Admin User
 *                 accessLevel: STANDARD
 *       409:
 *         description: Profile already exists
 *         content:
 *           application/json:
 *             example:
 *               code: 409
 *               message: Profile already exists
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

// ==============================
// GET PROFILE ROUTE
// ==============================

/**
 * @swagger
 * /api/profile/get:
 *   get:
 *     summary: Get current user profile
 *     description: >
 *       Fetches the profile of the currently authenticated user.
 *       Returns the correct profile type based on the user's role
 *       (RefugeeProfile, ContentContributorProfile, or AdminProfile).
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               refugeeProfile:
 *                 summary: Refugee Profile
 *                 value:
 *                   code: 200
 *                   message: Profile fetched successfully
 *                   content:
 *                     _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                     userId: 65f1a2b3c4d5e6f7a8b9c0d2
 *                     fullName: John Doe
 *                     dateOfBirth: 1990-05-15
 *                     nationality: Syrian
 *                     preferredLanguage: Arabic
 *               contributorProfile:
 *                 summary: Contributor Profile
 *                 value:
 *                   code: 200
 *                   message: Profile fetched successfully
 *                   content:
 *                     _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                     userId: 65f1a2b3c4d5e6f7a8b9c0d2
 *                     fullName: Jane Smith
 *                     bio: Experienced language teacher.
 *                     expertise: [English, Grammar]
 *               adminProfile:
 *                 summary: Admin Profile
 *                 value:
 *                   code: 200
 *                   message: Profile fetched successfully
 *                   content:
 *                     _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                     userId: 65f1a2b3c4d5e6f7a8b9c0d2
 *                     fullName: Admin User
 *                     accessLevel: STANDARD
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             example:
 *               code: 404
 *               message: Profile not found
 *               content: null
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               code: 401
 *               message: No token provided
 *               content: null
 */

// ==============================
// UPDATE PROFILE ROUTE
// ==============================

/**
 * @swagger
 * /api/profile/update:
 *   patch:
 *     summary: Update current user profile
 *     description: >
 *       Updates the profile of the currently authenticated user.
 *       Only include fields you want to update.
 *       The correct profile model is resolved automatically based on user role.
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           examples:
 *             refugeeUpdate:
 *               summary: Refugee profile update
 *               value:
 *                 fullName: John Doe Updated
 *                 preferredLanguage: French
 *             contributorUpdate:
 *               summary: Contributor profile update
 *               value:
 *                 fullName: Jane Smith Updated
 *                 bio: Updated bio with new experience details.
 *                 expertise: [English, Grammar, Pronunciation]
 *             adminUpdate:
 *               summary: Admin profile update
 *               value:
 *                 fullName: Admin User Updated
 *                 accessLevel: SUPER
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 200
 *               message: Profile updated successfully
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 userId: 65f1a2b3c4d5e6f7a8b9c0d2
 *                 fullName: John Doe Updated
 *                 preferredLanguage: French
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             example:
 *               code: 404
 *               message: Profile not found
 *               content: null
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               code: 401
 *               message: No token provided
 *               content: null
 */
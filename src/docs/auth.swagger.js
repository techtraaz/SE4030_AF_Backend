/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User & Admin authentication APIs
 */

/**
 * @swagger
 * /api/auth/refugee/signup:
 *   post:
 *     summary: Register a new refugee
 *     description: Creates a new refugee account. Account is immediately ACTIVE after registration.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           example:
 *             email: refugee@example.com
 *             password: StrongPassword123
 *     responses:
 *       201:
 *         description: Refugee registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 201
 *               message: Refugee registered successfully
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 email: refugee@example.com
 *                 role: REFUGEE
 *                 status: ACTIVE
 *                 isActive: true
 *       400:
 *         description: User already exists or bad request
 *         content:
 *           application/json:
 *             example:
 *               code: 400
 *               message: User already exists
 *               content: null
 */

/**
 * @swagger
 * /api/auth/contributor/signup:
 *   post:
 *     summary: Register a new content contributor
 *     description: >
 *       Creates a new content contributor account.
 *       Account status is set to PENDING and requires admin approval before login is allowed.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           example:
 *             email: contributor@example.com
 *             password: StrongPassword123
 *     responses:
 *       201:
 *         description: Registration submitted, pending admin approval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 201
 *               message: Registration submitted. Please wait for admin approval before logging in.
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 email: contributor@example.com
 *                 role: CONTENT_CONTRIBUTOR
 *                 status: PENDING
 *                 isActive: false
 *       400:
 *         description: User already exists or bad request
 *         content:
 *           application/json:
 *             example:
 *               code: 400
 *               message: User already exists
 *               content: null
 */

/**
 * @swagger
 * /api/auth/admin/signup:
 *   post:
 *     summary: Register a new admin
 *     description: Creates a new admin account. Account is immediately ACTIVE after registration.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           example:
 *             email: admin@example.com
 *             password: StrongPassword123
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 201
 *               message: Admin registered successfully
 *               content:
 *                 _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                 email: admin@example.com
 *                 role: ADMIN
 *                 status: ACTIVE
 *                 isActive: true
 *       400:
 *         description: User already exists or bad request
 *         content:
 *           application/json:
 *             example:
 *               code: 400
 *               message: User already exists
 *               content: null
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     description: >
 *       Authenticates a user and returns a JWT token (expires in 1h).
 *       PENDING accounts (contributors awaiting approval) and REJECTED accounts cannot login.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: user@example.com
 *             password: StrongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 200
 *               message: Login successful
 *               content:
 *                 user:
 *                   _id: 65f1a2b3c4d5e6f7a8b9c0d1
 *                   email: user@example.com
 *                   role: REFUGEE
 *                   status: ACTIVE
 *                   isActive: true
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials, pending approval, or rejected account
 *         content:
 *           application/json:
 *             examples:
 *               invalidCredentials:
 *                 summary: Wrong email or password
 *                 value:
 *                   code: 401
 *                   message: Invalid credentials
 *                   content: null
 *               pendingAccount:
 *                 summary: Contributor awaiting approval
 *                 value:
 *                   code: 401
 *                   message: Your account is pending admin approval
 *                   content: null
 *               rejectedAccount:
 *                 summary: Rejected account
 *                 value:
 *                   code: 401
 *                   message: Your account has been rejected
 *                   content: null
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Blacklists the current JWT token. Requires a valid Bearer token.
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               code: 200
 *               message: Logged out successfully
 *               content: null
 *       400:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             example:
 *               code: 400
 *               message: Invalid token
 *               content: null
 *       401:
 *         description: No token or already blacklisted token
 *         content:
 *           application/json:
 *             examples:
 *               noToken:
 *                 summary: No token provided
 *                 value:
 *                   code: 401
 *                   message: No token provided
 *                   content: null
 *               blacklistedToken:
 *                 summary: Token already invalidated
 *                 value:
 *                   code: 401
 *                   message: Token has been invalidated. Please login again
 *                   content: null
 */
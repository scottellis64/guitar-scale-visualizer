import { Router, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthorizationService } from '../services';

const router = Router();
const authService = AuthorizationService.getInstance();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and returns a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
const handleRegister: RequestHandler = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { username, email, password } = req.body;
        const result = await authService.register(username, email, password);
        res.status(201).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and returns a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
const handleLogin: RequestHandler = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        const result = await authService.login(username, password);
        
        if (!result) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        
        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};

// Register routes
router.post('/register', 
    [
        body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long'),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    handleRegister
);

router.post('/login', 
    [
        body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    handleLogin
);

export default router; 
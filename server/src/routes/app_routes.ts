import { Router, Request, Response, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import { createUser, getUser, TABLES } from '../utils';
import { Scale } from '../models/Scale';
import healthRoutes from './health_routes';

const router = Router();

/**
 * @swagger
 * /api/collections:
 *   get:
 *     summary: List all available collections
 *     description: Returns a list of all available collections in the system
 *     tags: [Collections]
 *     responses:
 *       200:
 *         description: List of collections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 collections:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 */
const handleListCollections: RequestHandler = async (_req, res, next) => {
  try {
    res.json({ collections: Object.values(TABLES) });
  } catch (error) {
    console.error('Collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

/**
 * @swagger
 * /api/scales:
 *   get:
 *     summary: Get all available scales
 *     description: Returns a list of all available musical scales
 *     tags: [Scales]
 *     responses:
 *       200:
 *         description: List of scales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   intervals:
 *                     type: array
 *                     items:
 *                       type: number
 */
router.get('/scales', (_req, res) => {
    const scales: Scale[] = [
        { id: '1', name: 'Major Scale', intervals: [0, 2, 4, 5, 7, 9, 11] },
        { id: '2', name: 'Minor Scale', intervals: [0, 2, 3, 5, 7, 8, 10] }
    ];
    res.json(scales);
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided information
 *     tags: [Users]
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
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
const handleCreateUser: RequestHandler = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { username, email, password } = req.body;
    const id = await createUser({ username, email, password });
    res.status(201).json({ id, username, email });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a user's information by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
const handleGetUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

// Register routes
router.get('/collections', handleListCollections);
router.post('/users', 
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
  handleCreateUser
);
router.get('/users/:id', handleGetUser);

export default router; 
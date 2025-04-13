import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { Db } from 'mongodb';
import { Scale } from '../models/Scale';

const router = Router();

// List all available MongoDB collections
router.get('/collections', async (_req: Request, res: Response) => {
    try {
        // Wait for connection to be ready
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((collection: { name: string }) => collection.name);
        res.json({ collections: collectionNames });
    } catch (error) {
        console.error('Collections error:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
});

router.get('/scales', (_req, res) => {
    const scales: Scale[] = [
        { id: '1', name: 'Major Scale', intervals: [0, 2, 4, 5, 7, 9, 11] },
        { id: '2', name: 'Minor Scale', intervals: [0, 2, 3, 5, 7, 8, 10] }
    ];
    res.json(scales);
});

// Create a new user
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
    async (req: Request, res: Response) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, email, password } = req.body;
            const user = new User({ username, email, password });
            await user.save();
            res.status(201).json(user);
        } catch (error: unknown) {
            if (error instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ error: error.message });
            }
            if (error instanceof mongoose.Error && 'code' in error && error.code === 11000) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
);

// Get all users
router.get('/users', async (_req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

export default router; 
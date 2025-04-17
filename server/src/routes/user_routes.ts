import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth_middleware';
import { AuthRequest } from '../middleware/auth_middleware';

const router = Router();

// Register new user
router.post('/register', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await argon2.hash(password);

        // Create new user
        const newUser = {
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertedId.toString() },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: result.insertedId,
                email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const { email, password } = req.body;

        // Find user
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await argon2.verify(user.password, password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile
router.get('/profile', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
        const db = mongoose.connection.db as Db;

        const user = await db.collection('users').findOne({ 
            _id: new mongoose.Types.ObjectId(decoded.userId) 
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
        const db = mongoose.connection.db as Db;
        const { email, currentPassword, newPassword } = req.body;

        const user = await db.collection('users').findOne({ 
            _id: new mongoose.Types.ObjectId(decoded.userId) 
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password if changing password
        if (newPassword) {
            const validPassword = await argon2.verify(user.password, currentPassword);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        }

        // Check if new email is already taken
        if (email !== user.email) {
            const existingUser = await db.collection('users').findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }
        }

        const updateData: any = {
            email: email || user.email,
            updatedAt: new Date()
        };

        if (newPassword) {
            updateData.password = await argon2.hash(newPassword);
        }

        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: updateData }
        );

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: updateData.email
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Delete user account
router.delete('/profile', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
        const db = mongoose.connection.db as Db;

        await db.collection('users').deleteOne({ 
            _id: new mongoose.Types.ObjectId(decoded.userId) 
        });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// Change password route
router.post('/change-password', authenticateToken, [
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req: AuthRequest, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.userId;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const validPassword = await argon2.verify(user.password, currentPassword);
        if (!validPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await argon2.hash(newPassword);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 
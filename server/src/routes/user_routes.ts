import { Router, Request, Response } from 'express';
import { Db } from 'mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await db.collection('users').findOne({ 
            $or: [{ username }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            username,
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
                username,
                email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
    try {
        if (!mongoose.connection.readyState) {
            return res.status(503).json({ error: 'Database not ready' });
        }

        const db = mongoose.connection.db as Db;
        const { email, password } = req.body;

        // Find user
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
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
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
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
                username: user.username,
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
        const { username, email, currentPassword, newPassword } = req.body;

        const user = await db.collection('users').findOne({ 
            _id: new mongoose.Types.ObjectId(decoded.userId) 
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password if changing password
        if (newPassword) {
            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        }

        // Check if new email or username is already taken
        if (email !== user.email || username !== user.username) {
            const existingUser = await db.collection('users').findOne({
                $or: [
                    { email, _id: { $ne: user._id } },
                    { username, _id: { $ne: user._id } }
                ]
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
        }

        const updateData: any = {
            username: username || user.username,
            email: email || user.email,
            updatedAt: new Date()
        };

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(newPassword, salt);
        }

        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: updateData }
        );

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: updateData.username,
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

export default router; 
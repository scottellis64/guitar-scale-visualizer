import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { appRouter, facebookRouter, audioRouter, userRouter, videoRouter } from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/app', appRouter);
app.use('/api/fb', facebookRouter);
app.use('/api/audio', audioRouter);
app.use('/api/users', userRouter);
app.use('/api/videos', videoRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sellis:sellis@localhost:27017/guitar-app';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Handle graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
}); 
// Load environment variables first
import dotenv from 'dotenv';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import { appRouter, facebookRouter, audioRouter, userRouter, videoRouter } from './routes';
import { registerService } from './utils/consul';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.SERVER_PORT) || 3000;
const HOST = process.env.SERVER_HOST || '0.0.0.0';

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const mongoURL = process.env.MONGODB_URL;
console.log(mongoURL);
if (! mongoURL) {
    throw new Error("MONGODB_URL environment variable is not defined");
}

// Configure mongoose options
mongoose.set('strictQuery', true);

// Connect to MongoDB
const connectWithRetry = async () => {
    try {
        await mongoose.connect(mongoURL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB successfully');
        
        // Register with Consul
        await registerService({
            name: 'server',
            port: PORT,
            address: HOST,
            tags: ['api', 'rest'],
        });
        
        // Start server only after successful MongoDB connection
        app.listen(PORT, HOST, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Initial connection attempt
connectWithRetry();

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
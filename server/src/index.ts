import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { appRouter, facebookRouter } from 'routes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://sellis:sellis@localhost:27017/guitar-app';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());

// Register routes with their respective prefixes
app.use('/api/app', appRouter);
app.use('/api/fb', facebookRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
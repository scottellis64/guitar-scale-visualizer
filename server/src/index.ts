import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { appRouter, facebookRouter } from './routes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// In-memory storage for reels (replace with database in production)
app.use(cors());
app.use(express.json());

// Register routes with their respective prefixes
app.use('/api/app', appRouter);
app.use('/api/fb', facebookRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
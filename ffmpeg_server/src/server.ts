import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRouter, conversionsRouter, youtubeRouter, facebookRouter } from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

// Register routes
app.use('/', healthRouter);
app.use('/', conversionsRouter);
app.use('/youtube', youtubeRouter);
app.use('/facebook', facebookRouter);

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
}); 
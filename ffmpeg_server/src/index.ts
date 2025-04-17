import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { healthRouter, conversionsRouter, youtubeRouter, facebookRouter } from './routes';
import { registerService } from './utils/consul';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.FFMPEG_PORT) || 3001;
const HOST = process.env.FFMPEG_HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

// Register routes
app.use('/', healthRouter);
app.use('/', conversionsRouter);
app.use('/youtube', youtubeRouter);
app.use('/facebook', facebookRouter);

// Register with Consul
registerService({
    name: 'ffmpeg_server',
    port: PORT,
    address: HOST,
    tags: ['ffmpeg', 'media'],
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
}); 
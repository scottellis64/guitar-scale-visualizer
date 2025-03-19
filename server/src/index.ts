import express, { Request, Response } from 'express';
import cors from 'cors';
import { Scale } from './types';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Sample endpoint
app.get('/api/scales', (req: Request, res: Response) => {
  const scales: Scale[] = [
    { id: 1, name: 'Major Scale', intervals: [0, 2, 4, 5, 7, 9, 11] },
    { id: 2, name: 'Minor Scale', intervals: [0, 2, 3, 5, 7, 8, 10] },
    { id: 3, name: 'Pentatonic Scale', intervals: [0, 2, 4, 7, 9] },
    { id: 4, name: 'Blues Scale', intervals: [0, 2, 3, 5, 7, 8, 10, 11] }
  ];
  
  res.json(scales);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 
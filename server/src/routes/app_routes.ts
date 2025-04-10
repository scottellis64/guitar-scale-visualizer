import { Router } from 'express';
import { Scale } from '@guitar-app/shared';

const router = Router();

router.get('/scales', (_req, res) => {
    const scales: Scale[] = [
        { id: '1', name: 'Major Scale', intervals: [0, 2, 4, 5, 7, 9, 11] },
        { id: '2', name: 'Minor Scale', intervals: [0, 2, 3, 5, 7, 8, 10] }
    ];
    res.json(scales);
});

export default router; 
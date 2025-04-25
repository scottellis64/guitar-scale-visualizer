import { Router } from 'express';
import facebookRoutes from './facebook';
import youtubeRoutes from './youtube';
import conversionRoutes from './conversion';
import healthRoutes from './health';

const router = Router();

// Register routes
router.use('/facebook', facebookRoutes);
router.use('/youtube', youtubeRoutes);
router.use('/conversion', conversionRoutes);
router.use('/health', healthRoutes);

export default router; 
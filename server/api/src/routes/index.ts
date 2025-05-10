import { Router } from 'express';
import authRoutes from './auth_routes';
import adminRoutes from './admin_routes';
import videoRoutes from './video_routes';
import audioRoutes from './audio_routes';
import healthRoutes from './health_routes';
import facebookRoutes from './facebook_routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/video', videoRoutes);
router.use('/audio', audioRoutes);
router.use('/health', healthRoutes);
router.use('/facebook', facebookRoutes);

export default router; 
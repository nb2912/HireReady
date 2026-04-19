import { Router } from 'express';
import aiRoutes from './aiRoutes';
import communityRoutes from './communityRoutes';
import growthRoutes from './growthRoutes';

const router = Router();

// AI Routes
router.use('/ai', aiRoutes);

// Community Routes
router.use('/community', communityRoutes);

// Growth Routes
router.use('/growth', growthRoutes);

export default router;
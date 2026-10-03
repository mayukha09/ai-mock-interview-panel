import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.ts';

const router = Router();

// GET /api/analytics
router.get('/', analyticsController.getAnalytics);

export default router;

import { Router } from 'express';
import { authController } from '../controllers/authController.ts';

const router = Router();

router.post('/login', authController.login);
router.get('/profile', authController.getProfile);
router.post('/profile', authController.updateProfile);

export default router;

import { Router } from 'express';
import { interviewController } from '../controllers/interviewController.ts';

const router = Router();

// POST /api/interview/start
router.post('/start', interviewController.startInterview);

// POST /api/interview/chat
router.post('/chat', interviewController.chat);

// GET /api/interview/:sessionId
router.get('/:sessionId', interviewController.getSession);

// POST /api/interview/end
router.post('/end', interviewController.endInterview);

// GET /api/interview/:sessionId/report
router.get('/:sessionId/report', interviewController.getReport);

export default router;

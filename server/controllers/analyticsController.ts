import type { Request, Response } from 'express';
import { interviewService } from '../services/interviewService.ts';

export const analyticsController = {
  getAnalytics(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string | undefined;
      const analytics = interviewService.getAnalytics(userId);
      return res.json(analytics);
    } catch (err: any) {
      console.error('[AnalyticsController] getAnalytics error:', err);
      return res.status(500).json({ error: 'Failed to retrieve analytics data' });
    }
  }
};

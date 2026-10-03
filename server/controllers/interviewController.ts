import type { Request, Response } from 'express';
import { interviewService } from '../services/interviewService.ts';
import { lyzrService } from '../services/lyzrService.ts';

export const interviewController = {
  async startInterview(req: Request, res: Response) {
    try {
      const {
        candidateName,
        email,
        role,
        experience,
        skills,
        interviewType,
        difficulty,
        questionCount,
        duration
      } = req.body;

      if (!candidateName || !email || !role) {
        return res.status(400).json({
          error: 'candidateName, email, and role are required fields.'
        });
      }

      const skillsList = Array.isArray(skills) 
        ? skills 
        : (typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : ['General Software Engineering']);

      const result = await interviewService.startInterview({
        candidateName: candidateName.trim(),
        email: email.trim().toLowerCase(),
        role: role.trim(),
        experience: experience || 'Fresher',
        skills: skillsList,
        interviewType: interviewType || 'Technical + Behavioral',
        difficulty: difficulty || 'Medium',
        questionCount: Number(questionCount) || 10,
        duration: Number(duration) || 15
      });

      return res.status(201).json({
        sessionId: result.sessionId,
        status: result.status,
        initialQuestion: result.initialQuestion,
        session: result.session
      });
    } catch (err: any) {
      console.error('[InterviewController] startInterview error:', err);
      return res.status(500).json({
        error: 'Unable to start interview session. Please try again.',
        details: err.message
      });
    }
  },

  async chat(req: Request, res: Response) {
    try {
      const { sessionId, message, userId } = req.body;

      if (!sessionId || message === undefined) {
        return res.status(400).json({
          error: 'sessionId and message are required.'
        });
      }

      if (typeof message === 'string' && message.trim().length === 0) {
        return res.status(400).json({
          error: 'Your answer cannot be empty. Please provide a response.'
        });
      }

      const result = await interviewService.processCandidateAnswer(
        sessionId,
        message,
        userId
      );

      return res.json({
        sessionId,
        response: result.aiResponse,
        currentQuestion: result.currentQuestion,
        totalQuestions: result.totalQuestions,
        isFollowUp: result.isFollowUp,
        isCompleted: result.isCompleted,
        source: result.source
      });
    } catch (err: any) {
      console.error('[InterviewController] chat error:', err);
      return res.status(500).json({
        error: 'Unable to connect to the AI interviewer. Please try again.',
        details: err.message
      });
    }
  },

  async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const details = interviewService.getSessionDetails(sessionId);

      if (!details) {
        return res.status(404).json({ error: 'Interview session not found' });
      }

      return res.json({
        sessionId: details.session.id,
        status: details.session.status,
        currentQuestion: details.session.currentQuestion,
        questionCount: details.session.questionCount,
        role: details.session.role,
        experience: details.session.experience,
        skills: details.session.skills,
        interviewType: details.session.interviewType,
        difficulty: details.session.difficulty,
        duration: details.session.duration,
        startedAt: details.session.startedAt,
        completedAt: details.session.completedAt,
        overallScore: details.session.overallScore,
        candidate: details.candidate,
        messages: details.messages,
        evaluation: details.evaluation
      });
    } catch (err: any) {
      console.error('[InterviewController] getSession error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async endInterview(req: Request, res: Response) {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required to end interview' });
      }

      const result = await interviewService.endInterview(sessionId);
      return res.json({
        message: 'Interview completed successfully',
        session: result.session,
        evaluation: result.evaluation
      });
    } catch (err: any) {
      console.error('[InterviewController] endInterview error:', err);
      return res.status(500).json({
        error: 'Failed to finalize interview evaluation. Please try again.',
        details: err.message
      });
    }
  },

  async getReport(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const report = interviewService.getSessionReport(sessionId);

      if (!report) {
        return res.status(404).json({ error: 'Interview report not found.' });
      }

      return res.json(report);
    } catch (err: any) {
      console.error('[InterviewController] getReport error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async listInterviews(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string | undefined;
      const sessions = interviewService.getInterviews(userId);
      return res.json(sessions);
    } catch (err: any) {
      console.error('[InterviewController] listInterviews error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async testLyzr(req: Request, res: Response) {
    try {
      const status = await lyzrService.testConnection();
      return res.json(status);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
};

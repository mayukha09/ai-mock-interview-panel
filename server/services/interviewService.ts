import { dbService } from '../database/db.ts';
import { lyzrService } from './lyzrService.ts';
import { evaluationService } from './evaluationService.ts';
import type { 
  StartInterviewRequest, 
  InterviewSession, 
  Message, 
  Evaluation,
  AnalyticsSummary 
} from '../models/types.ts';

export class InterviewService {
  /**
   * Start a new AI interview session
   */
  async startInterview(req: StartInterviewRequest): Promise<{
    sessionId: string;
    status: string;
    initialQuestion: string;
    session: InterviewSession;
  }> {
    // 1. Get or create user
    let user = dbService.getUserByEmail(req.email);
    if (!user) {
      user = {
        id: 'usr_' + Math.random().toString(36).substring(2, 10),
        name: req.candidateName,
        email: req.email,
        createdAt: new Date().toISOString()
      };
      dbService.createUser(user);
    }

    // 2. Upsert candidate profile
    dbService.upsertProfile({
      id: 'prof_' + user.id,
      userId: user.id,
      role: req.role,
      experience: req.experience,
      skills: req.skills,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 3. Create interview session
    const sessionId = `session_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    const newSession: InterviewSession = {
      id: sessionId,
      userId: user.id,
      role: req.role,
      experience: req.experience,
      skills: req.skills,
      interviewType: req.interviewType,
      difficulty: req.difficulty,
      questionCount: req.questionCount || 10,
      duration: req.duration || 15,
      currentQuestion: 1,
      status: 'started',
      startedAt: new Date().toISOString(),
      completedAt: null,
      overallScore: null
    };

    dbService.createSession(newSession);

    // 4. Send initial prompt to Lyzr Agent
    const initialInstruction = `You are conducting a mock interview for a ${req.role} (${req.experience} level).
The interview type is ${req.interviewType}.
Difficulty level is ${req.difficulty}.
There are ${req.questionCount} questions in total.
Primary skills being evaluated: ${req.skills.join(', ')}.

Instructions:
1. Greet the candidate ${req.candidateName} warmly and introduce the interview format.
2. Ask Question 1 clearly and concisely.
3. Ask ONLY one question at a time. Do not ask multiple questions at once.`;

    const lyzrRes = await lyzrService.sendMessage(
      req.email,
      sessionId,
      initialInstruction,
      `Starting ${req.interviewType} interview for ${req.candidateName} as ${req.role}`
    );

    const questionText = lyzrRes.message || `Welcome ${req.candidateName} to your ${req.role} interview! Let's kick off with Question 1: Could you briefly introduce yourself and describe a core project where you applied ${req.skills[0] || 'your technical skills'}?`;

    // 5. Save the interviewer's first question message
    dbService.addMessage({
      id: `msg_${sessionId}_q1_${Date.now()}`,
      sessionId: sessionId,
      sender: 'interviewer',
      message: questionText,
      questionNumber: 1,
      timestamp: new Date().toISOString()
    });

    return {
      sessionId,
      status: 'started',
      initialQuestion: questionText,
      session: newSession
    };
  }

  /**
   * Handle candidate answer and obtain adaptive follow-up or next question
   */
  async processCandidateAnswer(
    sessionId: string,
    candidateAnswer: string,
    userId?: string
  ): Promise<{
    aiResponse: string;
    currentQuestion: number;
    totalQuestions: number;
    isFollowUp: boolean;
    isCompleted: boolean;
    source: string;
  }> {
    const session = dbService.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Interview session '${sessionId}' not found.`);
    }

    if (session.status === 'completed') {
      throw new Error('This interview session is already completed.');
    }

    if (!candidateAnswer || candidateAnswer.trim().length === 0) {
      throw new Error('Candidate answer cannot be empty.');
    }

    const currentQNum = session.currentQuestion;

    // 1. Store candidate answer message
    dbService.addMessage({
      id: `msg_${sessionId}_c_${Date.now()}`,
      sessionId,
      sender: 'candidate',
      message: candidateAnswer.trim(),
      questionNumber: currentQNum,
      timestamp: new Date().toISOString()
    });

    // 2. Fetch history messages for context
    const messages = dbService.getMessagesBySessionId(sessionId);
    const candidateAnswersForQ = messages.filter(
      m => m.sender === 'candidate' && m.questionNumber === currentQNum
    );

    // If candidate has only answered once for this question and answer is short or deserves deeper probe,
    // it could be a follow-up. If it's a follow-up answer or answer is thorough, advance question number!
    const needsFollowUp = candidateAnswersForQ.length === 1 && candidateAnswer.trim().split(/\s+/).length < 25;
    
    let nextQNum = currentQNum;
    let isFollowUp = false;

    if (needsFollowUp) {
      isFollowUp = true;
    } else {
      nextQNum = Math.min(session.questionCount, currentQNum + 1);
    }

    // 3. Build adaptive prompt context for Lyzr Agent
    const promptContext = `Interview Context: Role: ${session.role} (${session.experience}), Type: ${session.interviewType}, Difficulty: ${session.difficulty}.
Current Question #${currentQNum} of ${session.questionCount}.
Candidate just submitted this answer: "${candidateAnswer.trim()}".
Task:
${isFollowUp 
  ? `Analyze their answer for completeness. Ask a specific, adaptive follow-up question to probe deeper into what they missed or clarify their approach.` 
  : `Acknowledge their answer briefly. Then present Question #${nextQNum} focusing on: ${session.skills[(nextQNum - 1) % session.skills.length] || session.role}. Keep it direct and professional.`}
Ask ONLY one question.`;

    const userEmail = userId || (dbService.getUserById(session.userId)?.email) || 'candidate@demo.com';

    const lyzrRes = await lyzrService.sendMessage(
      userEmail,
      sessionId,
      candidateAnswer.trim(),
      promptContext
    );

    // 4. Store interviewer response message
    dbService.addMessage({
      id: `msg_${sessionId}_i_${Date.now()}`,
      sessionId,
      sender: 'interviewer',
      message: lyzrRes.message,
      questionNumber: isFollowUp ? currentQNum : nextQNum,
      timestamp: new Date().toISOString()
    });

    // 5. Update session in DB
    const isCompleted = !isFollowUp && currentQNum >= session.questionCount;
    dbService.updateSession(sessionId, {
      currentQuestion: isFollowUp ? currentQNum : nextQNum,
      status: isCompleted ? 'completed' : 'started'
    });

    return {
      aiResponse: lyzrRes.message,
      currentQuestion: isFollowUp ? currentQNum : nextQNum,
      totalQuestions: session.questionCount,
      isFollowUp,
      isCompleted,
      source: lyzrRes.source
    };
  }

  /**
   * End interview session and trigger comprehensive AI evaluation
   */
  async endInterview(sessionId: string): Promise<{
    session: InterviewSession;
    evaluation: Evaluation;
  }> {
    const session = dbService.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Interview session '${sessionId}' not found.`);
    }

    const messages = dbService.getMessagesBySessionId(sessionId);
    
    // Check if evaluation already exists
    let evaluation = dbService.getEvaluationBySessionId(sessionId);
    if (!evaluation) {
      evaluation = await evaluationService.generateEvaluation(session, messages);
      dbService.createEvaluation(evaluation);
    }

    // Update session record
    dbService.updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      overallScore: evaluation.overallScore
    });

    const updatedSession = dbService.getSessionById(sessionId)!;
    return {
      session: updatedSession,
      evaluation
    };
  }

  /**
   * Get full details for an interview session
   */
  getSessionDetails(sessionId: string) {
    const session = dbService.getSessionById(sessionId);
    if (!session) return null;

    const user = dbService.getUserById(session.userId);
    const profile = dbService.getProfileByUserId(session.userId);
    const messages = dbService.getMessagesBySessionId(sessionId);
    const evaluation = dbService.getEvaluationBySessionId(sessionId);

    return {
      session,
      candidate: {
        name: user?.name || 'Candidate',
        email: user?.email || '',
        role: profile?.role || session.role,
        experience: profile?.experience || session.experience,
        skills: profile?.skills || session.skills
      },
      messages,
      evaluation
    };
  }

  /**
   * Get full report for a session
   */
  getSessionReport(sessionId: string) {
    const details = this.getSessionDetails(sessionId);
    if (!details) return null;

    return {
      session: details.session,
      candidate: details.candidate,
      evaluation: details.evaluation,
      transcript: details.messages
    };
  }

  /**
   * List all previous interviews for a user or all
   */
  getInterviews(userId?: string): InterviewSession[] {
    if (userId) {
      return dbService.getSessionsByUserId(userId);
    }
    return dbService.getAllSessions();
  }

  /**
   * Aggregate performance analytics
   */
  getAnalytics(userId?: string): AnalyticsSummary {
    const sessions = (userId ? dbService.getSessionsByUserId(userId) : dbService.getAllSessions())
      .filter(s => s.status === 'completed' && s.overallScore != null);

    if (sessions.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        bestScore: 0,
        latestScore: 0,
        performanceOverTime: [],
        skillPerformance: [],
        technicalAverage: 0,
        communicationAverage: 0,
        problemSolvingAverage: 0
      };
    }

    const scores = sessions.map(s => s.overallScore as number);
    const totalInterviews = sessions.length;
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalInterviews);
    const bestScore = Math.max(...scores);
    const latestScore = scores[0];

    const performanceOverTime = [...sessions]
      .reverse()
      .map(s => ({
        date: new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: s.overallScore || 0,
        role: s.role
      }));

    // Aggregate evaluations for skills & category averages
    const evaluations: Evaluation[] = [];
    for (const s of sessions) {
      const ev = dbService.getEvaluationBySessionId(s.id);
      if (ev) evaluations.push(ev);
    }

    const technicalAvg = evaluations.length > 0 
      ? Math.round((evaluations.reduce((a, e) => a + e.technicalAccuracy, 0) / evaluations.length) * 10)
      : 80;
    const commAvg = evaluations.length > 0 
      ? Math.round((evaluations.reduce((a, e) => a + e.communication, 0) / evaluations.length) * 10)
      : 85;
    const problemAvg = evaluations.length > 0 
      ? Math.round((evaluations.reduce((a, e) => a + e.problemSolving, 0) / evaluations.length) * 10)
      : 82;

    const skillCounts: Record<string, { total: number; count: number }> = {};
    for (const s of sessions) {
      for (const skill of s.skills) {
        if (!skillCounts[skill]) skillCounts[skill] = { total: 0, count: 0 };
        skillCounts[skill].total += s.overallScore || 75;
        skillCounts[skill].count += 1;
      }
    }

    const skillPerformance = Object.keys(skillCounts).map(skill => ({
      skill,
      score: Math.round(skillCounts[skill].total / skillCounts[skill].count)
    }));

    return {
      totalInterviews,
      averageScore,
      bestScore,
      latestScore,
      performanceOverTime,
      skillPerformance: skillPerformance.length > 0 ? skillPerformance : [
        { skill: 'Python', score: 85 },
        { skill: 'SQL', score: 78 },
        { skill: 'JavaScript', score: 88 },
        { skill: 'System Design', score: 72 }
      ],
      technicalAverage: technicalAvg,
      communicationAverage: commAvg,
      problemSolvingAverage: problemAvg
    };
  }
}

export const interviewService = new InterviewService();

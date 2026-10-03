export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  role: string;
  experience: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export type InterviewType = 
  | 'Technical' 
  | 'Behavioral' 
  | 'HR' 
  | 'System Design' 
  | 'Domain Specific' 
  | 'Technical + Behavioral';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type InterviewStatus = 'pending' | 'started' | 'completed' | 'terminated';

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  experience: string;
  skills: string[];
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  questionCount: number;
  duration: number; // in minutes
  currentQuestion: number;
  status: InterviewStatus;
  startedAt: string;
  completedAt?: string | null;
  overallScore?: number | null;
}

export interface Message {
  id: string;
  sessionId: string;
  sender: 'interviewer' | 'candidate' | 'system';
  message: string;
  questionNumber: number;
  timestamp: string;
}

export interface Evaluation {
  id: string;
  sessionId: string;
  technicalAccuracy: number; // 1-10
  problemSolving: number; // 1-10
  communication: number; // 1-10
  answerQuality: number; // 1-10
  completeness: number; // 1-10
  confidence: number; // 1-10
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  recommendations: string[];
}

export interface StartInterviewRequest {
  candidateName: string;
  email: string;
  role: string;
  experience: string;
  skills: string[];
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  questionCount: number;
  duration: number;
}

export interface ChatRequest {
  sessionId: string;
  userId?: string;
  message: string;
}

export interface LyzrChatPayload {
  user_id: string;
  agent_id: string;
  session_id: string;
  message: string;
}

export interface AnalyticsSummary {
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  latestScore: number;
  performanceOverTime: Array<{ date: string; score: number; role: string }>;
  skillPerformance: Array<{ skill: string; score: number }>;
  technicalAverage: number;
  communicationAverage: number;
  problemSolvingAverage: number;
}

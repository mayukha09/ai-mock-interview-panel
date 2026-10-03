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

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  experience: string;
  skills: string[];
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  questionCount: number;
  duration: number;
  currentQuestion: number;
  status: 'pending' | 'started' | 'completed' | 'terminated';
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
  technicalAccuracy: number;
  problemSolving: number;
  communication: number;
  answerQuality: number;
  completeness: number;
  confidence: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  recommendations: string[];
}

export interface InterviewReport {
  session: InterviewSession;
  candidate: {
    name: string;
    email: string;
    role: string;
    experience: string;
    skills: string[];
  };
  evaluation: Evaluation;
  transcript: Message[];
}

export interface AnalyticsData {
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

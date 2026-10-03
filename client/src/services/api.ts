import type { 
  InterviewSession, 
  InterviewReport, 
  AnalyticsData, 
  User, 
  CandidateProfile, 
  InterviewType, 
  DifficultyLevel 
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  async startInterview(data: {
    candidateName: string;
    email: string;
    role: string;
    experience: string;
    skills: string[];
    interviewType: InterviewType;
    difficulty: DifficultyLevel;
    questionCount: number;
    duration: number;
  }): Promise<{
    sessionId: string;
    status: string;
    initialQuestion: string;
    session: InterviewSession;
  }> {
    const res = await fetch(`${API_BASE}/interview/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to initialize AI interview');
    }
    return res.json();
  },

  async sendAnswer(sessionId: string, message: string, userId?: string): Promise<{
    sessionId: string;
    response: string;
    currentQuestion: number;
    totalQuestions: number;
    isFollowUp: boolean;
    isCompleted: boolean;
    source: string;
  }> {
    const res = await fetch(`${API_BASE}/interview/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message, userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit candidate response to Lyzr Agent');
    }
    return res.json();
  },

  async getSession(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/interview/${sessionId}`);
    if (!res.ok) throw new Error('Failed to load session details');
    return res.json();
  },

  async endInterview(sessionId: string): Promise<{
    message: string;
    session: InterviewSession;
    evaluation: any;
  }> {
    const res = await fetch(`${API_BASE}/interview/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to finalize interview evaluation');
    }
    return res.json();
  },

  async getReport(sessionId: string): Promise<InterviewReport> {
    const res = await fetch(`${API_BASE}/interview/${sessionId}/report`);
    if (!res.ok) throw new Error('Interview report not found');
    return res.json();
  },

  async getInterviews(userId?: string): Promise<InterviewSession[]> {
    const url = userId ? `${API_BASE}/interviews?userId=${encodeURIComponent(userId)}` : `${API_BASE}/interviews`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch interview history');
    return res.json();
  },

  async getAnalytics(userId?: string): Promise<AnalyticsData> {
    const url = userId ? `${API_BASE}/analytics?userId=${encodeURIComponent(userId)}` : `${API_BASE}/analytics`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch performance analytics');
    return res.json();
  },

  async login(email: string, name?: string): Promise<{ user: User; profile: CandidateProfile }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    if (!res.ok) throw new Error('Authentication failed');
    return res.json();
  },

  async getProfile(email?: string): Promise<{ user: User; profile: CandidateProfile }> {
    const url = email ? `${API_BASE}/auth/profile?email=${encodeURIComponent(email)}` : `${API_BASE}/auth/profile`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateProfile(userId: string, data: Partial<CandidateProfile>): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data })
    });
    if (!res.ok) throw new Error('Failed to update candidate profile');
    return res.json();
  },

  async checkHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }
};

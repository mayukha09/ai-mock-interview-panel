import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import type { 
  User, 
  CandidateProfile, 
  InterviewSession, 
  Message, 
  Evaluation 
} from '../models/types.ts';

// Ensure data directory exists
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, 'interview.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency
db.exec('PRAGMA journal_mode = WAL;');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS candidate_profiles (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    role TEXT NOT NULL,
    experience TEXT NOT NULL,
    skills TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS interview_sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    role TEXT NOT NULL,
    experience TEXT NOT NULL,
    skills TEXT NOT NULL,
    interviewType TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    questionCount INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    currentQuestion INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending',
    startedAt TEXT NOT NULL,
    completedAt TEXT,
    overallScore INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    questionNumber INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(sessionId) REFERENCES interview_sessions(id)
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id TEXT PRIMARY KEY,
    sessionId TEXT UNIQUE NOT NULL,
    technicalAccuracy INTEGER NOT NULL,
    problemSolving INTEGER NOT NULL,
    communication INTEGER NOT NULL,
    answerQuality INTEGER NOT NULL,
    completeness INTEGER NOT NULL,
    confidence INTEGER NOT NULL,
    overallScore INTEGER NOT NULL,
    strengths TEXT NOT NULL,
    weaknesses TEXT NOT NULL,
    skillGaps TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    FOREIGN KEY(sessionId) REFERENCES interview_sessions(id)
  );
`);

// Database Helper methods
export const dbService = {
  // Users
  getUserByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    return stmt.get(email) as User | undefined;
  },

  getUserById(id: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  },

  createUser(user: User): User {
    const stmt = db.prepare('INSERT INTO users (id, name, email, createdAt) VALUES (?, ?, ?, ?)');
    stmt.run(user.id, user.name, user.email, user.createdAt);
    return user;
  },

  // Profiles
  getProfileByUserId(userId: string): CandidateProfile | undefined {
    const stmt = db.prepare('SELECT * FROM candidate_profiles WHERE userId = ?');
    const row = stmt.get(userId) as any;
    if (!row) return undefined;
    return {
      ...row,
      skills: JSON.parse(row.skills || '[]')
    };
  },

  upsertProfile(profile: CandidateProfile): CandidateProfile {
    const existing = dbService.getProfileByUserId(profile.userId);
    const skillsJson = JSON.stringify(profile.skills);
    if (existing) {
      const stmt = db.prepare(
        'UPDATE candidate_profiles SET role = ?, experience = ?, skills = ?, updatedAt = ? WHERE userId = ?'
      );
      stmt.run(profile.role, profile.experience, skillsJson, profile.updatedAt, profile.userId);
    } else {
      const stmt = db.prepare(
        'INSERT INTO candidate_profiles (id, userId, role, experience, skills, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.run(profile.id, profile.userId, profile.role, profile.experience, skillsJson, profile.createdAt, profile.updatedAt);
    }
    return profile;
  },

  // Interview Sessions
  createSession(session: InterviewSession): InterviewSession {
    const stmt = db.prepare(`
      INSERT INTO interview_sessions 
      (id, userId, role, experience, skills, interviewType, difficulty, questionCount, duration, currentQuestion, status, startedAt, completedAt, overallScore)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.id,
      session.userId,
      session.role,
      session.experience,
      JSON.stringify(session.skills),
      session.interviewType,
      session.difficulty,
      session.questionCount,
      session.duration,
      session.currentQuestion,
      session.status,
      session.startedAt,
      session.completedAt || null,
      session.overallScore || null
    );
    return session;
  },

  getSessionById(sessionId: string): InterviewSession | undefined {
    const stmt = db.prepare('SELECT * FROM interview_sessions WHERE id = ?');
    const row = stmt.get(sessionId) as any;
    if (!row) return undefined;
    return {
      ...row,
      skills: JSON.parse(row.skills || '[]')
    };
  },

  updateSession(sessionId: string, updates: Partial<InterviewSession>): void {
    const session = dbService.getSessionById(sessionId);
    if (!session) return;
    const merged = { ...session, ...updates };
    const stmt = db.prepare(`
      UPDATE interview_sessions
      SET currentQuestion = ?, status = ?, completedAt = ?, overallScore = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.currentQuestion,
      merged.status,
      merged.completedAt || null,
      merged.overallScore ?? null,
      sessionId
    );
  },

  getSessionsByUserId(userId: string): InterviewSession[] {
    const stmt = db.prepare('SELECT * FROM interview_sessions WHERE userId = ? ORDER BY startedAt DESC');
    const rows = stmt.all(userId) as any[];
    return rows.map(r => ({
      ...r,
      skills: JSON.parse(r.skills || '[]')
    }));
  },

  getAllSessions(): InterviewSession[] {
    const stmt = db.prepare('SELECT * FROM interview_sessions ORDER BY startedAt DESC');
    const rows = stmt.all() as any[];
    return rows.map(r => ({
      ...r,
      skills: JSON.parse(r.skills || '[]')
    }));
  },

  // Messages
  addMessage(msg: Message): Message {
    const stmt = db.prepare('INSERT INTO messages (id, sessionId, sender, message, questionNumber, timestamp) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(msg.id, msg.sessionId, msg.sender, msg.message, msg.questionNumber, msg.timestamp);
    return msg;
  },

  getMessagesBySessionId(sessionId: string): Message[] {
    const stmt = db.prepare('SELECT * FROM messages WHERE sessionId = ? ORDER BY timestamp ASC');
    return stmt.all(sessionId) as unknown as Message[];
  },

  // Evaluations
  createEvaluation(ev: Evaluation): Evaluation {
    const stmt = db.prepare(`
      INSERT INTO evaluations 
      (id, sessionId, technicalAccuracy, problemSolving, communication, answerQuality, completeness, confidence, overallScore, strengths, weaknesses, skillGaps, recommendations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      ev.id,
      ev.sessionId,
      ev.technicalAccuracy,
      ev.problemSolving,
      ev.communication,
      ev.answerQuality,
      ev.completeness,
      ev.confidence,
      ev.overallScore,
      JSON.stringify(ev.strengths),
      JSON.stringify(ev.weaknesses),
      JSON.stringify(ev.skillGaps),
      JSON.stringify(ev.recommendations)
    );
    return ev;
  },

  getEvaluationBySessionId(sessionId: string): Evaluation | undefined {
    const stmt = db.prepare('SELECT * FROM evaluations WHERE sessionId = ?');
    const row = stmt.get(sessionId) as any;
    if (!row) return undefined;
    return {
      ...row,
      strengths: JSON.parse(row.strengths || '[]'),
      weaknesses: JSON.parse(row.weaknesses || '[]'),
      skillGaps: JSON.parse(row.skillGaps || '[]'),
      recommendations: JSON.parse(row.recommendations || '[]')
    };
  }
};

// Seed demo data if database is fresh
function seedDemoData() {
  const defaultEmail = 'mayukhatokala@gmail.com';
  let demoUser = dbService.getUserByEmail(defaultEmail);
  if (!demoUser) {
    demoUser = {
      id: 'user_demo_mayukha',
      name: 'Mayukha',
      email: defaultEmail,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
    };
    dbService.createUser(demoUser);

    dbService.upsertProfile({
      id: 'profile_demo_mayukha',
      userId: demoUser.id,
      role: 'Software Developer',
      experience: 'Fresher',
      skills: ['Python', 'SQL', 'JavaScript', 'HTML', 'CSS', 'Java'],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Seed 2 realistic previous interview sessions and evaluations for history & analytics
    const pastSessions = [
      {
        id: 'session_demo_hist_1',
        userId: demoUser.id,
        role: 'Software Developer',
        experience: 'Fresher',
        skills: ['Python', 'SQL', 'JavaScript'],
        interviewType: 'Technical + Behavioral' as const,
        difficulty: 'Medium' as const,
        questionCount: 10,
        duration: 15,
        currentQuestion: 10,
        status: 'completed' as const,
        startedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 86400000 + 14 * 60000).toISOString(),
        overallScore: 82
      },
      {
        id: 'session_demo_hist_2',
        userId: demoUser.id,
        role: 'Full Stack Engineer',
        experience: 'Fresher',
        skills: ['JavaScript', 'React', 'Node.js'],
        interviewType: 'Technical' as const,
        difficulty: 'Medium' as const,
        questionCount: 8,
        duration: 15,
        currentQuestion: 8,
        status: 'completed' as const,
        startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 86400000 + 13 * 60000).toISOString(),
        overallScore: 88
      }
    ];

    for (const s of pastSessions) {
      dbService.createSession(s);
    }

    // Evaluation 1
    dbService.createEvaluation({
      id: 'eval_demo_1',
      sessionId: 'session_demo_hist_1',
      technicalAccuracy: 8,
      problemSolving: 8,
      communication: 9,
      answerQuality: 8,
      completeness: 7,
      confidence: 8,
      overallScore: 82,
      strengths: [
        'Strong Python data structure fundamentals (lists vs tuples)',
        'Clear and articulate communication of behavioral situations',
        'Quick adaptation when challenged on edge cases'
      ],
      weaknesses: [
        'Needs deeper familiarity with database indexing and query optimization',
        'Could be more specific when explaining time complexity tradeoffs'
      ],
      skillGaps: [
        'Advanced SQL Joins & Window Functions',
        'System Design Fundamentals'
      ],
      recommendations: [
        'Practice complex SQL schema design and normalization edge cases',
        'Structure algorithmic explanations using the STAR technique',
        'Review concurrency primitives in Python'
      ]
    });

    // Messages for Session 1
    dbService.addMessage({
      id: 'msg_demo_1_1',
      sessionId: 'session_demo_hist_1',
      sender: 'interviewer',
      message: 'Welcome Mayukha! Let\'s begin with Python. Can you explain the difference between a list and a tuple in Python?',
      questionNumber: 1,
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
    });
    dbService.addMessage({
      id: 'msg_demo_1_2',
      sessionId: 'session_demo_hist_1',
      sender: 'candidate',
      message: 'A list is mutable, meaning its elements can be changed, while a tuple is immutable. Lists use square brackets and tuples use parentheses.',
      questionNumber: 1,
      timestamp: new Date(Date.now() - 5 * 86400000 + 30000).toISOString()
    });
    dbService.addMessage({
      id: 'msg_demo_1_3',
      sessionId: 'session_demo_hist_1',
      sender: 'interviewer',
      message: 'Good explanation. When would you prefer using a tuple over a list in a real-world scenario?',
      questionNumber: 1,
      timestamp: new Date(Date.now() - 5 * 86400000 + 45000).toISOString()
    });
    dbService.addMessage({
      id: 'msg_demo_1_4',
      sessionId: 'session_demo_hist_1',
      sender: 'candidate',
      message: 'I would use a tuple for fixed configuration data, geographic coordinates, or dictionary keys where immutability prevents accidental mutations and provides memory efficiency.',
      questionNumber: 1,
      timestamp: new Date(Date.now() - 5 * 86400000 + 75000).toISOString()
    });

    // Evaluation 2
    dbService.createEvaluation({
      id: 'eval_demo_2',
      sessionId: 'session_demo_hist_2',
      technicalAccuracy: 9,
      problemSolving: 9,
      communication: 9,
      answerQuality: 9,
      completeness: 8,
      confidence: 9,
      overallScore: 88,
      strengths: [
        'Exemplary explanation of JavaScript Event Loop and Promises',
        'Deep understanding of React virtual DOM reconciliation',
        'High composure and structured thought process'
      ],
      weaknesses: [
        'Could elaborate further on server-side rendering caching strategies'
      ],
      skillGaps: [
        'Distributed Caching (Redis)',
        'CI/CD Pipeline Design'
      ],
      recommendations: [
        'Explore micro-frontends and state synchronization patterns',
        'Continue building production full-stack portfolio applications'
      ]
    });
  }
}

seedDemoData();

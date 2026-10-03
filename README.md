# 🎙️ AI Mock Interview Panel

An **AI-Powered Adaptive Mock Interview Platform** built for hackathon demonstrations. The system simulates realistic, multi-turn technical and behavioral interviews using **Lyzr Agent Studio**, dynamically adapts questions based on candidate answers, performs speech-to-text / text-to-speech voice interviewing, and produces structured competency evaluations and downloadable dossiers.

---

## 🌟 Key Features

1. **Lyzr Agent Multi-Turn Integration**
   - Connects directly to Lyzr Agent (`agent_id: 6ac0c944b9fb570e2390c041`) via REST API.
   - Maintains a consistent `session_id` across all turns for coherent conversation history.
   - Never exposes secret API keys to the browser client.

2. **Adaptive Follow-up Behavior**
   - Evaluates the depth, accuracy, and completeness of candidate answers in real time.
   - If an answer is weak or superficial: instantly challenges with a targeted clarifying follow-up question.
   - If an answer is thorough: praises precision and increases complexity or shifts to practical architectural scenarios.

3. **Multi-Modal Voice Support**
   - **Speech-to-Text**: Real-time microphone audio transcription with animated audio visualizer waves.
   - **Text-to-Speech**: AI Interviewer questions can be spoken aloud via browser speech synthesis.
   - **Graceful Fallback**: Fully functional on text input if speech recognition is unavailable.

4. **Structured AI Evaluation Dossier**
   - Evaluates:
     - Technical Accuracy (1–10)
     - Problem Solving (1–10)
     - Communication (1–10)
     - Answer Quality (1–10)
     - Completeness (1–10)
     - Confidence (1–10)
     - Overall Score (0–100%)
   - Generates specific **Strengths**, **Areas for Improvement**, **Skill Gaps**, and **Personalized Recommendations**.
   - Printable & PDF export-ready candidate report dossier.

5. **Performance Intelligence & Analytics**
   - Aggregates performance over time.
   - Skill proficiency bars by topic (e.g. Python, SQL, JavaScript, React).
   - Core pillar averages (Technical, Communication, Problem Solving).

6. **Interactive Candidate Experience**
   - Demo candidate profile preloaded (**Mayukha**, Software Developer Fresher).
   - 6 supported interview tracks: *Technical*, *Behavioral*, *HR*, *System Design*, *Domain Specific*, *Technical + Behavioral*.
   - Live timer with visual countdown alerts.

---

## 🏗️ Technology Stack & Architecture

```
React Frontend (Vite / Standalone SPA)
          │
          ▼  (REST API: /api/interview/*)
Express Backend (Node.js 22 + TypeScript)
          │
          ├── SQLite Database (node:sqlite / interview.db)
          │
          ▼  (POST /v3/inference/chat/)
Lyzr Agent Studio (agent_id: 6ac0c944b9fb570e2390c041)
          │
          ▼
Adaptive AI Response & Evaluation Engine
```

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts / Canvas SVG visualizers, Web Speech API.
- **Backend**: Node.js 22, Express REST APIs, TypeScript.
- **AI Agent**: Lyzr Agent API (`https://agent-prod.studio.lyzr.ai/v3/inference/chat/`) with resilient adaptive fallback engine.
- **Database**: SQLite (Node 22 native `node:sqlite` DatabaseSync) with preloaded demo historical records.

---

## 📁 Project Structure

```
ai-mock-interview-panel/
├── .env                  # Environment variables with Lyzr API key
├── .env.example          # Environment template
├── .gitignore
├── package.json          # Root scripts and server dependencies
├── tsconfig.json         # TypeScript configuration
├── test-api.ts           # Automated integration test suite
│
├── server/
│   ├── index.ts          # Express application entrypoint
│   ├── database/
│   │   └── db.ts         # SQLite schema, tables & demo data
│   ├── models/
│   │   └── types.ts      # TypeScript interfaces & types
│   ├── services/
│   │   ├── lyzrService.ts        # Lyzr Agent API client with adaptive fallback
│   │   ├── interviewService.ts   # Session & conversation orchestration
│   │   └── evaluationService.ts  # Structured competency scoring engine
│   ├── controllers/
│   │   ├── interviewController.ts
│   │   ├── analyticsController.ts
│   │   └── authController.ts
│   ├── routes/
│   │   ├── interviewRoutes.ts
│   │   ├── analyticsRoutes.ts
│   │   └── authRoutes.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   └── utils/
│       ├── httpHelper.ts
│       ├── loadEnv.ts
│       └── miniExpress.ts
│
├── client/               # Modular React + TypeScript Vite project
│   ├── src/
│   │   ├── components/   # Navbar, ScoreGauge, AudioVisualizer, TranscriptCard
│   │   ├── pages/        # 10 dedicated pages (Landing, Room, Results, Analytics, etc.)
│   │   ├── hooks/        # useVoice (SpeechRecognition & SpeechSynthesis)
│   │   ├── services/     # api.ts
│   │   └── types/        # index.ts
│   ├── package.json
│   └── vite.config.ts
│
└── public/
    ├── index.html        # Production SPA entry
    └── app.js            # Standalone browser bundle (works out of the box!)
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Lyzr Agent API Credentials
LYZR_API_KEY=sk-default-zp7Mctp1WfzU8WzzpeVKH4YYVCvfLRKy
LYZR_AGENT_ID=6ac0c944b9fb570e2390c041
LYZR_API_URL=https://agent-prod.studio.lyzr.ai/v3/inference/chat/

# Server Settings
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/interview.db
```

> **Security Note**: The Lyzr API Key is strictly server-side. It is never transmitted to the browser or stored in `localStorage`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (Node.js 22 recommended)
- **npm** v9+

### 2. Installation
Clone the repository and install root dependencies:

```bash
git clone <repository_url>
cd ai-mock-interview-panel
npm install
```

### 3. Start the Full-Stack Application
You can run the full-stack server directly using Node 22:

```bash
npm start
```
*(Or `node --experimental-strip-types server/index.ts`)*

Open your browser to:
👉 **`http://localhost:5000`**

The server will automatically:
1. Initialize the SQLite database at `./data/interview.db`.
2. Seed initial profile and historical session data for demo user **Mayukha**.
3. Serve the interactive React frontend SPA.
4. Mount all REST API endpoints under `/api/*`.

---

## 🧪 Testing the Lyzr Connection & API Endpoints

A complete automated validation test suite is included:

```bash
npm test
```
*(Or `node --experimental-strip-types test-api.ts`)*

The test suite validates:
1. Health check & Lyzr Agent configuration (`agent_id: 6ac0c944b9fb570e2390c041`).
2. Analytics aggregation (performance timeline, average score, skill breakdown).
3. Interview history retrieval.
4. Starting an interview with role, experience, and custom skills.
5. Adaptive chat response generation (evaluates candidate answer completeness).
6. Interview finalization and structured JSON evaluation generation.
7. Report retrieval with verbatim dialogue transcript.
8. Candidate profile updates.
9. Static frontend serving.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/interview/start` | Creates a new session & fetches initial AI question |
| `POST` | `/api/interview/chat` | Submits candidate answer & receives adaptive follow-up |
| `GET` | `/api/interview/:sessionId` | Retrieves live session details and transcript |
| `POST` | `/api/interview/end` | Finalizes interview & triggers structured scoring |
| `GET` | `/api/interview/:sessionId/report` | Returns full candidate report, scores, and transcript |
| `GET` | `/api/interviews` | Lists past interview sessions |
| `GET` | `/api/analytics` | Aggregates candidate performance metrics & skills |
| `GET` | `/api/health` | Lyzr Agent status & database health check |
| `POST` | `/api/auth/login` | Email-based session authentication |
| `GET/POST` | `/api/profile` | Fetches or updates candidate target role and skills |

---

## 💡 Lyzr Agent Request Structure

The backend makes the following request to Lyzr Agent:

```http
POST https://agent-prod.studio.lyzr.ai/v3/inference/chat/
Content-Type: application/json
x-api-key: <LYZR_API_KEY>

{
  "user_id": "mayukhatokala@gmail.com",
  "agent_id": "6ac0c944b9fb570e2390c041",
  "session_id": "<unique_session_id>",
  "message": "<candidate_answer_or_setup_prompt>"
}
```

---

## 🏆 Hackathon Demonstration Flow

1. **Landing Page**: View value proposition, supported interview tracks, and key features.
2. **Dashboard**: View candidate **Mayukha**, review historical scores (88% latest, 85% average), and inspect priority skill gaps.
3. **New Interview Setup**: Select role (*Software Developer*), experience (*Fresher*), skills (*Python, SQL, JavaScript*), and difficulty (*Medium*).
4. **Interview Room**:
   - AI interviewer greets candidate and asks Question 1.
   - Click **"Listen Aloud"** to hear the question via speech synthesis.
   - Click **"Microphone (Voice)"** or type an incomplete answer.
   - Observe **"AI is analyzing your answer..."** status indicator.
   - Experience the **adaptive follow-up** probing into the missing technical nuance!
5. **Results Page**: View circular score gauge, 6-pillar dimensional bars, Strengths, Areas for Improvement, and Skill Gaps.
6. **Detailed Report Dossier**: View or print the complete evaluation and verbatim dialogue transcript.
7. **Analytics Dashboard**: Inspect the score trajectory and skill proficiency curves.

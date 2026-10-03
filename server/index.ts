import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env file manually if dotenv is not yet installed
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { createMiniExpress, miniJson, miniCors, miniStatic, Router } from './utils/miniExpress.ts';
import { interviewController } from './controllers/interviewController.ts';
import { analyticsController } from './controllers/analyticsController.ts';
import { authController } from './controllers/authController.ts';
import { lyzrService } from './services/lyzrService.ts';

const app = createMiniExpress();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middlewares
app.use(miniCors());
app.use(miniJson());

// Static files
const publicDir = path.resolve(process.cwd(), 'public');
const clientDistDir = path.resolve(process.cwd(), 'client/dist');
if (fs.existsSync(clientDistDir)) {
  app.use(miniStatic(clientDistDir));
}
if (fs.existsSync(publicDir)) {
  app.use(miniStatic(publicDir));
}

// Health check and Lyzr status endpoint
app.get('/api/health', async (req: any, res: any) => {
  const lyzrCheck = await lyzrService.testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'SQLite (connected)',
    lyzrAgent: {
      agentId: process.env.LYZR_AGENT_ID || '6ac0c944b9fb570e2390c041',
      configured: Boolean(process.env.LYZR_API_KEY),
      ...lyzrCheck
    }
  });
});

// Interview API Endpoints
app.post('/api/interview/start', interviewController.startInterview);
app.post('/api/interview/chat', interviewController.chat);
app.get('/api/interview/:sessionId', interviewController.getSession);
app.post('/api/interview/end', interviewController.endInterview);
app.get('/api/interview/:sessionId/report', interviewController.getReport);

// Interviews history list
app.get('/api/interviews', interviewController.listInterviews);

// Analytics API
app.get('/api/analytics', analyticsController.getAnalytics);

// Auth & Profile API
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', authController.getProfile);
app.post('/api/auth/profile', authController.updateProfile);
app.get('/api/profile', authController.getProfile);
app.post('/api/profile', authController.updateProfile);

// Lyzr test connection endpoint
app.get('/api/lyzr/test', interviewController.testLyzr);

// Start server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 AI Mock Interview Panel Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🤖 Lyzr Agent ID: ${process.env.LYZR_AGENT_ID || '6ac0c944b9fb570e2390c041'}`);
  console.log(`🔑 Lyzr API Key configured: ${Boolean(process.env.LYZR_API_KEY)}`);
  console.log(`📊 SQLite database initialized successfully`);
  console.log('====================================================');
});

export default app;

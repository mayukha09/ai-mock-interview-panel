import './server/utils/loadEnv.ts';
import { executeHttpRequest } from './server/utils/httpHelper.ts';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AI MOCK INTERVIEW PANEL VALIDATION SUITE');
  console.log('====================================================');

  let passed = 0;
  let total = 0;

  async function test(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health check
  await test('Health check & Lyzr Agent config', async () => {
    const res = await executeHttpRequest(`${BASE_URL}/api/health`, 'GET', {});
    if (res.status !== 200 || !res.data?.lyzrAgent?.agentId) {
      throw new Error(`Unexpected health response: ${JSON.stringify(res.data)}`);
    }
    if (res.data.lyzrAgent.agentId !== '6ac0c944b9fb570e2390c041') {
      throw new Error(`Expected agentId 6ac0c944b9fb570e2390c041, got ${res.data.lyzrAgent.agentId}`);
    }
  });

  // 2. Analytics
  await test('Analytics endpoint returns aggregated stats & skills', async () => {
    const res = await executeHttpRequest(`${BASE_URL}/api/analytics`, 'GET', {});
    if (res.status !== 200 || typeof res.data.averageScore !== 'number') {
      throw new Error(`Failed to load analytics: ${JSON.stringify(res.data)}`);
    }
    if (!Array.isArray(res.data.skillPerformance) || res.data.skillPerformance.length === 0) {
      throw new Error('Analytics missing skillPerformance array');
    }
  });

  // 3. Interview History
  await test('Interviews history lists previous mock sessions', async () => {
    const res = await executeHttpRequest(`${BASE_URL}/api/interviews`, 'GET', {});
    if (res.status !== 200 || !Array.isArray(res.data)) {
      throw new Error('Failed to retrieve interviews list');
    }
    if (res.data.length === 0) {
      throw new Error('No interview sessions found in history');
    }
  });

  // 4. Start Interview
  let testSessionId = '';
  await test('Start Interview initializes session with Lyzr prompt', async () => {
    const res = await executeHttpRequest(
      `${BASE_URL}/api/interview/start`,
      'POST',
      { 'Content-Type': 'application/json' },
      {
        candidateName: 'Mayukha',
        email: 'mayukhatokala@gmail.com',
        role: 'Software Developer',
        experience: 'Fresher',
        skills: ['Python', 'SQL', 'JavaScript'],
        interviewType: 'Technical + Behavioral',
        difficulty: 'Medium',
        questionCount: 3,
        duration: 15
      }
    );

    if (res.status !== 201 || !res.data.sessionId || !res.data.initialQuestion) {
      throw new Error(`Start interview failed: ${JSON.stringify(res.data)}`);
    }
    testSessionId = res.data.sessionId;
    console.log(`   Initial Question: "${res.data.initialQuestion.slice(0, 80)}..."`);
  });

  // 5. Adaptive Chat (Candidate Answer -> Lyzr Adaptive Question)
  await test('Chat endpoint submits candidate answer & receives adaptive response', async () => {
    if (!testSessionId) throw new Error('No active session ID');

    const res = await executeHttpRequest(
      `${BASE_URL}/api/interview/chat`,
      'POST',
      { 'Content-Type': 'application/json' },
      {
        sessionId: testSessionId,
        message: 'In Python, variables point to object references. Mutable objects can be modified in place while immutable objects cannot.'
      }
    );

    if (res.status !== 200 || !res.data.response) {
      throw new Error(`Chat turn failed: ${JSON.stringify(res.data)}`);
    }
    console.log(`   Adaptive AI Turn: "${res.data.response.slice(0, 80)}..."`);
    console.log(`   Is Follow-Up: ${res.data.isFollowUp}, Engine Source: ${res.data.source}`);
  });

  // 6. End Interview & Evaluation
  await test('End interview finalizes evaluation & calculates structured scores', async () => {
    if (!testSessionId) throw new Error('No active session ID');

    const res = await executeHttpRequest(
      `${BASE_URL}/api/interview/end`,
      'POST',
      { 'Content-Type': 'application/json' },
      { sessionId: testSessionId }
    );

    if (res.status !== 200 || !res.data.evaluation) {
      throw new Error(`End interview failed: ${JSON.stringify(res.data)}`);
    }
    const ev = res.data.evaluation;
    if (typeof ev.overallScore !== 'number' || !Array.isArray(ev.strengths) || !Array.isArray(ev.weaknesses)) {
      throw new Error(`Evaluation structure invalid: ${JSON.stringify(ev)}`);
    }
    console.log(`   Overall Score: ${ev.overallScore}%, Technical: ${ev.technicalAccuracy}/10, Comm: ${ev.communication}/10`);
  });

  // 7. Get Report
  await test('Get report returns candidate details, evaluation, and full transcript', async () => {
    if (!testSessionId) throw new Error('No active session ID');

    const res = await executeHttpRequest(`${BASE_URL}/api/interview/${testSessionId}/report`, 'GET', {});
    if (res.status !== 200 || !res.data.transcript || !res.data.evaluation) {
      throw new Error(`Report retrieval failed: ${JSON.stringify(res.data)}`);
    }
    if (res.data.transcript.length < 2) {
      throw new Error('Transcript missing conversation messages');
    }
    console.log(`   Transcript entries: ${res.data.transcript.length}`);
  });

  // 8. Candidate Profile
  await test('Profile endpoint updates and retrieves skills', async () => {
    const res = await executeHttpRequest(
      `${BASE_URL}/api/profile`,
      'POST',
      { 'Content-Type': 'application/json' },
      {
        userId: 'user_demo_mayukha',
        role: 'Software Developer',
        experience: 'Fresher',
        skills: ['Python', 'SQL', 'JavaScript', 'Docker']
      }
    );
    if (res.status !== 200 || !res.data.profile) {
      throw new Error('Failed to update candidate profile');
    }
  });

  // 9. Static Frontend
  await test('Static frontend serves index.html and app.js', async () => {
    const resHtml = await executeHttpRequest(`${BASE_URL}/`, 'GET', {});
    if (resHtml.status !== 200 || !resHtml.rawText.includes('AI Mock Interview Panel')) {
      throw new Error('Failed to serve index.html');
    }

    const resJs = await executeHttpRequest(`${BASE_URL}/app.js`, 'GET', {});
    if (resJs.status !== 200 || !resJs.rawText.includes('ReactDOM.createRoot')) {
      throw new Error('Failed to serve app.js');
    }
  });

  console.log('====================================================');
  console.log(`🎯 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

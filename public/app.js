// AI Mock Interview Panel - Standalone Single Page React Application
const { useState, useEffect, useRef, useCallback } = React;

// --- UTILITY COMPONENTS ---

function ScoreGauge({ score, size = 180, strokeWidth = 14, label = 'Overall Score', sublabel = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score || 0));
  const offset = circumference - (clamped / 100) * circumference;

  let color = '#3b82f6';
  let grade = 'Proficient';
  let badgeBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';

  if (clamped >= 85) {
    color = '#10b981';
    grade = 'Strong Hire';
    badgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (clamped >= 70) {
    color = '#3b82f6';
    grade = 'Ready / Pass';
    badgeBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  } else if (clamped >= 50) {
    color = '#f59e0b';
    grade = 'Needs Practice';
    badgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else {
    color = '#ef4444';
    grade = 'Critical Gap';
    badgeBg = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e293b" strokeWidth={strokeWidth} fill="transparent" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-3xl font-black tracking-tight text-white">
            {clamped}<span className="text-lg font-normal text-slate-400">%</span>
          </span>
          <span className={`text-[10px] font-bold mt-1 px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
            {grade}
          </span>
        </div>
      </div>
      {label && <p className="mt-3 font-semibold text-slate-200 text-xs">{label}</p>}
      {sublabel && <p className="text-[11px] text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

function AudioVisualizer({ isActive, color = 'bg-blue-500', bars = 14 }) {
  return (
    <div className="flex items-center justify-center gap-1 h-6 px-2">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full ${color} transition-all duration-300 ${isActive ? 'animate-pulse' : 'h-1.5 opacity-30'}`}
          style={{
            height: isActive ? `${Math.max(25, (Math.sin(i * 0.9) * 0.5 + 0.5) * 100)}%` : '5px',
            animationDelay: `${(i % 5) * 120}ms`
          }}
        />
      ))}
    </div>
  );
}

// --- MAIN APPLICATION COMPONENT ---
function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState({
    id: 'user_demo_mayukha',
    name: 'Mayukha',
    email: 'mayukhatokala@gmail.com'
  });
  const [profile, setProfile] = useState({
    role: 'Software Developer',
    experience: 'Fresher',
    skills: ['Python', 'SQL', 'JavaScript', 'HTML', 'CSS', 'Java']
  });

  const [analytics, setAnalytics] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [initialQuestion, setInitialQuestion] = useState('');
  const [selectedReportSessionId, setSelectedReportSessionId] = useState(null);

  // Global load
  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.warn('Could not load analytics:', err));

    fetch('/api/profile?email=' + encodeURIComponent(user.email))
      .then(res => res.json())
      .then(data => {
        if (data.profile) setProfile(data.profile);
      })
      .catch(() => {});
  }, [user.email]);

  const refreshAnalytics = () => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(() => {});
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div onClick={() => setCurrentView('landing')} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">AI Mock Interview Panel</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Lyzr Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">Adaptive Multi-Turn Interview System</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {['dashboard', 'setup', 'history', 'analytics', 'profile'].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  currentView === view
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {view === 'setup' ? 'New Interview' : view}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {activeSession && currentView !== 'room' && (
              <button
                onClick={() => setCurrentView('room')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Resume Room
              </button>
            )}

            <div
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                {user.name ? user.name[0].toUpperCase() : 'M'}
              </div>
              <span className="text-xs font-medium text-slate-200 hidden sm:inline">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <ViewLanding
            onStart={() => setCurrentView('setup')}
            onDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <ViewDashboard
            user={user}
            analytics={analytics}
            onStart={() => setCurrentView('setup')}
            onHistory={() => setCurrentView('history')}
            onAnalytics={() => setCurrentView('analytics')}
          />
        )}

        {currentView === 'setup' && (
          <ViewSetup
            user={user}
            profile={profile}
            onStarted={(data) => {
              setActiveSession(data.session);
              setInitialQuestion(data.initialQuestion);
              setCurrentView('room');
            }}
          />
        )}

        {currentView === 'room' && activeSession && (
          <ViewInterviewRoom
            session={activeSession}
            initialQuestion={initialQuestion}
            onCompleted={(sessionId) => {
              setSelectedReportSessionId(sessionId);
              setActiveSession(null);
              refreshAnalytics();
              setCurrentView('results');
            }}
            onExit={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'results' && selectedReportSessionId && (
          <ViewResults
            sessionId={selectedReportSessionId}
            onViewReport={(id) => {
              setSelectedReportSessionId(id);
              setCurrentView('report');
            }}
            onStartAnother={() => setCurrentView('setup')}
            onDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'analytics' && (
          <ViewAnalytics
            analytics={analytics}
            onStart={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'history' && (
          <ViewHistory
            userId={user.id}
            onViewReport={(id) => {
              setSelectedReportSessionId(id);
              setCurrentView('report');
            }}
            onStart={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'report' && selectedReportSessionId && (
          <ViewReport
            sessionId={selectedReportSessionId}
            onBack={() => setCurrentView('history')}
          />
        )}

        {currentView === 'profile' && (
          <ViewProfile
            user={user}
            profile={profile}
            onSave={(updated) => setProfile(updated)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-500 py-6 px-4 text-xs mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>AI Mock Interview Panel · Powered by Lyzr Agent</span>
          </div>
          <div>React 18 · TypeScript · Node.js REST API · SQLite DB · Web Speech Voice</div>
          <div className="text-slate-400 font-medium">Built for Hackathon Demonstration</div>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// 1. LANDING PAGE
// ==========================================
function ViewLanding({ onStart, onDashboard }) {
  const cards = [
    {
      title: 'AI-Powered Questions',
      tag: 'Dynamic Generation',
      desc: 'Dynamically generated contextual technical and behavioral questions tailored to your target role, stack, and difficulty level.'
    },
    {
      title: 'Adaptive Follow-ups',
      tag: 'Agentic Behavior',
      desc: 'Our Lyzr Agent analyzes incomplete answers and instantly probes deeper with targeted follow-ups, just like a senior human interviewer.'
    },
    {
      title: 'Real-Time Evaluation',
      tag: 'Objective Metrics',
      desc: 'Get structured scoring across Technical Accuracy, Problem Solving, Communication, Completeness, and Confidence.'
    },
    {
      title: 'Skill Gap Analysis',
      tag: 'Actionable Insights',
      desc: 'Pinpoint specific algorithmic concepts, system design blindspots, and architectural tradeoffs to boost your hiring readiness.'
    }
  ];

  return (
    <div className="py-14 px-4 sm:px-6 max-w-7xl mx-auto space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Lyzr Agent Integrated Mock Interview Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Practice. Perform.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Get Hired.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An AI-powered mock interview panel that adapts to your answers, evaluates your performance, and helps you improve.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Mock Interview</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={onDashboard}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-colors"
          >
            View Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {c.tag}
            </span>
            <h3 className="text-base font-bold text-white">{c.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. DASHBOARD PAGE
// ==========================================
function ViewDashboard({ user, analytics, onStart, onHistory, onAnalytics }) {
  const latest = analytics?.latestScore ?? 88;
  const avg = analytics?.averageScore ?? 85;
  const count = analytics?.totalInterviews ?? 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Welcome, {user.name}
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-3 tracking-tight">Candidate Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Track your adaptive interview performance, analyze skill gaps, and launch real-time simulation rounds.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onStart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <span>Start New Interview</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button onClick={onHistory} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold">
            View History
          </button>
          <button onClick={onAnalytics} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold">
            View Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-bold text-slate-400">Latest Score</span>
          <div className="text-3xl font-extrabold text-white mt-2">{latest}%</div>
          <span className="text-xs text-emerald-400 mt-1 block">Recent technical round</span>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-bold text-slate-400">Average Score</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-2">{avg}%</div>
          <span className="text-xs text-slate-400 mt-1 block">Across all completed attempts</span>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-bold text-slate-400">Interviews Completed</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">{count}</div>
          <span className="text-xs text-slate-400 mt-1 block">Full evaluations stored</span>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] uppercase font-bold text-slate-400">Skills to Improve</span>
          <div className="text-lg font-bold text-amber-400 mt-2 truncate">Database Indexing</div>
          <span className="text-xs text-slate-400 mt-1 block">Identified from last evaluation</span>
        </div>
      </div>

      {/* Recommended Practice */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight">Recommended Practice Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { role: 'Software Developer', type: 'Technical + Behavioral', topic: 'Python Internals & SQL Normalization', diff: 'Medium', dur: '15m' },
            { role: 'Full Stack Engineer', type: 'Technical', topic: 'React Virtual DOM & Node.js Event Loop', diff: 'Medium', dur: '15m' },
            { role: 'System Design', type: 'System Design', topic: 'Distributed Caching & Sharding', diff: 'Hard', dur: '20m' }
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                    {item.type}
                  </span>
                  <span className="text-slate-400">{item.dur}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{item.role}</h3>
                <p className="text-xs text-slate-400 mt-1">{item.topic}</p>
              </div>
              <button
                onClick={onStart}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
              >
                Launch Track
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. INTERVIEW SETUP
// ==========================================
function ViewSetup({ user, profile, onStarted }) {
  const [candidateName, setCandidateName] = useState(user.name || 'Mayukha');
  const [email, setEmail] = useState(user.email || 'mayukhatokala@gmail.com');
  const [role, setRole] = useState(profile.role || 'Software Developer');
  const [experience, setExperience] = useState(profile.experience || 'Fresher');
  const [skills, setSkills] = useState((profile.skills || ['Python', 'SQL', 'JavaScript']).join(', '));
  const [interviewType, setInterviewType] = useState('Technical + Behavioral');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [duration, setDuration] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const interviewTypes = [
    'Technical',
    'Behavioral',
    'HR',
    'System Design',
    'Domain Specific',
    'Technical + Behavioral'
  ];

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          email,
          role,
          experience,
          skills: skillsArr,
          interviewType,
          difficulty,
          questionCount: Number(questionCount),
          duration: Number(duration)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start interview');
      onStarted(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to the AI interviewer.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setCandidateName('Mayukha');
    setEmail('mayukhatokala@gmail.com');
    setRole('Software Developer');
    setExperience('Fresher');
    setSkills('Python, Java, SQL, HTML, CSS, JavaScript');
    setInterviewType('Technical + Behavioral');
    setDifficulty('Medium');
    setQuestionCount(10);
    setDuration(15);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Session Configuration
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">Interview Setup</h1>
            <p className="text-xs text-slate-400 mt-0.5">Parameters will be ingested by the Lyzr Agent.</p>
          </div>
          <button
            type="button"
            onClick={loadDemo}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
          >
            Reset Demo Values
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={handleStart} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 font-bold">Retry</button>
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Candidate Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Candidate Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Target Job Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Experience Level</label>
              <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Fresher">Fresher</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Technical Skills</label>
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Interview Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {interviewTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInterviewType(t)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                    interviewType === t
                      ? 'bg-blue-600/30 border-blue-500 text-white'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Difficulty</label>
              <div className="grid grid-cols-3 gap-1">
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 rounded-lg text-xs font-semibold border text-center ${
                      difficulty === d ? 'bg-blue-600/30 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Questions: <span className="text-white font-bold">{questionCount}</span>
              </label>
              <input
                type="range"
                min={3}
                max={15}
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full accent-blue-500 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connecting to Lyzr Agent...</span>
                </>
              ) : (
                <>
                  <span>Start AI Interview</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. INTERVIEW ROOM
// ==========================================
function ViewInterviewRoom({ session, initialQuestion, onCompleted, onExit }) {
  const [currentQNum, setCurrentQNum] = useState(session.currentQuestion || 1);
  const [questionText, setQuestionText] = useState(initialQuestion || 'Welcome! Preparing Question 1...');
  const [candidateText, setCandidateText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState((session.duration || 15) * 60);

  // Speech Recognition & Synthesis
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript + ' ';
          }
        }
        if (finalStr) {
          setCandidateText(prev => prev ? `${prev} ${finalStr.trim()}` : finalStr.trim());
        }
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const speakAloud = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#`[\]()]/g, ' ').replace(/\s+/g, ' ');
    const u = new SpeechSynthesisUtterance(clean);
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Timer
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(t);
          finalizeInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Sync initial question
  useEffect(() => {
    if (initialQuestion) {
      setMessages([
        {
          id: 'init_msg',
          sender: 'interviewer',
          message: initialQuestion,
          questionNumber: 1,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [initialQuestion]);

  const handleSubmit = async () => {
    if (!candidateText.trim()) {
      setErrorMsg('Please enter or speak an answer before submitting.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const answer = candidateText.trim();
    setCandidateText('');
    setErrorMsg(null);
    setIsAnalyzing(true);

    const candMsg = {
      id: 'c_' + Date.now(),
      sender: 'candidate',
      message: answer,
      questionNumber: currentQNum,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, candMsg]);

    try {
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, message: answer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit response');

      const aiMsg = {
        id: 'i_' + Date.now(),
        sender: 'interviewer',
        message: data.response,
        questionNumber: data.currentQuestion,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
      setQuestionText(data.response);
      setCurrentQNum(data.currentQuestion);

      speakAloud(data.response);

      if (data.isCompleted) {
        await finalizeInterview();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to AI interviewer.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const finalizeInterview = async () => {
    stopSpeaking();
    try {
      const res = await fetch('/api/interview/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id })
      });
      onCompleted(session.id);
    } catch (e) {
      onCompleted(session.id);
    }
  };

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = Math.round((currentQNum / (session.questionCount || 10)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
            Q{currentQNum}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Mock Interview Panel</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{session.role}</span>
              <span>•</span>
              <span className="text-blue-400">{session.interviewType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold">
            <span className="text-amber-400">⏱</span>
            <span className={secondsRemaining < 180 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>
          <button
            onClick={finalizeInterview}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Question {currentQNum} of {session.questionCount}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
                  AI
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Lyzr AI Interviewer</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Adaptive
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{session.role} ({session.difficulty})</p>
                </div>
              </div>

              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakAloud(questionText)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSpeaking ? 'bg-purple-600/30 border-purple-500 text-purple-300 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>{isSpeaking ? 'Pause Audio' : 'Listen Aloud 🔊'}</span>
              </button>
            </div>

            {isSpeaking && <AudioVisualizer isActive={true} color="bg-purple-500" />}

            <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
              {questionText}
            </div>
          </div>

          {/* Analyzing Feedback */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-3 text-indigo-300 text-xs font-semibold animate-pulse shadow-lg">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <span>AI is analyzing your answer & formulating an adaptive follow-up...</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex justify-between items-center">
              <span>{errorMsg}</span>
              <button onClick={handleSubmit} className="px-2 py-0.5 rounded bg-rose-500/20 font-bold">Retry</button>
            </div>
          )}

          {/* Answer Input */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase text-slate-300">Your Answer</span>
                {isRecording && (
                  <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                    Recording Live Speech...
                  </span>
                )}
              </div>
              <span className="text-slate-400">{candidateText.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>

            {isRecording && <AudioVisualizer isActive={true} color="bg-rose-500" />}

            <textarea
              rows={5}
              value={candidateText}
              onChange={e => setCandidateText(e.target.value)}
              placeholder="Type your response or use voice input. Lyzr Agent analyzes your completeness and asks adaptive follow-ups..."
              disabled={isAnalyzing}
              className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isAnalyzing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold ${
                    isRecording ? 'bg-rose-600 text-white border-rose-500 animate-pulse' : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <span>{isRecording ? 'Stop Recording' : 'Microphone (Voice)'}</span>
                </button>
                {candidateText && (
                  <button type="button" onClick={() => setCandidateText('')} className="text-xs text-slate-400 hover:text-white px-2 py-1">
                    Clear
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isAnalyzing || !candidateText.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-40"
              >
                Submit Answer
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Transcript</h3>
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
              {messages.map((m, i) => (
                <div key={i} className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  m.sender === 'interviewer' ? 'bg-slate-800/70 border-slate-700' : 'bg-blue-950/30 border-blue-900/40 ml-4'
                }`}>
                  <div className="flex justify-between font-bold mb-1">
                    <span className={m.sender === 'interviewer' ? 'text-blue-400' : 'text-emerald-400'}>
                      {m.sender === 'interviewer' ? 'Lyzr AI Interviewer' : 'Candidate'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-slate-200 whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Session Specs</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Role</span><span className="font-semibold text-white">{session.role}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Experience</span><span className="font-semibold text-white">{session.experience}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Difficulty</span><span className="font-semibold text-blue-400">{session.difficulty}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Track</span><span className="font-semibold text-white">{session.interviewType}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="block font-bold uppercase text-slate-400 mb-2">Skills Evaluated</span>
              <div className="flex flex-wrap gap-1">
                {(session.skills || []).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/20 text-xs space-y-2">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5">
              <span>★</span><span>Adaptive Agentic Mode</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Lyzr Agent continuously calculates candidate accuracy. Short or superficial answers automatically trigger probing follow-ups!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. RESULTS PAGE
// ==========================================
function ViewResults({ sessionId, onViewReport, onStartAnother, onDashboard }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/interview/${sessionId}/report`)
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading || !report) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400">Compiling structured AI evaluation...</p>
      </div>
    );
  }

  const { evaluation, session, candidate } = report;

  const dims = [
    { label: 'Technical Accuracy', val: evaluation.technicalAccuracy, color: 'text-blue-400', bg: 'bg-blue-500' },
    { label: 'Problem Solving', val: evaluation.problemSolving, color: 'text-purple-400', bg: 'bg-purple-500' },
    { label: 'Communication', val: evaluation.communication, color: 'text-emerald-400', bg: 'bg-emerald-500' },
    { label: 'Answer Quality', val: evaluation.answerQuality, color: 'text-indigo-400', bg: 'bg-indigo-500' },
    { label: 'Completeness', val: evaluation.completeness, color: 'text-cyan-400', bg: 'bg-cyan-500' },
    { label: 'Confidence', val: evaluation.confidence, color: 'text-amber-400', bg: 'bg-amber-500' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Interview Complete
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Evaluation Results</h1>
          <p className="text-xs text-slate-400 mt-0.5">Candidate: {candidate.name} · Role: {session.role}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onViewReport(sessionId)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30"
          >
            Full Report & Transcript
          </button>
          <button
            onClick={onStartAnother}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
          >
            Start Another
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center shadow-xl">
          <ScoreGauge score={evaluation.overallScore} size={190} strokeWidth={15} />
          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Composite score weighted against technical depth, structured logic, and clarity.
          </p>
        </div>

        <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Dimensional Scoring</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dims.map((d, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">{d.label}</span>
                  <span className={`font-mono font-bold ${d.color}`}>{d.val}/10</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${d.bg} rounded-full`} style={{ width: `${d.val * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
            <span>✓</span><span>Demonstrated Strengths</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="flex gap-2"><span>•</span><span>{s}</span></li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
            <span>▲</span><span>Areas for Improvement</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {evaluation.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2"><span>•</span><span>{w}</span></li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase text-rose-400 flex items-center gap-1.5">
            <span>✕</span><span>Skill Gaps</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {evaluation.skillGaps.map((g, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
            <span>★</span><span>Personalized Recommendations</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {evaluation.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2"><span className="font-bold text-blue-400">{i+1}.</span><span>{r}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. ANALYTICS PAGE
// ==========================================
function ViewAnalytics({ analytics, onStart }) {
  const timeline = analytics?.performanceOverTime || [];
  const skills = analytics?.skillPerformance || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            Analytics & Progress
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Performance Intelligence</h1>
          <p className="text-xs text-slate-400 mt-0.5">Tracking historical scores and technical competencies.</p>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
        >
          New Interview
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Interviews</span>
          <div className="text-3xl font-extrabold text-white mt-1">{analytics?.totalInterviews ?? 0}</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Average Score</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-1">{analytics?.averageScore ?? 0}%</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Best Score</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{analytics?.bestScore ?? 0}%</div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Latest Score</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-1">{analytics?.latestScore ?? 0}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white">Performance Over Time</h2>
          {timeline.length > 0 ? (
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-3 bg-slate-800/40 rounded-2xl">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-300">{item.score}%</span>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all"
                    style={{ height: `${item.score}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{item.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-10">No interview history to plot yet.</p>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white">Skill Proficiency</h2>
          <div className="space-y-3">
            {skills.map((s, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-semibold">{s.skill}</span>
                  <span className="font-mono text-slate-400">{s.score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.score >= 85 ? 'bg-emerald-500' : s.score >= 75 ? 'bg-blue-500' : 'bg-amber-500'} rounded-full`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. HISTORY PAGE
// ==========================================
function ViewHistory({ userId, onViewReport, onStart }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/interviews')
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            Dossier Archive
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">Interview History</h1>
          <p className="text-xs text-slate-400 mt-0.5">Past mock interview sessions with complete AI reports.</p>
        </div>
        <button
          onClick={onStart}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
        >
          New Interview
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading history...</div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <p className="text-slate-400 text-xs">No interviews conducted yet.</p>
          <button onClick={onStart} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
            Start First Interview
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Target Role</th>
                <th className="py-3 px-5">Track</th>
                <th className="py-3 px-5">Difficulty</th>
                <th className="py-3 px-5 text-center">Score</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30">
                  <td className="py-3.5 px-5 text-slate-300 font-medium">
                    {new Date(s.startedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-white">
                    {s.role}
                    <span className="block text-[10px] text-slate-400 font-normal">{s.experience}</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-300">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-blue-300">
                      {s.interviewType}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {s.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center font-mono font-bold">
                    {s.overallScore != null ? `${s.overallScore}%` : '-'}
                  </td>
                  <td className="py-3.5 px-5 text-emerald-400 font-semibold capitalize">
                    {s.status}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => onViewReport(s.id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. REPORT DOSSIER PAGE
// ==========================================
function ViewReport({ sessionId, onBack }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/interview/${sessionId}/report`)
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.warn(err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading || !report) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading dossier report...
      </div>
    );
  }

  const { session, candidate, evaluation, transcript } = report;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800 print:hidden">
        <button onClick={onBack} className="text-xs text-slate-400 hover:text-white font-semibold">
          ← Back to History
        </button>
        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold"
        >
          Print / PDF
        </button>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Official AI Dossier
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">{candidate.name}</h1>
            <p className="text-xs text-slate-400">{candidate.email} · {session.role} ({session.experience})</p>
          </div>
          <div className="text-xs text-slate-400 space-y-1 sm:text-right">
            <div>Track: <strong className="text-white">{session.interviewType}</strong></div>
            <div>Difficulty: <strong className="text-white">{session.difficulty}</strong></div>
            <div>Date: <strong className="text-white">{new Date(session.startedAt).toLocaleDateString()}</strong></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="md:col-span-1 flex justify-center">
            <ScoreGauge score={evaluation.overallScore} size={140} strokeWidth={12} label="" />
          </div>
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Technical Accuracy', val: evaluation.technicalAccuracy, col: 'text-blue-400' },
              { label: 'Problem Solving', val: evaluation.problemSolving, col: 'text-purple-400' },
              { label: 'Communication', val: evaluation.communication, col: 'text-emerald-400' },
              { label: 'Answer Quality', val: evaluation.answerQuality, col: 'text-indigo-400' },
              { label: 'Completeness', val: evaluation.completeness, col: 'text-cyan-400' },
              { label: 'Confidence', val: evaluation.confidence, col: 'text-amber-400' }
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <span className="text-[10px] uppercase text-slate-400 font-semibold">{m.label}</span>
                <div className={`text-lg font-bold mt-1 ${m.col}`}>{m.val}/10</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase text-emerald-400">Strengths</h3>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex gap-2"><span>✓</span><span>{s}</span></li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase text-amber-400">Areas for Improvement</h3>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {evaluation.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2"><span>▲</span><span>{w}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase text-rose-400">Skill Gaps</h3>
            <div className="flex flex-wrap gap-1.5">
              {evaluation.skillGaps.map((g, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold uppercase text-blue-400">Recommendations</h3>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {evaluation.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2"><span className="text-blue-400 font-bold">{i+1}.</span><span>{r}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase text-slate-300">Dialogue Transcript</h2>
          <div className="space-y-3">
            {transcript.map((m, i) => (
              <div key={i} className={`p-4 rounded-xl border text-xs leading-relaxed ${
                m.sender === 'interviewer' ? 'bg-slate-800/70 border-slate-700' : 'bg-blue-950/30 border-blue-900/40 ml-4'
              }`}>
                <div className="flex justify-between font-bold mb-1">
                  <span className={m.sender === 'interviewer' ? 'text-blue-400' : 'text-emerald-400'}>
                    {m.sender === 'interviewer' ? 'Lyzr AI Interviewer' : 'Candidate'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-slate-200 whitespace-pre-wrap">{m.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. PROFILE PAGE
// ==========================================
function ViewProfile({ user, profile, onSave }) {
  const [role, setRole] = useState(profile.role || 'Software Developer');
  const [experience, setExperience] = useState(profile.experience || 'Fresher');
  const [skillsStr, setSkillsStr] = useState((profile.skills || []).join(', '));
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArr = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, role, experience, skills: skillsArr })
    })
      .then(res => res.json())
      .then(data => {
        onSave(data.profile);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xl">
            {user.name ? user.name[0].toUpperCase() : 'M'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user.name}</h1>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Target Role</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Experience Level</label>
            <select
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            >
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Skills</label>
            <textarea
              rows={3}
              value={skillsStr}
              onChange={e => setSkillsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Render root
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

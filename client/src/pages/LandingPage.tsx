import React from 'react';

interface LandingPageProps {
  onStartInterview: () => void;
  onViewDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInterview,
  onViewDashboard
}) => {
  const features = [
    {
      title: 'AI-Powered Questions',
      desc: 'Dynamically generated contextual technical and behavioral questions tailored to your target role, stack, and difficulty level.',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      tag: 'Dynamic Generation'
    },
    {
      title: 'Adaptive Follow-ups',
      desc: 'Our Lyzr Agent analyzes incomplete answers and instantly probes deeper with targeted follow-ups, just like a senior human interviewer.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      tag: 'Agentic Behavior'
    },
    {
      title: 'Real-Time Evaluation',
      desc: 'Get structured scoring across Technical Accuracy, Problem Solving, Communication, Completeness, and Confidence.',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      tag: 'Objective Metrics'
    },
    {
      title: 'Skill Gap Analysis',
      desc: 'Pinpoint specific algorithmic concepts, system design blindspots, and architectural tradeoffs to boost your hiring readiness.',
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      tag: 'Actionable Insights'
    }
  ];

  const interviewTypes = [
    'Technical',
    'Behavioral',
    'HR',
    'System Design',
    'Domain Specific',
    'Technical + Behavioral'
  ];

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Next-Generation AI Interviewer
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Practice. Perform.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Get Hired.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          An AI-powered mock interview panel that adapts to your answers, evaluates your performance, and helps you improve.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartInterview}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Start Mock Interview</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={onViewDashboard}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 font-semibold text-base transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>View Dashboard</span>
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="mt-10 inline-flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Lyzr Agent Ready</span>
          </div>
          <span>•</span>
          <span>Speech Recognition & Synthesis Enabled</span>
          <span>•</span>
          <span>Adaptive Multi-Turn Reasoning</span>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Realistic Interview Assessment
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-xl mx-auto">
            Not just a static chatbot. An agentic interview panel designed to probe your technical depth with real-world scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all hover:translate-y-[-4px] group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {f.tag}
              </span>
              <h3 className="text-lg font-bold text-white mt-3 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interview Formats Supported */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-2">Simulate Any Interview Track</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6">
            Configure round formats, target tech stack, and difficulty to prepare for top-tier companies.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {interviewTypes.map((type, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import type { AnalyticsData } from '../types/index.ts';

interface DashboardPageProps {
  candidateName: string;
  analytics: AnalyticsData | null;
  onStartInterview: () => void;
  onViewHistory: () => void;
  onViewAnalytics: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  candidateName,
  analytics,
  onStartInterview,
  onViewHistory,
  onViewAnalytics
}) => {
  const latestScore = analytics?.latestScore ?? 88;
  const avgScore = analytics?.averageScore ?? 85;
  const completedCount = analytics?.totalInterviews ?? 2;

  const practiceModules = [
    {
      role: 'Software Developer',
      type: 'Technical + Behavioral',
      difficulty: 'Medium',
      topic: 'Python Internals & SQL Normalization',
      duration: '15 mins',
      recommendedReason: 'Recommended based on your recent skill gaps in database indexing.'
    },
    {
      role: 'Full Stack Engineer',
      type: 'Technical',
      difficulty: 'Hard',
      topic: 'React Virtual DOM & Node.js Event Loop',
      duration: '20 mins',
      recommendedReason: 'Next milestone to advance to senior full stack benchmarks.'
    },
    {
      role: 'System Design',
      type: 'System Design',
      difficulty: 'Medium',
      topic: 'Distributed Caching & Rate Limiting API',
      duration: '25 mins',
      recommendedReason: 'Boost your problem-solving depth for high-scale backend roles.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Candidate Hub
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            Welcome back, {candidateName || 'Mayukha'}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Review your interview analytics, practice adaptive rounds with Lyzr Agent, and bridge your technical skill gaps.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onStartInterview}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Start New Interview</span>
          </button>
          <button
            onClick={onViewHistory}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-colors"
          >
            View History
          </button>
          <button
            onClick={onViewAnalytics}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-colors"
          >
            Analytics
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Latest Score */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Latest Score</span>
            <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
              ★
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {latestScore}<span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <span>+6 pts higher than previous attempt</span>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
              %
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {avgScore}<span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Across all completed mock rounds
          </div>
        </div>

        {/* Interviews Completed */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Rounds</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              ✓
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {completedCount}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Full AI evaluation dossiers stored
          </div>
        </div>

        {/* Skills to Improve */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Priority Skill Gap</span>
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              !
            </span>
          </div>
          <div className="text-lg font-bold text-amber-400 truncate">
            Database Indexing
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Recommended focus for next interview
          </div>
        </div>
      </div>

      {/* Recommended Practice Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recommended Practice</h2>
            <p className="text-xs text-slate-400 mt-0.5">Curated AI interview tracks based on your evaluation history</p>
          </div>
          <button
            onClick={onStartInterview}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            Custom Setup →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {practiceModules.map((m, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    {m.type}
                  </span>
                  <span className="text-xs text-slate-400">{m.duration}</span>
                </div>
                <h3 className="text-base font-bold text-white">{m.role}</h3>
                <p className="text-xs font-semibold text-slate-300 mt-1">{m.topic}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{m.recommendedReason}</p>
              </div>

              <button
                onClick={onStartInterview}
                className="mt-6 w-full py-2.5 rounded-xl bg-slate-700/70 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch This Track</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

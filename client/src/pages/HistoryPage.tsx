import React, { useEffect, useState } from 'react';
import type { InterviewSession } from '../types/index.ts';

interface HistoryPageProps {
  userId?: string;
  onViewReport: (sessionId: string) => void;
  onStartInterview: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  userId,
  onViewReport,
  onStartInterview
}) => {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const url = userId ? `/api/interviews?userId=${encodeURIComponent(userId)}` : '/api/interviews';
        const res = await fetch(url);
        const data = await res.json();
        setSessions(data);
      } catch (e) {
        console.warn('Error loading history', e);
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, [userId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Dossier Archive
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            Interview History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review past mock interview sessions, questions asked by Lyzr Agent, and full AI evaluation reports.
          </p>
        </div>

        <button
          onClick={onStartInterview}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          New Interview
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          Loading past interviews...
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <svg className="w-12 h-12 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-base font-bold text-white">No interview records yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Take your first adaptive AI mock interview to generate rich analytics and structured reports.
          </p>
          <button
            onClick={onStartInterview}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Start Your First Interview
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/40 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Target Role</th>
                <th className="py-4 px-6">Interview Type</th>
                <th className="py-4 px-6">Difficulty</th>
                <th className="py-4 px-6 text-center">Score</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessions.map((s) => {
                const dateStr = new Date(s.startedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                const isCompleted = s.status === 'completed';
                const score = s.overallScore;

                return (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-slate-300 font-medium whitespace-nowrap">
                      {dateStr}
                    </td>

                    <td className="py-4 px-6 font-semibold text-white whitespace-nowrap">
                      {s.role}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {s.experience}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-300 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-medium text-blue-300">
                        {s.interviewType}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        s.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : s.difficulty === 'Medium'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {s.difficulty}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      {score != null ? (
                        <span className={`inline-flex items-center justify-center font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${
                          score >= 80 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : score >= 60 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {score}%
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Incomplete</span>
                      )}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                        isCompleted ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => onViewReport(s.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                      >
                        <span>View Report</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

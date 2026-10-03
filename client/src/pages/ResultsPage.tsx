import React, { useEffect, useState } from 'react';
import { ScoreGauge } from '../components/ScoreGauge.tsx';
import type { InterviewReport } from '../types/index.ts';

interface ResultsPageProps {
  sessionId: string;
  onViewReport: (sessionId: string) => void;
  onStartAnother: () => void;
  onReturnDashboard: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  sessionId,
  onViewReport,
  onStartAnother,
  onReturnDashboard
}) => {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/interview/${sessionId}/report`);
        if (!res.ok) throw new Error('Evaluation report could not be loaded');
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Error loading results');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-20 p-12 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h3 className="text-xl font-bold text-white">Synthesizing AI Evaluation Dossier...</h3>
        <p className="text-xs text-slate-400">
          Lyzr Agent and our structured evaluation engine are scoring your responses across all dimensions.
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="text-rose-400 text-3xl font-bold">!</div>
        <h3 className="text-lg font-bold text-white">Evaluation Error</h3>
        <p className="text-xs text-slate-400">{error || 'Session report not found'}</p>
        <button
          onClick={onReturnDashboard}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { evaluation, session, candidate } = report;

  const scoreMetrics = [
    { label: 'Technical Accuracy', score: evaluation.technicalAccuracy * 10, raw: evaluation.technicalAccuracy, color: 'text-blue-400', barBg: 'bg-blue-500' },
    { label: 'Problem Solving', score: evaluation.problemSolving * 10, raw: evaluation.problemSolving, color: 'text-purple-400', barBg: 'bg-purple-500' },
    { label: 'Communication', score: evaluation.communication * 10, raw: evaluation.communication, color: 'text-emerald-400', barBg: 'bg-emerald-500' },
    { label: 'Answer Quality', score: evaluation.answerQuality * 10, raw: evaluation.answerQuality, color: 'text-indigo-400', barBg: 'bg-indigo-500' },
    { label: 'Completeness', score: evaluation.completeness * 10, raw: evaluation.completeness, color: 'text-cyan-400', barBg: 'bg-cyan-500' },
    { label: 'Confidence', score: evaluation.confidence * 10, raw: evaluation.confidence, color: 'text-amber-400', barBg: 'bg-amber-500' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Interview Complete · AI Dossier Ready
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            Performance Evaluation Results
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Candidate: <strong className="text-slate-200">{candidate.name}</strong> · Role: <strong className="text-slate-200">{session.role}</strong> ({session.difficulty})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewReport(sessionId)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-600/25 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Full Transcript & Report</span>
          </button>
          <button
            onClick={onStartAnother}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            Start Another
          </button>
        </div>
      </div>

      {/* Main Score Overview: Gauge + Dimensional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Overall Circular Score Gauge */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center">
          <ScoreGauge score={evaluation.overallScore} size={200} strokeWidth={16} />
          <p className="text-xs text-slate-400 max-w-xs mt-4 leading-relaxed">
            Composite score weighted against technical precision, structural problem solving, and clarity of communication.
          </p>
        </div>

        {/* Right 2 Cols: Individual Dimension Progress Bars */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Competency Dimension Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {scoreMetrics.map((m, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">{m.label}</span>
                  <span className={`font-mono font-bold ${m.color}`}>{m.raw}/10</span>
                </div>
                <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${m.barBg} transition-all duration-1000 rounded-full`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Four Core AI Feedback Pillars: Strengths, Areas for Improvement, Skill Gaps, Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              ✓
            </div>
            <h3>Demonstrated Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {evaluation.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="text-emerald-400 mt-0.5">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              ▲
            </div>
            <h3>Areas for Improvement</h3>
          </div>
          <ul className="space-y-2.5">
            {evaluation.weaknesses.map((weak, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Skill Gaps */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              ✕
            </div>
            <h3>Identified Skill Gaps</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {evaluation.skillGaps.map((gap, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold"
              >
                {gap}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            These technical competencies had incomplete explanations or were missed when challenged with edge cases.
          </p>
        </div>

        {/* Personalized Recommendations */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              ★
            </div>
            <h3>Personalized Recommendations</h3>
          </div>
          <ul className="space-y-2.5">
            {evaluation.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="text-blue-400 mt-0.5 font-bold">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-slate-800 flex justify-center gap-4">
        <button
          onClick={onReturnDashboard}
          className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors"
        >
          Return to Dashboard
        </button>
        <button
          onClick={() => onViewReport(sessionId)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          Open Complete Interview Report Dossier
        </button>
      </div>
    </div>
  );
};

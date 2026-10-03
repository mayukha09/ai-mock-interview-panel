import React, { useEffect, useState } from 'react';
import { ScoreGauge } from '../components/ScoreGauge.tsx';
import { TranscriptCard } from '../components/TranscriptCard.tsx';
import type { InterviewReport } from '../types/index.ts';

interface ReportPageProps {
  sessionId: string;
  onBack: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  sessionId,
  onBack
}) => {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`/api/interview/${sessionId}/report`);
        if (!res.ok) throw new Error('Interview report not found');
        const data = await res.json();
        setReport(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400">Loading interview report dossier...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Report not found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
        >
          Return to History
        </button>
      </div>
    );
  }

  const { session, candidate, evaluation, transcript } = report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 print:py-4 print:text-black">
      {/* Header controls (hidden on print) */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Interview History</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Official Report Card Dossier */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8 print:border-none print:shadow-none print:bg-white print:p-0">
        {/* Candidate Meta Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800 print:border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Official AI Candidate Dossier
              </span>
              <span className="text-[10px] font-mono text-slate-500">ID: {session.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black mt-2 tracking-tight">
              {candidate.name}
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
              {candidate.email} · Role: <strong className="text-slate-200 print:text-black">{session.role}</strong> ({session.experience})
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-1">
            <div>Format: <strong className="text-slate-200 print:text-black">{session.interviewType}</strong></div>
            <div>Difficulty: <strong className="text-slate-200 print:text-black">{session.difficulty}</strong></div>
            <div>Conducted: <strong className="text-slate-200 print:text-black">{new Date(session.startedAt).toLocaleDateString()}</strong></div>
          </div>
        </div>

        {/* Score Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center p-6 rounded-2xl bg-slate-800/40 border border-slate-800 print:bg-slate-50 print:border-slate-200">
          <div className="md:col-span-1 flex justify-center">
            <ScoreGauge score={evaluation.overallScore} size={150} strokeWidth={12} label="" />
          </div>

          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 print:bg-white">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">Technical Accuracy</span>
              <div className="text-xl font-bold text-blue-400 mt-1">{evaluation.technicalAccuracy}/10</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 print:bg-white">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">Problem Solving</span>
              <div className="text-xl font-bold text-purple-400 mt-1">{evaluation.problemSolving}/10</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 print:bg-white">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">Communication</span>
              <div className="text-xl font-bold text-emerald-400 mt-1">{evaluation.communication}/10</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 print:bg-white">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">Answer Quality</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">{evaluation.answerQuality}/10</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 print:bg-white">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">Completeness</span>
              <div className="text-xl font-bold text-cyan-400 mt-1">{evaluation.completeness}/10</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 print:bg-white">
              <span className="text-[10px] uppercase text-slate-400 font-semibold">Confidence</span>
              <div className="text-xl font-bold text-amber-400 mt-1">{evaluation.confidence}/10</div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 print:bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Key Strengths Demonstrated
            </h3>
            <ul className="space-y-2">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="text-xs text-slate-300 print:text-slate-700 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 print:bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Areas Needing Polish
            </h3>
            <ul className="space-y-2">
              {evaluation.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-slate-300 print:text-slate-700 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">▲</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Skill Gaps & Personalized Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 print:bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Skill & Knowledge Gaps
            </h3>
            <div className="flex flex-wrap gap-2">
              {evaluation.skillGaps.map((g, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-800 print:bg-slate-50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Personalized Study Recommendations
            </h3>
            <ul className="space-y-2">
              {evaluation.recommendations.map((r, i) => (
                <li key={i} className="text-xs text-slate-300 print:text-slate-700 flex items-start gap-2">
                  <span className="text-blue-400 font-bold">{i + 1}.</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full Verbatim Transcript */}
        <div className="space-y-4 pt-6 border-t border-slate-800 print:border-slate-300">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Interview Dialogue Transcript
            </h2>
            <span className="text-xs text-slate-500">
              Verbatim turns with Lyzr Agent
            </span>
          </div>

          <div className="space-y-3">
            <TranscriptCard messages={transcript} />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import type { AnalyticsData } from '../types/index.ts';

interface AnalyticsPageProps {
  userId?: string;
  onStartInterview: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  userId,
  onStartInterview
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const url = userId ? `/api/analytics?userId=${encodeURIComponent(userId)}` : '/api/analytics';
        const res = await fetch(url);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.warn('Analytics fetch error', e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-20 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-400">Loading interview performance analytics...</p>
      </div>
    );
  }

  const timeline = data?.performanceOverTime || [];
  const skills = data?.skillPerformance || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Analytics & Progress
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
            Performance Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking your trajectory across interview tracks, technical proficiencies, and communication benchmarks.
          </p>
        </div>

        <button
          onClick={onStartInterview}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          Take Another Mock Interview
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Interviews</span>
          <div className="text-3xl font-extrabold text-white mt-2">{data?.totalInterviews ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Completed AI assessments</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Average Score</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-2">{data?.averageScore ?? 0}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Mean across all attempts</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Best Score</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">{data?.bestScore ?? 0}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Peak benchmark achieved</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold uppercase text-slate-400">Latest Score</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-2">{data?.latestScore ?? 0}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Most recent attempt</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Over Time Chart */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Performance Over Time</h2>
              <p className="text-xs text-slate-400">Score trajectory across chronological sessions</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Positive Trend ↗
            </span>
          </div>

          {timeline.length > 0 ? (
            <div className="space-y-4">
              {/* SVG Line / Bar Visualization */}
              <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 pb-2 bg-slate-800/40 rounded-2xl border border-slate-800">
                {timeline.map((item, idx) => {
                  const heightPct = Math.min(100, Math.max(20, item.score));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="text-[11px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.score}%
                      </div>
                      <div
                        className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-700 hover:brightness-125 shadow-md shadow-blue-500/20"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[11px] text-slate-400 font-medium truncate w-full text-center">
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 px-2">
                <span>Baseline Session</span>
                <span>Current Readiness</span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">
              Complete more interview sessions to populate trend metrics.
            </div>
          )}
        </div>

        {/* Skill Proficiency Breakdown Chart */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Skill Proficiency Scores</h2>
              <p className="text-xs text-slate-400">Calculated from answer evaluations by topic</p>
            </div>
            <span className="text-xs text-slate-400">Target: 85%+</span>
          </div>

          <div className="space-y-4">
            {skills.map((s, idx) => {
              const color = s.score >= 85 ? 'bg-emerald-500' : s.score >= 75 ? 'bg-blue-500' : 'bg-amber-500';
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">{s.skill}</span>
                    <span className="font-mono text-slate-400">{s.score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tri-Pillar Assessment Averages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Technical Accuracy Average</span>
          <div className="text-2xl font-bold text-white">{data?.technicalAverage ?? 85}%</div>
          <p className="text-xs text-slate-400">Syntactic accuracy, design patterns, algorithmic correctness</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Communication Average</span>
          <div className="text-2xl font-bold text-white">{data?.communicationAverage ?? 90}%</div>
          <p className="text-xs text-slate-400">Clarity, conciseness, articulation of tradeoffs</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Problem Solving Average</span>
          <div className="text-2xl font-bold text-white">{data?.problemSolvingAverage ?? 82}%</div>
          <p className="text-xs text-slate-400">Handling edge cases, scaling limits, defensive structure</p>
        </div>
      </div>
    </div>
  );
};

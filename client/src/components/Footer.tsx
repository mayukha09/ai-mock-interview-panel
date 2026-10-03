import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>AI Mock Interview Panel · Powered by <strong className="text-slate-200">Lyzr Agent Studio</strong></span>
        </div>

        <div className="flex items-center gap-6">
          <span>React & TypeScript</span>
          <span>•</span>
          <span>Node.js REST API</span>
          <span>•</span>
          <span>Adaptive Question Engine</span>
          <span>•</span>
          <span>SQLite Database</span>
        </div>

        <p className="text-slate-500">
          Built for Hackathon Demonstration · Designed for realistic AI hiring assessments
        </p>
      </div>
    </footer>
  );
};

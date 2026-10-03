import React from 'react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  candidateName: string;
  hasActiveSession: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  candidateName,
  hasActiveSession
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                AI Mock Interview Panel
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Lyzr Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 -mt-0.5 hidden sm:block">Adaptive AI Interview System</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('setup')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'setup' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            New Interview
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'history' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            History
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'analytics' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'profile' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {hasActiveSession && currentView !== 'room' && (
            <button
              onClick={() => onNavigate('room')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Resume Interview
            </button>
          )}

          <div 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-600 cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              {candidateName ? candidateName[0].toUpperCase() : 'M'}
            </div>
            <span className="text-sm font-medium text-slate-200 hidden sm:inline">
              {candidateName || 'Mayukha'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

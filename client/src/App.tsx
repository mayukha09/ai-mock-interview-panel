import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { SetupPage } from './pages/SetupPage.tsx';
import { InterviewRoomPage } from './pages/InterviewRoomPage.tsx';
import { ResultsPage } from './pages/ResultsPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { ReportPage } from './pages/ReportPage.tsx';
import type { User, CandidateProfile, InterviewSession, AnalyticsData } from './types/index.ts';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [user, setUser] = useState<User | null>({
    id: 'user_demo_mayukha',
    name: 'Mayukha',
    email: 'mayukhatokala@gmail.com',
    createdAt: new Date().toISOString()
  });
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [initialQuestion, setInitialQuestion] = useState<string>('');
  const [selectedReportSessionId, setSelectedReportSessionId] = useState<string | null>(null);

  // Load initial candidate profile and analytics
  useEffect(() => {
    async function loadInitialData() {
      try {
        const profRes = await fetch('/api/profile?email=mayukhatokala@gmail.com');
        if (profRes.ok) {
          const profData = await profRes.json();
          if (profData.user) setUser(profData.user);
          if (profData.profile) setProfile(profData.profile);
        }

        const analyticsRes = await fetch('/api/analytics');
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }
      } catch (e) {
        console.warn('Initial data load error:', e);
      }
    }
    loadInitialData();
  }, []);

  const handleInterviewStarted = (data: {
    sessionId: string;
    session: InterviewSession;
    initialQuestion: string;
  }) => {
    setActiveSession(data.session);
    setInitialQuestion(data.initialQuestion);
    setCurrentView('room');
  };

  const handleInterviewCompleted = (sessionId: string) => {
    setSelectedReportSessionId(sessionId);
    setActiveSession(null);
    setCurrentView('results');
    // Refresh analytics
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(() => {});
  };

  const handleViewReport = (sessionId: string) => {
    setSelectedReportSessionId(sessionId);
    setCurrentView('report');
  };

  const handleLoginSuccess = (loggedInUser: User, loggedInProfile: CandidateProfile) => {
    setUser(loggedInUser);
    setProfile(loggedInProfile);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        candidateName={user?.name || 'Mayukha'}
        hasActiveSession={Boolean(activeSession)}
      />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartInterview={() => setCurrentView('setup')}
            onViewDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            defaultEmail={user?.email}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            candidateName={user?.name || 'Mayukha'}
            analytics={analytics}
            onStartInterview={() => setCurrentView('setup')}
            onViewHistory={() => setCurrentView('history')}
            onViewAnalytics={() => setCurrentView('analytics')}
          />
        )}

        {currentView === 'profile' && (
          <ProfilePage
            user={user}
            profile={profile}
            onProfileUpdated={setProfile}
          />
        )}

        {currentView === 'setup' && (
          <SetupPage
            defaultName={user?.name || 'Mayukha'}
            defaultEmail={user?.email || 'mayukhatokala@gmail.com'}
            onInterviewStarted={handleInterviewStarted}
          />
        )}

        {currentView === 'room' && activeSession && (
          <InterviewRoomPage
            session={activeSession}
            initialQuestion={initialQuestion}
            onInterviewCompleted={handleInterviewCompleted}
            onExit={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'results' && selectedReportSessionId && (
          <ResultsPage
            sessionId={selectedReportSessionId}
            onViewReport={handleViewReport}
            onStartAnother={() => setCurrentView('setup')}
            onReturnDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsPage
            userId={user?.id}
            onStartInterview={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'history' && (
          <HistoryPage
            userId={user?.id}
            onViewReport={handleViewReport}
            onStartInterview={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'report' && selectedReportSessionId && (
          <ReportPage
            sessionId={selectedReportSessionId}
            onBack={() => setCurrentView('history')}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

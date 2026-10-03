import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../hooks/useVoice.ts';
import { AudioVisualizer } from '../components/AudioVisualizer.tsx';
import { TranscriptCard } from '../components/TranscriptCard.tsx';
import type { InterviewSession, Message } from '../types/index.ts';

interface InterviewRoomPageProps {
  session: InterviewSession;
  initialQuestion?: string;
  onInterviewCompleted: (sessionId: string) => void;
  onExit: () => void;
}

export const InterviewRoomPage: React.FC<InterviewRoomPageProps> = ({
  session,
  initialQuestion,
  onInterviewCompleted,
  onExit
}) => {
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(session.currentQuestion || 1);
  const [currentQuestionText, setCurrentQuestionText] = useState<string>(
    initialQuestion || 'Welcome! Preparing your first question...'
  );
  const [candidateInput, setCandidateInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>((session.duration || 15) * 60);

  // Voice capabilities
  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    isSpeaking,
    speakText,
    stopSpeaking,
    isSupported: voiceSupported
  } = useVoice();

  // Synchronize speech transcript into candidateInput
  useEffect(() => {
    if (transcript) {
      setCandidateInput(prev => {
        if (!prev) return transcript;
        return `${prev} ${transcript}`;
      });
      setTranscript('');
    }
  }, [transcript, setTranscript]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize or fetch session messages
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/interview/${session.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
            const lastAiMsg = [...data.messages].reverse().find((m: any) => m.sender === 'interviewer');
            if (lastAiMsg) {
              setCurrentQuestionText(lastAiMsg.message);
              setCurrentQuestionNumber(lastAiMsg.questionNumber || session.currentQuestion);
            }
          } else if (initialQuestion) {
            setMessages([
              {
                id: `init_${Date.now()}`,
                sessionId: session.id,
                sender: 'interviewer',
                message: initialQuestion,
                questionNumber: 1,
                timestamp: new Date().toISOString()
              }
            ]);
          }
        }
      } catch (e) {
        console.warn('Could not load session state', e);
      }
    }
    loadSession();
  }, [session.id, initialQuestion]);

  const handleSubmitAnswer = async () => {
    if (!candidateInput.trim()) {
      setErrorMsg('Please enter or speak your answer before submitting.');
      return;
    }

    if (isListening) {
      stopListening();
    }

    const answer = candidateInput.trim();
    setCandidateInput('');
    setErrorMsg(null);
    setIsAnalyzing(true);

    // Optimistically record candidate answer in local state
    const optimisticCandidateMsg: Message = {
      id: `local_${Date.now()}`,
      sessionId: session.id,
      sender: 'candidate',
      message: answer,
      questionNumber: currentQuestionNumber,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticCandidateMsg]);

    try {
      const res = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          message: answer
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit response to Lyzr Agent');

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sessionId: session.id,
        sender: 'interviewer',
        message: data.response,
        questionNumber: data.currentQuestion,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
      setCurrentQuestionText(data.response);
      setCurrentQuestionNumber(data.currentQuestion);

      // Auto-read question aloud if speech synthesis is available
      if (voiceSupported) {
        speakText(data.response);
      }

      if (data.isCompleted) {
        await handleFinishInterview();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to the AI interviewer. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinishInterview = async () => {
    stopSpeaking();
    if (isListening) stopListening();

    try {
      const res = await fetch('/api/interview/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id })
      });
      if (!res.ok) throw new Error('Failed to end interview');
      onInterviewCompleted(session.id);
    } catch (err: any) {
      alert('Error finalizing evaluation: ' + err.message);
      onInterviewCompleted(session.id);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.round(
    (currentQuestionNumber / (session.questionCount || 10)) * 100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            Q{currentQuestionNumber}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">AI Mock Interview Panel</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{session.role}</span>
              <span>•</span>
              <span className="text-blue-400">{session.interviewType}</span>
            </div>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-xs font-mono font-bold ${secondsRemaining < 180 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
              {formatTimer(secondsRemaining)}
            </span>
          </div>

          <button
            onClick={() => setShowEndModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>Question {currentQuestionNumber} of {session.questionCount}</span>
          <span>{progressPercentage}% Completed</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Interview Area + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question Card + Answer Area + Transcript */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-ping"></span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Lyzr AI Interviewer</span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Adaptive Panel
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Assessing {session.role} ({session.difficulty})</p>
                </div>
              </div>

              {/* TTS Listen Button */}
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speakText(currentQuestionText)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300 animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isSpeaking ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
                <span>{isSpeaking ? 'Pause Audio' : 'Listen Question'}</span>
              </button>
            </div>

            {/* Speaking animation bars */}
            {isSpeaking && (
              <div className="mb-4">
                <AudioVisualizer isActive={true} color="bg-purple-500" />
              </div>
            )}

            {/* Question Content */}
            <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
              {currentQuestionText}
            </div>
          </div>

          {/* AI Analyzing Feedback Indicator */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-indigo-300 text-xs font-semibold animate-pulse shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <span>AI is analyzing your answer & formulating an adaptive follow-up...</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Reasoning Turn
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                onClick={handleSubmitAnswer}
                className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30"
              >
                Retry
              </button>
            </div>
          )}

          {/* Candidate Answer Section */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Answer
                </span>
                {isListening && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Recording Live Speech...
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400">
                {candidateInput.trim().split(/\s+/).filter(Boolean).length} words
              </div>
            </div>

            {/* Visualizer when recording candidate voice */}
            {isListening && (
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                <AudioVisualizer isActive={true} color="bg-rose-500" />
              </div>
            )}

            <textarea
              rows={5}
              value={candidateInput}
              onChange={e => setCandidateInput(e.target.value)}
              placeholder="Type your response here, or click the microphone to speak naturally. Lyzr Agent adapts dynamically based on your depth..."
              disabled={isAnalyzing}
              className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 leading-relaxed"
            />

            {/* Voice & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {voiceSupported ? (
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isAnalyzing}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    <span>{isListening ? 'Stop Recording' : 'Voice Input (Mic)'}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">
                    Voice input unsupported in this browser (text fallback active).
                  </span>
                )}

                {candidateInput && (
                  <button
                    type="button"
                    onClick={() => setCandidateInput('')}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isAnalyzing || !candidateInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                <span>Submit Answer</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Transcript
              </h3>
              <span className="text-[11px] text-slate-500">
                {messages.length} exchanges recorded
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
              <TranscriptCard messages={messages} onSpeak={speakText} isSpeaking={isSpeaking} />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Round Status & Skills Being Evaluated */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
              Session Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Current Round</span>
                <span className="font-semibold text-white">Q{currentQuestionNumber} of {session.questionCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Interview Track</span>
                <span className="font-semibold text-blue-400">{session.interviewType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Difficulty</span>
                <span className={`font-semibold ${
                  session.difficulty === 'Easy' ? 'text-emerald-400' : session.difficulty === 'Medium' ? 'text-blue-400' : 'text-purple-400'
                }`}>
                  {session.difficulty}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Target Role</span>
                <span className="font-semibold text-white">{session.role}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Experience</span>
                <span className="font-semibold text-white">{session.experience}</span>
              </div>
            </div>

            {/* Skills Being Evaluated */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Skills Being Evaluated
              </span>
              <div className="flex flex-wrap gap-1.5">
                {session.skills && session.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Adaptive Engine Note */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Adaptive Agentic Mode</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The interviewer observes your answer depth, edge cases, and reasoning. If an answer lacks critical technical detail, expect a targeted follow-up!
            </p>
          </div>
        </div>
      </div>

      {/* End Interview Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Conclude Mock Interview?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ending the interview now will finalize your session and trigger a structured AI evaluation based on the dialogue completed so far.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Continue Interview
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  handleFinishInterview();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                Finalize & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

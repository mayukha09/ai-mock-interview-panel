import React from 'react';
import type { Message } from '../types/index.ts';

interface TranscriptCardProps {
  messages: Message[];
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  messages,
  onSpeak,
  isSpeaking
}) => {
  if (!messages || messages.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <svg className="w-10 h-10 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm font-medium">Conversation dialogue will appear here once the interview starts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((m, idx) => {
        const isAI = m.sender === 'interviewer';
        return (
          <div
            key={m.id || idx}
            className={`flex gap-3 p-4 rounded-xl border ${
              isAI 
                ? 'bg-slate-800/80 border-slate-700/80' 
                : 'bg-blue-950/30 border-blue-900/40 ml-4'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-xs ${
                isAI 
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isAI ? 'AI' : 'YOU'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isAI ? 'text-blue-400' : 'text-emerald-400'
                }`}>
                  {isAI ? 'Lyzr AI Interviewer' : 'Candidate Answer'}
                  {m.questionNumber ? ` · Question ${m.questionNumber}` : ''}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {isAI && onSpeak && (
                    <button
                      onClick={() => onSpeak(m.message)}
                      title="Listen aloud"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {m.message}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

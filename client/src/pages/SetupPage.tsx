import React, { useState } from 'react';
import type { InterviewType, DifficultyLevel } from '../types/index.ts';

interface SetupPageProps {
  defaultName?: string;
  defaultEmail?: string;
  onInterviewStarted: (sessionData: any) => void;
}

export const SetupPage: React.FC<SetupPageProps> = ({
  defaultName = 'Mayukha',
  defaultEmail = 'mayukhatokala@gmail.com',
  onInterviewStarted
}) => {
  const [candidateName, setCandidateName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [role, setRole] = useState('Software Developer');
  const [experience, setExperience] = useState('Fresher');
  const [skills, setSkills] = useState('Python, Java, SQL, HTML, CSS, JavaScript');
  const [interviewType, setInterviewType] = useState<InterviewType>('Technical + Behavioral');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [duration, setDuration] = useState<number>(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interviewTypes: InterviewType[] = [
    'Technical',
    'Behavioral',
    'HR',
    'System Design',
    'Domain Specific',
    'Technical + Behavioral'
  ];

  const difficulties: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !email.trim() || !role.trim()) {
      setError('Please fill in candidate name, email, and target role.');
      return;
    }

    setLoading(true);
    setError(null);

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          email: email.trim(),
          role: role.trim(),
          experience,
          skills: skillsArray,
          interviewType,
          difficulty,
          questionCount: Number(questionCount),
          duration: Number(duration)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start interview');
      onInterviewStarted(data);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to Lyzr Agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaults = () => {
    setCandidateName('Mayukha');
    setEmail('mayukhatokala@gmail.com');
    setRole('Software Developer');
    setExperience('Fresher');
    setSkills('Python, Java, SQL, HTML, CSS, JavaScript');
    setInterviewType('Technical + Behavioral');
    setDifficulty('Medium');
    setQuestionCount(10);
    setDuration(15);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Session Configuration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              AI Interview Setup
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters for the adaptive Lyzr Agent mock interview panel.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDefaults}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Reset Demo Defaults
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={handleSubmit}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold"
            >
              Retry
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Candidate Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Candidate Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Candidate Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Row 2: Target Role & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Target Job Role
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                required
                placeholder="e.g. Software Developer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={e => setExperience(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Fresher">Fresher (0 - 1 years)</option>
                <option value="Junior">Junior (1 - 3 years)</option>
                <option value="Mid-Level">Mid-Level (3 - 5 years)</option>
                <option value="Senior">Senior (5+ years)</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Technical Skills (comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="Python, Java, SQL, HTML, CSS, JavaScript"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Row 3: Interview Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Interview Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {interviewTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInterviewType(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    interviewType === type
                      ? 'bg-blue-600/30 border-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Difficulty, Question Count, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : diff === 'Medium'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Questions: <span className="text-white font-bold">{questionCount}</span>
              </label>
              <input
                type="range"
                min={3}
                max={15}
                step={1}
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>3 (Quick)</span>
                <span>10 (Standard)</span>
                <span>15 (Deep)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Duration: <span className="text-white font-bold">{duration} min</span>
              </label>
              <select
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes (Standard)</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-6 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Connecting to Lyzr Agent & Generating Question 1...</span>
                </>
              ) : (
                <>
                  <span>Start AI Interview</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

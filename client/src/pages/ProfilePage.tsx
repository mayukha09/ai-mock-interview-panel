import React, { useState } from 'react';
import type { CandidateProfile, User } from '../types/index.ts';

interface ProfilePageProps {
  user: User | null;
  profile: CandidateProfile | null;
  onProfileUpdated: (updated: CandidateProfile) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  profile,
  onProfileUpdated
}) => {
  const [role, setRole] = useState(profile?.role || 'Software Developer');
  const [experience, setExperience] = useState(profile?.experience || 'Fresher');
  const [skillsStr, setSkillsStr] = useState((profile?.skills || ['Python', 'SQL', 'JavaScript']).join(', '));
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccessMsg(null);

    const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role,
          experience,
          skills: skillsArray
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      onProfileUpdated(data.profile);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-600/30">
            {user?.name ? user.name[0].toUpperCase() : 'M'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name || 'Mayukha'}</h1>
            <p className="text-sm text-slate-400">{user?.email || 'mayukhatokala@gmail.com'}</p>
            <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Active Candidate
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Target Job Role
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Experience Level
            </label>
            <select
              value={experience}
              onChange={e => setExperience(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="Fresher">Fresher (0 - 1 years)</option>
              <option value="Junior">Junior (1 - 3 years)</option>
              <option value="Mid-Level">Mid-Level (3 - 5 years)</option>
              <option value="Senior">Senior (5+ years)</option>
              <option value="Lead / Staff">Lead / Staff Architect</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Technical Skills (comma-separated)
            </label>
            <textarea
              rows={3}
              value={skillsStr}
              onChange={e => setSkillsStr(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              These skills will guide the Lyzr Agent in selecting targeted technical questions and evaluation dimensions.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

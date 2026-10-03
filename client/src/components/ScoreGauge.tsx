import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 180,
  strokeWidth = 14,
  label = 'Overall Score',
  sublabel
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference - (clamped / 100) * circumference;

  let color = '#3b82f6'; // blue
  let grade = 'Proficient';
  let badgeBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';

  if (clamped >= 85) {
    color = '#10b981'; // emerald
    grade = 'Strong Hire';
    badgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (clamped >= 70) {
    color = '#3b82f6'; // blue
    grade = 'Pass / Ready';
    badgeBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  } else if (clamped >= 50) {
    color = '#f59e0b'; // amber
    grade = 'Needs Practice';
    badgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else {
    color = '#ef4444'; // red
    grade = 'Critical Gap';
    badgeBg = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Value */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white">
            {clamped}
            <span className="text-xl font-normal text-slate-400">%</span>
          </span>
          <span className={`text-[11px] font-semibold mt-1 px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
            {grade}
          </span>
        </div>
      </div>

      {label && <p className="mt-3 font-semibold text-slate-200 text-sm">{label}</p>}
      {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
};

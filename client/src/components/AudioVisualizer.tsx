import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  color?: string;
  bars?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  color = 'bg-blue-500',
  bars = 16
}) => {
  return (
    <div className="flex items-center justify-center gap-1 h-8 px-2">
      {Array.from({ length: bars }).map((_, i) => {
        const delays = ['0ms', '150ms', '300ms', '450ms', '200ms', '350ms', '100ms', '250ms'];
        const delay = delays[i % delays.length];
        return (
          <div
            key={i}
            className={`w-1 rounded-full ${color} transition-all duration-300 ${
              isActive ? 'animate-pulse' : 'h-1.5 opacity-30'
            }`}
            style={{
              height: isActive ? `${Math.max(20, (Math.sin(i * 0.8) * 0.5 + 0.5) * 100)}%` : '6px',
              animationDelay: delay
            }}
          />
        );
      })}
    </div>
  );
};

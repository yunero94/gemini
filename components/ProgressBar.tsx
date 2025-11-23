import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  colorClass?: string;
  heightClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  colorClass = "bg-primary",
  heightClass = "h-4"
}) => {
  const percentage = total === 0 ? 0 : Math.min(100, (current / total) * 100);
  const isComplete = percentage === 100;
  
  return (
    <div className={`w-full ${heightClass} bg-zinc-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-zinc-800`}>
      <div 
        className={`
          h-full transition-all duration-1000 cubic-bezier(0.22, 1, 0.36, 1) relative
          ${isComplete ? 'bg-primary shadow-[0_0_15px_rgba(190,242,100,0.5)]' : colorClass}
        `}
        style={{ width: `${percentage}%` }}
      >
        {/* Diagonal lines pattern or shimmer */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%,rgba(0,0,0,0.1)_100%)] bg-[length:10px_10px]" />
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';

interface AdminLoadingScreenProps {
  onComplete?: () => void;
  targetProgress?: number;
  statusMessage?: string;
  isStandalone?: boolean;
}

export const AdminLoadingScreen: React.FC<AdminLoadingScreenProps> = ({
  onComplete,
  targetProgress = 100,
  isStandalone = false,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const intervalTime = 25; // Update every 25ms
    const totalSteps = 45; // ~1.15 seconds total smooth duration
    const stepIncrement = targetProgress / totalSteps;

    const timer = setInterval(() => {
      current += stepIncrement;
      if (current >= targetProgress) {
        current = targetProgress;
        setProgress(Math.round(current));
        clearInterval(timer);
        if (onComplete && targetProgress >= 100) {
          setTimeout(() => {
            onComplete();
          }, 200);
        }
      } else {
        const jitter = (Math.random() - 0.5) * 1.5;
        setProgress(Math.min(99, Math.max(0, Math.round(current + jitter))));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [targetProgress, onComplete]);

  const containerClasses = isStandalone
    ? 'min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4'
    : 'fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses} role="alert" aria-live="polite">
      <div className="w-full max-w-sm flex flex-col items-center justify-center space-y-6">
        <div className="text-4xl font-black text-white">
          {progress}%
        </div>
        
        {/* Simple Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

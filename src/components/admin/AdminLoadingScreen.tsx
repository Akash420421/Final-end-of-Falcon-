import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Cpu, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFalconStore } from '../../context/StoreContext';

interface AdminLoadingScreenProps {
  onComplete?: () => void;
  targetProgress?: number;
  statusMessage?: string;
  isStandalone?: boolean;
}

export const AdminLoadingScreen: React.FC<AdminLoadingScreenProps> = ({
  onComplete,
  targetProgress = 100,
  statusMessage,
  isStandalone = false,
}) => {
  const { companyDetails } = useFalconStore();
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
        // Random micro-jitter to make it feel like genuine network/module loading
        const jitter = (Math.random() - 0.5) * 1.5;
        setProgress(Math.min(99, Math.max(0, Math.round(current + jitter))));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [targetProgress, onComplete]);

  // Determine stage message
  const getStageInfo = (pct: number) => {
    if (statusMessage) return { label: statusMessage, icon: Sparkles };
    if (pct < 25) {
      return { label: 'Authenticating administrator credentials...', icon: ShieldCheck };
    }
    if (pct < 55) {
      return { label: 'Loading Falcon Admin Core & UI engine...', icon: Cpu };
    }
    if (pct < 85) {
      return { label: 'Connecting to real-time storage & databases...', icon: Database };
    }
    if (pct < 100) {
      return { label: 'Finalizing security tokens & permissions...', icon: Sparkles };
    }
    return { label: 'Access granted! Welcome, Administrator.', icon: CheckCircle2 };
  };

  const stage = getStageInfo(progress);
  const StageIcon = stage.icon;

  const containerClasses = isStandalone
    ? 'min-h-screen w-full bg-[#0B0C16] text-white flex items-center justify-center p-4'
    : 'fixed inset-0 z-[100] bg-[#0B0C16]/95 backdrop-blur-xl text-white flex items-center justify-center p-4';

  return (
    <div className={containerClasses} role="alert" aria-live="polite">
      {/* Background radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E0183D]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-[#131528]/90 border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Brand Badge */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#E0183D]/20 border border-[#E0183D]/40 flex items-center justify-center text-[#E0183D] shadow-lg shadow-red-950/50">
              <ShieldCheck className="w-8 h-8 animate-pulse" />
            </div>
            {/* Spinning orbital ring */}
            <div className="absolute -inset-2 border-2 border-dashed border-[#E0183D]/30 rounded-3xl animate-spin" style={{ animationDuration: '8s' }} />
          </div>

          <div className="mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E0183D] bg-red-950/50 px-2.5 py-1 rounded-full border border-red-800/40">
              {companyDetails?.companyName || 'VERMA ENTERPRISES'} • SECURE PORTAL
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1.5 tracking-tight">
              Loading Falcon Admin Panel
            </h2>
          </div>
        </div>

        {/* Dynamic Percentage Display */}
        <div className="space-y-3 py-2">
          <div className="flex items-baseline justify-center gap-1">
            <motion.span
              key={progress}
              initial={{ opacity: 0.7, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#E0183D]"
            >
              {progress}
            </motion.span>
            <span className="text-2xl font-bold text-[#E0183D]">%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-[#E0183D] to-red-500 rounded-full shadow-lg shadow-red-500/50"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>

        {/* Dynamic Status Text with Icon */}
        <div className="flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-300 min-h-[24px]">
          <StageIcon className="w-4 h-4 text-[#E0183D] shrink-0 animate-spin-slow" />
          <span className="truncate">{stage.label}</span>
        </div>

        {/* Security badge at bottom */}
        <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>SHA-256 Verified Session • Zero-Friction Code Splitting</span>
        </div>
      </div>
    </div>
  );
};

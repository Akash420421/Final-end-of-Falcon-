import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, ShieldAlert, KeyRound, Clock } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';
import {
  getLoginRateLimitState,
  recordFailedLoginAttempt,
  clearLoginRateLimit,
} from '../utils/security';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onLoginSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onLoginSuccess,
}) => {
  const { loginAdmin } = useFalconStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Rate limiter check on open & ticker
  useEffect(() => {
    if (!isOpen) return;
    const rateState = getLoginRateLimitState();
    if (rateState.isLocked) {
      setLockoutSeconds(rateState.remainingSeconds);
    } else {
      setLockoutSeconds(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check rate limit lockout
    const rateState = getLoginRateLimitState();
    if (rateState.isLocked) {
      setLockoutSeconds(rateState.remainingSeconds);
      setErrorMessage(`Security lockout: Too many failed attempts. Try again in ${rateState.remainingSeconds}s.`);
      return;
    }

    setIsLoggingIn(true);

    try {
      const success = await loginAdmin(email.trim(), password);
      if (success) {
        clearLoginRateLimit();
        setEmail('');
        setPassword('');
        if (onSuccess) onSuccess();
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        const afterFail = recordFailedLoginAttempt();
        if (afterFail.isLocked) {
          setLockoutSeconds(afterFail.remainingSeconds);
          setErrorMessage(`Security lockout: 5 failed attempts. Please wait ${afterFail.remainingSeconds}s.`);
        } else {
          setErrorMessage(`Invalid Email or Password. (${afterFail.attemptsLeft} attempt${afterFail.attemptsLeft === 1 ? '' : 's'} remaining)`);
        }
      }
    } catch {
      setErrorMessage('Login verification failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isLockedOut = lockoutSeconds > 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-center mx-auto text-[#E0183D] shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-extrabold tracking-widest text-[#E0183D] uppercase block">
            VERMA ENTERPRISES • ADMIN PORTAL
          </span>
          <h2 className="text-2xl font-black text-[#101124]">
            Admin Authentication
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Authorized administrator login required to edit site content, products, logos & settings.
          </p>
        </div>

        {/* Lockout or Error Alert */}
        {isLockedOut ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs font-bold text-amber-700">
            <Clock className="w-4 h-4 shrink-0 text-amber-600 animate-pulse" />
            <span>Rate limit active: Try again in {lockoutSeconds}s</span>
          </div>
        ) : errorMessage ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs font-bold text-red-600">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                disabled={isLockedOut || isLoggingIn}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#E0183D] focus:ring-1 focus:ring-[#E0183D] transition disabled:opacity-50"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-600 tracking-wider">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                disabled={isLockedOut || isLoggingIn}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#E0183D] focus:ring-1 focus:ring-[#E0183D] transition disabled:opacity-50"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn || isLockedOut}
            className="w-full bg-[#101124] hover:bg-[#1a1c38] text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-98 text-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </span>
            ) : isLockedOut ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Locked ({lockoutSeconds}s)</span>
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#E0183D]" />
                <span>Login to Admin Panel</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

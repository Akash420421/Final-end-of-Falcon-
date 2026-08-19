import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoggingIn(true);

    try {
      const success = await loginAdmin(email, password);
      if (success) {
        setEmail('');
        setPassword('');
        if (onSuccess) onSuccess();
        if (onLoginSuccess) onLoginSuccess();
        onClose();
      } else {
        setErrorMessage('Invalid Email or Password. Access denied.');
      }
    } catch {
      setErrorMessage('Login verification failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

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

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs font-bold text-red-600">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#E0183D] focus:ring-1 focus:ring-[#E0183D] transition"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#E0183D] focus:ring-1 focus:ring-[#E0183D] transition"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#101124] hover:bg-[#1a1c38] text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-98 text-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
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

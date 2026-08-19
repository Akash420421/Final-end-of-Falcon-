import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Save, Lock, UserCheck } from 'lucide-react';

interface SecurityTabProps {
  adminEmail: string;
  onUpdateAdminAuth: (email: string, newPassword: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  adminEmail,
  onUpdateAdminAuth,
  onShowToast,
}) => {
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Admin email cannot be empty!');
      return;
    }
    if (password && password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (password && password !== confirmPassword) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateAdminAuth(email.trim(), password.trim());
      setPassword('');
      setConfirmPassword('');
      onShowToast('Admin login credentials updated & secured!');
    } catch (err: any) {
      alert('Failed to update credentials: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-rose-500" />
            Admin Security & Login Credentials
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Manage your administrative login email and secure SHA-256 access password.
          </p>
        </div>

        <div className="p-3.5 bg-rose-950/40 rounded-xl border border-rose-800/60 flex items-start gap-3 text-rose-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-white">Keep Your Credentials Safe</span>
            <p className="text-[11px] text-rose-300 mt-0.5 leading-relaxed">
              New passwords take effect immediately across all sessions. Write your new password down in a safe location.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              Admin Login Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              New Password (Min 6 chars)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to keep existing"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-black px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow transition min-h-[40px] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Update Login Credentials'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

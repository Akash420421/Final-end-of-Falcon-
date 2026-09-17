import React, { useState } from 'react';
import { ShieldCheck, Globe, LogOut, Save, Check, Loader2 } from 'lucide-react';

interface AdminHeaderProps {
  isFirebaseConnected: boolean;
  onClose: () => void;
  onLogout: () => void;
  onSaveAll?: () => Promise<void>;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isFirebaseConnected,
  onClose,
  onLogout,
  onSaveAll,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveClick = async () => {
    if (!onSaveAll || isSaving) return;
    setIsSaving(true);
    try {
      await onSaveAll();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="bg-[#101124] px-3 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 sticky top-0 z-40 shadow-xl">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 bg-[#E0183D] rounded-xl text-white shadow-md shrink-0">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h1 className="text-xs sm:text-base font-black text-white leading-tight">
            Falcon Admin Control
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border mt-0.5 ${
              isFirebaseConnected
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isFirebaseConnected ? 'Cloud Sync Active' : 'Connecting DB...'}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {onSaveAll && (
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95 min-h-[38px] border ${
              justSaved
                ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500'
                : isSaving
                ? 'bg-red-950 text-slate-300 border-red-800 cursor-wait'
                : 'bg-[#E0183D] hover:bg-[#c01534] text-white border-red-500/40'
            }`}
            title="Save all changes and sync with database"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span className="hidden sm:inline text-xs">Saving...</span>
                <span className="sm:hidden text-xs">Saving</span>
              </>
            ) : justSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline text-xs">All Saved!</span>
                <span className="sm:hidden text-xs">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline text-xs">Save All Changes</span>
                <span className="sm:hidden text-xs">Save All</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onClose}
          className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 sm:px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-700 shadow-sm active:scale-95 min-h-[38px]"
          title="Return to Main Website"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline text-xs">Back to Website</span>
          <span className="sm:hidden text-xs">Website</span>
        </button>

        <button
          onClick={onLogout}
          className="text-xs font-bold bg-red-950/80 hover:bg-red-900 text-red-300 px-2.5 sm:px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-red-900/80 shadow-sm active:scale-95 min-h-[38px]"
          title="Logout from Admin Panel"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline text-xs">Logout</span>
        </button>
      </div>
    </header>
  );
};

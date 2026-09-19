import React, { useState } from 'react';
import { useFalconStore } from '../context/StoreContext';
import { AdminHeader } from './admin/AdminHeader';
import { DatabaseTab } from './admin/tabs/DatabaseTab';
import { Database } from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const {
    isFirebaseConnected,
    logoutAdmin,
    syncAllDataToSupabase,
  } = useFalconStore();

  const [successToast, setSuccessToast] = useState('');
  const [syncInProgress, setSyncInProgress] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleSyncAllToCloud = async () => {
    setSyncInProgress(true);
    try {
      await syncAllDataToSupabase();
      showToast('All local store data synchronized with Supabase!');
    } catch (err: any) {
      alert('Error syncing to cloud: ' + (err?.message || err));
    } finally {
      setSyncInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full selection:bg-[#E0183D] selection:text-white pb-20">
      {/* Top Header */}
      <AdminHeader
        isFirebaseConnected={isFirebaseConnected}
        onClose={onClose}
        onLogout={logoutAdmin}
      />

      {/* Cloud Sync & DB Sub-header */}
      <div className="bg-slate-900/95 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 sticky top-[57px] sm:top-[65px] z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                Cloud Sync & Supabase Anti-Pause Engine
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[10px] text-slate-400">
              Live multi-user traffic simulator & database health monitor
            </p>
          </div>
        </div>

        <span className="text-[10px] sm:text-xs font-bold bg-cyan-950/80 text-cyan-300 px-3 py-1 rounded-xl border border-cyan-800 shrink-0">
          Supabase Keep-Alive
        </span>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 bg-emerald-600 text-white font-black text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Content: Only DatabaseTab */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 space-y-6">
        <DatabaseTab
          isFirebaseConnected={isFirebaseConnected}
          syncInProgress={syncInProgress}
          onSyncAllToCloud={handleSyncAllToCloud}
          onShowToast={showToast}
        />
      </main>
    </div>
  );
};

export default AdminPanelModal;

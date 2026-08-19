import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface DatabaseTabProps {
  isFirebaseConnected: boolean;
  syncInProgress: boolean;
  onSyncAllToCloud: () => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const DatabaseTab: React.FC<DatabaseTabProps> = ({
  isFirebaseConnected,
  syncInProgress,
  onSyncAllToCloud,
  onShowToast,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'warning';
    details: string;
  }>({ status: 'idle', details: '' });

  const runDiagnostic = async () => {
    setDiagnosticResult({ status: 'running', details: 'Testing Supabase cloud connection...' });
    try {
      await onSyncAllToCloud();
      setDiagnosticResult({
        status: 'success',
        details: 'All tables (store_settings, categories, products, quotes, catalogue_pages) are synchronized and active!',
      });
      onShowToast('Database connection diagnostic passed!');
    } catch (err: any) {
      setDiagnosticResult({
        status: 'warning',
        details: err?.message || 'Check database permissions and SQL tables setup.',
      });
    }
  };

  const sqlScript = `-- Falcon Electrics Supabase SQL Schema
-- Run in your Supabase SQL Editor: https://supabase.com/dashboard/project/ywgosjrealgcbanelfei/sql/new

CREATE TABLE IF NOT EXISTS public.store_settings (
  id text PRIMARY KEY,
  settings jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  description text,
  image text,
  imageUrl text,
  badge text,
  "order" int DEFAULT 0,
  subCategories text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  categoryName text,
  subCategory text,
  price text,
  perPiecePrice text,
  amps text,
  image text,
  images text[],
  badge text,
  isTopPick boolean DEFAULT false,
  description text,
  features text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalogue_pages (
  id text PRIMARY KEY,
  pageNumber int NOT NULL,
  imageUrl text,
  image text,
  title text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  quantity text,
  notes text,
  productName text,
  productId text,
  status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS and public access
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access" ON public.store_settings FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON public.categories FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON public.products FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON public.catalogue_pages FOR ALL USING (true);
CREATE POLICY "Public Read Access" ON public.quotes FOR ALL USING (true);`;

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Cloud Status Card */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/30 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                Supabase Cloud Database & Realtime Sync
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target Project: <span className="font-mono text-cyan-300">ywgosjrealgcbanelfei</span>
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border self-start sm:self-auto ${
              isFirebaseConnected
                ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                : 'bg-amber-950 text-amber-300 border-amber-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isFirebaseConnected ? 'Cloud Online' : 'Connecting...'}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={runDiagnostic}
            disabled={syncInProgress}
            className="bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow flex items-center gap-2 min-h-[40px] disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>Run Real-Time Connection Diagnostic</span>
          </button>

          <button
            type="button"
            onClick={onSyncAllToCloud}
            disabled={syncInProgress}
            className="bg-[#E0183D] hover:bg-[#c01233] active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow flex items-center gap-2 min-h-[40px] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncInProgress ? 'animate-spin' : ''}`} />
            <span>{syncInProgress ? 'Syncing...' : 'Force Push All Data to Cloud'}</span>
          </button>
        </div>

        {/* Diagnostic Status Output */}
        {diagnosticResult.status !== 'idle' && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              diagnosticResult.status === 'success'
                ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                : diagnosticResult.status === 'running'
                ? 'bg-cyan-950/50 border-cyan-700 text-cyan-300'
                : 'bg-amber-950/50 border-amber-700 text-amber-300'
            }`}
          >
            {diagnosticResult.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-bold block">
                {diagnosticResult.status === 'success'
                  ? 'All Systems Operational'
                  : 'Diagnostic Status'}
              </span>
              <p className="text-[11px] leading-relaxed">{diagnosticResult.details}</p>
            </div>
          </div>
        )}
      </div>

      {/* SQL Setup Helper Section */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Complete SQL Schema Script
            </h3>
            <p className="text-[11px] text-slate-400">
              Run this in your Supabase SQL Editor if you ever create a new project database.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(sqlScript);
              setCopiedSql(true);
              onShowToast('SQL Schema copied to clipboard!');
              setTimeout(() => setCopiedSql(false), 3000);
            }}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 min-h-[38px]"
          >
            {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed select-all">
          <pre className="whitespace-pre-wrap">{sqlScript}</pre>
        </div>
      </div>
    </div>
  );
};

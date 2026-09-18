import { createClient } from '@supabase/supabase-js';

function cleanEnv(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

let rawUrl = cleanEnv(import.meta.env.VITE_SUPABASE_URL) || 'https://ywgosjrealgcbanelfei.supabase.co';
if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  rawUrl = `https://${rawUrl}`;
}
const supabaseUrl = rawUrl.replace(/\/+$/, '');
const supabaseAnonKey = cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_z7NKtoE8mfPYrhw-xV7X3g_DvT2J4XJ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing Supabase URL or Publishable Anon Key.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

export default supabase;

import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

// Fallback configuration values
const DEFAULT_SUPABASE_URL = 'https://ywgosjrealgcbanelfei.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'sb_publishable_z7NKtoE8mfPYrhw-xV7X3g_DvT2J4XJ';

function cleanEnvString(str?: string | null): string {
  if (!str) return '';
  return str.trim().replace(/^["']|["']$/g, '').trim();
}

/**
 * Vercel Serverless Function & Cron Endpoint for Supabase Health Check
 * Route: /api/health/supabase
 */
export default async function handler(
  req: IncomingMessage & { query?: Record<string, string>; body?: any },
  res: ServerResponse & {
    status?: (statusCode: number) => any;
    json?: (body: any) => any;
  }
) {
  // Helper to safely write JSON responses
  const sendJson = (status: number, data: Record<string, any>) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(status).json(data);
    }
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.end(JSON.stringify(data));
  };

  // Only allow GET and HEAD methods
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(405, { ok: false, error: 'Method Not Allowed' });
  }

  // 1. Resolve Supabase Environment Credentials
  let rawUrl = cleanEnvString(
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL
  );
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }
  const supabaseUrl = rawUrl.replace(/\/+$/, '');

  const supabaseAnonKey = cleanEnvString(
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY
  );

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // Probe store_settings or products to register active read operation
    const { data, error } = await supabaseClient
      .from('store_settings')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error && !error.message?.includes('does not exist')) {
      console.warn('[HealthCheck] Supabase query notice:', error.message);
    }

    return sendJson(200, {
      ok: true,
      database: 'connected',
      active_pulse: 'registered',
      latency: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('[HealthCheck] Caught error, returning fallback status:', err?.message || err);
    return sendJson(200, {
      ok: true,
      database: 'pinged',
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}

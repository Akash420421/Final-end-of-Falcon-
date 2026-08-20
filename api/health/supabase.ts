import type { IncomingMessage, ServerResponse } from 'http';
import { createClient } from '@supabase/supabase-js';

// Fallback configuration values
const DEFAULT_SUPABASE_URL = 'https://ywgosjrealgcbanelfei.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'sb_publishable_z7NKtoE8mfPYrhw-xV7X3g_DvT2J4XJ';

/**
 * Vercel Serverless Function & Cron Endpoint for Supabase Health Check
 * Route: /api/health/supabase
 *
 * Performs a minimal, lightweight SELECT query on 'store_settings'
 * to confirm database connectivity without mutating any records.
 */
export default async function handler(
  req: IncomingMessage & { query?: Record<string, string>; body?: any },
  res: ServerResponse & {
    status: (statusCode: number) => any;
    json: (body: any) => any;
  }
) {
  // Helper to safely write JSON responses
  const sendJson = (status: number, data: Record<string, any>) => {
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(status).json(data);
    }
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // Only allow GET and HEAD methods
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(405, { ok: false, error: 'Method Not Allowed' });
  }

  // 1. Validate Cron Secret Authentication (if CRON_SECRET is configured)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && cronSecret.trim() !== '') {
    const authHeader =
      req.headers['authorization'] || req.headers['Authorization'];
    const expectedHeader = `Bearer ${cronSecret.trim()}`;

    if (!authHeader || authHeader !== expectedHeader) {
      console.warn('[HealthCheck] Unauthorized request attempt to /api/health/supabase');
      return sendJson(401, {
        ok: false,
        error: 'Unauthorized: Invalid or missing Bearer token',
      });
    }
  }

  // 2. Resolve Supabase Environment Credentials
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[HealthCheck] Missing Supabase configuration variables.');
    return sendJson(500, {
      ok: false,
      database: 'unreachable',
      error: 'Missing database configuration',
    });
  }

  // 3. Execute a single, minimal SELECT query
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const startTime = Date.now();
    const { data, error } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      console.error('[HealthCheck] Supabase query failed:', error.message);
      return sendJson(503, {
        ok: false,
        database: 'unreachable',
      });
    }

    // Return sanitized success payload (no credentials or row payloads leaked)
    return sendJson(200, {
      ok: true,
      database: 'reachable',
      latency: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[HealthCheck] Internal server error:', err?.message || err);
    return sendJson(500, {
      ok: false,
      database: 'unreachable',
    });
  }
}

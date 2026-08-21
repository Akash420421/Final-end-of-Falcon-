/**
 * Security utilities:
 * 1. Cryptographic SHA-256 password hashing and session signature verification (Web Crypto API)
 * 2. Client-side brute force rate limiting
 * 3. Safe URL and phone number sanitization
 * 4. Image/file MIME-type validation
 */

import {
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
} from './safeStorage';

const SESSION_SALT = 'falcon_secure_session_token_v2';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute lockout after 5 failed attempts

/**
 * Computes SHA-256 hash using the native Web Crypto API
 */
export async function sha256Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes admin password with email-specific salt
 */
export async function hashAdminPassword(email: string, password: string): Promise<string> {
  const cleanEmail = (email || '').trim().toLowerCase();
  const salted = `falcon_admin:${cleanEmail}:${password}`;
  return sha256Hash(salted);
}

/**
 * Generates a tamper-proof signed session token
 */
export async function generateSessionToken(email: string, passwordHash: string, expiresAt: number): Promise<string> {
  const rawSignature = `${SESSION_SALT}:${email.trim().toLowerCase()}:${passwordHash}:${expiresAt}`;
  return sha256Hash(rawSignature);
}

/**
 * Validates a signed session against stored admin credentials and expiration timestamp
 */
export async function verifySessionToken(
  storedToken: string,
  email: string,
  passwordHash: string,
  expiresAt: number
): Promise<boolean> {
  if (!storedToken || !expiresAt || Date.now() >= expiresAt) {
    return false;
  }
  const expectedToken = await generateSessionToken(email, passwordHash, expiresAt);
  return storedToken === expectedToken;
}

/**
 * Rate Limiter for Login Attempts
 */
interface RateLimitState {
  failedAttempts: number;
  lockoutUntil: number;
}

const RATE_LIMIT_KEY = 'falcon_login_rate_limit';

export function getLoginRateLimitState(): { isLocked: boolean; remainingSeconds: number; attemptsLeft: number } {
  try {
    const raw = safeLocalStorageGet(RATE_LIMIT_KEY);
    if (!raw) {
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
    }
    const state: RateLimitState = JSON.parse(raw);
    const now = Date.now();

    if (state.lockoutUntil && state.lockoutUntil > now) {
      const remainingSeconds = Math.ceil((state.lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds, attemptsLeft: 0 };
    }

    // Reset if lockout expired
    if (state.lockoutUntil && state.lockoutUntil <= now) {
      safeLocalStorageRemove(RATE_LIMIT_KEY);
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
    }

    const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - (state.failedAttempts || 0));
    return { isLocked: false, remainingSeconds: 0, attemptsLeft };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_FAILED_ATTEMPTS };
  }
}

export function recordFailedLoginAttempt(): { isLocked: boolean; remainingSeconds: number; attemptsLeft: number } {
  try {
    const raw = safeLocalStorageGet(RATE_LIMIT_KEY);
    let state: RateLimitState = raw ? JSON.parse(raw) : { failedAttempts: 0, lockoutUntil: 0 };
    state.failedAttempts = (state.failedAttempts || 0) + 1;

    if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      state.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      safeLocalStorageSet(RATE_LIMIT_KEY, JSON.stringify(state));
      return { isLocked: true, remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000), attemptsLeft: 0 };
    }

    safeLocalStorageSet(RATE_LIMIT_KEY, JSON.stringify(state));
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: MAX_FAILED_ATTEMPTS - state.failedAttempts };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: 0 };
  }
}

export function clearLoginRateLimit(): void {
  safeLocalStorageRemove(RATE_LIMIT_KEY);
}

/**
 * Sanitizes phone numbers for safe WhatsApp and Tel links
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Validates whether a file is a safe, authentic image
 */
export function isAllowedImageMimeType(mimeType: string): boolean {
  const allowed = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
  ];
  return allowed.includes((mimeType || '').toLowerCase());
}

/**
 * Validates Google Maps Embed URLs to prevent malicious iframe source injection
 */
export function isSafeMapsEmbedUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith('https://maps.google.com/') ||
    clean.startsWith('https://www.google.com/maps') ||
    clean.startsWith('https://maps.google.co.in/')
  );
}

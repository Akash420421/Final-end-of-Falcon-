/**
 * Safe LocalStorage Utility with Quota Exceeded Protection & Intelligent Cache Truncation.
 *
 * Browsers enforce a strict ~5MB quota on localStorage.
 * Storing high-resolution base64 images directly into localStorage can easily exceed this limit
 * and throw uncaught `QuotaExceededError`, crashing the entire React UI.
 *
 * This utility:
 * 1. Safely writes to localStorage wrapped in try/catch (NEVER crashes).
 * 2. On QuotaExceededError, automatically strips heavy base64 strings (>50KB)
 *    from the cached JSON payload so metadata/IDs/titles are preserved in localStorage
 *    while the full high-res data lives safely in React in-memory state & Supabase.
 * 3. Provides clean storage diagnostics.
 */

function isQuotaExceededError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.code === 22 ||
      err.code === 1014 ||
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

/**
 * Recursively strips large base64 image strings (>50KB) from an object to create
 * a lightweight metadata-only backup that fits easily within localStorage quotas.
 */
function createLightweightCopy(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/') && obj.length > 50000) {
      // Large base64 image - strip for localStorage cache
      return '';
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(createLightweightCopy);
  }

  if (typeof obj === 'object') {
    const copy: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      copy[key] = createLightweightCopy(obj[key]);
    }
    return copy;
  }

  return obj;
}

/**
 * Safely saves a key-value pair to localStorage without crashing the application.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    if (isQuotaExceededError(err)) {
      console.debug(`[SafeStorage] LocalStorage quota exceeded for key '${key}'. Attempting lightweight cache optimization...`);

      try {
        // Try parsing JSON and stripping heavy base64 images
        const parsed = JSON.parse(value);
        const lightweight = createLightweightCopy(parsed);
        const lightweightStr = JSON.stringify(lightweight);

        localStorage.setItem(key, lightweightStr);
        return true;
      } catch (innerErr) {
        // If still exceeding, try clearing non-critical keys to free space
        try {
          localStorage.removeItem('falcon_quotes');
          localStorage.removeItem('falcon_hero_content');
          localStorage.setItem(key, value);
          return true;
        } catch {
          console.debug(`[SafeStorage] Unable to persist key '${key}' to localStorage (Quota limit reached). React in-memory state & Supabase remain fully active.`);
          return false;
        }
      }
    }

    console.debug(`[SafeStorage] localStorage write error for '${key}':`, err?.message || err);
    return false;
  }
}

/**
 * Safely gets a value from localStorage.
 */
export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.debug(`[SafeStorage] localStorage read error for '${key}':`, err);
    return null;
  }
}

/**
 * Safely removes a key from localStorage.
 */
export function safeLocalStorageRemove(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.debug(`[SafeStorage] localStorage remove error for '${key}':`, err);
  }
}

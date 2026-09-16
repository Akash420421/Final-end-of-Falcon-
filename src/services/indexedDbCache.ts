/**
 * IndexedDB Persistent Storage for Falcon Electrics Catalogue
 * 
 * Why IndexedDB?
 * - LocalStorage is hard-capped at 5MB across the entire domain.
 *   Large catalogue pages with high-resolution WebP/JPEG data (1-5MB) exceed this quota
 *   and cause LocalStorage to strip the base64 image strings.
 * - IndexedDB provides virtually unlimited storage (50MB - 1GB+) in all modern browsers
 *   (Chrome, Safari, Firefox, Edge, Android Chrome, iOS Safari).
 * - Allows 0ms instant retrieval of all 11+ catalogue pages with their full image data
 *   on every subsequent app reload or revisit.
 */

import { CataloguePage } from '../types';

const DB_NAME = 'falcon_store_cache_db';
const DB_VERSION = 1;
const STORE_NAME = 'catalogue_pages_store';
const KEY_NAME = 'cached_catalogue_pages';

// Fallback in-memory cache if IndexedDB is blocked (e.g., restricted private mode)
let memoryCataloguePagesCache: CataloguePage[] | null = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Saves all catalogue pages (including large base64/WebP images) safely into IndexedDB.
 */
export async function saveCataloguePagesToIdb(pages: CataloguePage[]): Promise<boolean> {
  if (!pages || pages.length === 0) return false;

  // Always update in-memory cache first
  memoryCataloguePagesCache = pages;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(pages, KEY_NAME);

      request.onsuccess = () => {
        db.close();
        resolve(true);
      };

      request.onerror = () => {
        db.close();
        resolve(false);
      };

      transaction.onabort = () => {
        db.close();
        resolve(false);
      };
    });
  } catch {
    // If IndexedDB fails, in-memory cache is already updated
    return false;
  }
}

/**
 * Retrieves cached catalogue pages from IndexedDB.
 * Returns null if no cached pages exist or if retrieval fails.
 */
export async function getCataloguePagesFromIdb(): Promise<CataloguePage[] | null> {
  // If in-memory cache is already populated with images, return immediately
  if (memoryCataloguePagesCache && memoryCataloguePagesCache.length > 0) {
    const hasImages = memoryCataloguePagesCache.some((p) => Boolean(p.imageUrl || p.image));
    if (hasImages) {
      return memoryCataloguePagesCache;
    }
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(KEY_NAME);

      request.onsuccess = () => {
        db.close();
        const result = request.result as CataloguePage[] | undefined;
        if (Array.isArray(result) && result.length > 0) {
          memoryCataloguePagesCache = result;
          resolve(result);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        db.close();
        resolve(memoryCataloguePagesCache);
      };
    });
  } catch {
    return memoryCataloguePagesCache;
  }
}

/**
 * Clears cached catalogue pages from IndexedDB.
 */
export async function clearCataloguePagesIdb(): Promise<void> {
  memoryCataloguePagesCache = null;
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(KEY_NAME);
    db.close();
  } catch {
    // Ignore error
  }
}

import { supabase } from '../supabase';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/safeStorage';

export const CACHE_META_KEY = 'falcon_cache_metadata';
export const CACHE_INITIALIZED_KEY = 'falcon_data_initialized';

export interface FreshnessMetadata {
  productsVersion: string | null;
  productsCount: number;
  latestProductUpdatedAt: string | null;
  latestProductId: string | null;
  categoriesCount: number;
  latestCategoryUpdatedAt: string | null;
  storeSettingsUpdatedAt: string | null;
  timestamp: number;
}

/**
 * Retrieves the locally cached freshness metadata from localStorage
 */
export function getCachedFreshnessMetadata(): FreshnessMetadata | null {
  try {
    const raw = safeLocalStorageGet(CACHE_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as FreshnessMetadata;
    }
  } catch {
    // corrupted json
  }
  return null;
}

/**
 * Saves the freshness metadata to localStorage
 */
export function setCachedFreshnessMetadata(meta: FreshnessMetadata): boolean {
  try {
    return safeLocalStorageSet(CACHE_META_KEY, JSON.stringify(meta));
  } catch {
    return false;
  }
}

/**
 * Fast-path: Fetches lightweight metadata from Supabase
 * Transmits < 400 bytes total over the network.
 * Returns null if network is offline or request fails.
 */
export async function fetchBackendFreshnessMetadata(): Promise<FreshnessMetadata | null> {
  try {
    const [productsRes, categoriesRes, settingsRes] = await Promise.allSettled([
      // 1. Products: exact count + newest updated item
      supabase
        .from('products')
        .select('id, updated_at', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .limit(1),

      // 2. Categories: exact count + newest updated item
      supabase
        .from('categories')
        .select('id, updated_at', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .limit(1),

      // 3. Store settings: updated_at + version marker
      supabase
        .from('store_settings')
        .select('updated_at, company_details')
        .eq('id', 'company_branding')
        .maybeSingle(),
    ]);

    let productsCount = 0;
    let latestProductUpdatedAt: string | null = null;
    let latestProductId: string | null = null;

    if (productsRes.status === 'fulfilled') {
      const val = productsRes.value as any;
      if (!val.error) {
        productsCount = typeof val.count === 'number' ? val.count : (val.data?.length || 0);
        if (Array.isArray(val.data) && val.data.length > 0) {
          latestProductUpdatedAt = val.data[0].updated_at || null;
          latestProductId = val.data[0].id || null;
        }
      } else {
        return null;
      }
    } else {
      // If products query failed, cannot reliably validate freshness
      return null;
    }

    let categoriesCount = 0;
    let latestCategoryUpdatedAt: string | null = null;

    if (categoriesRes.status === 'fulfilled') {
      const val = categoriesRes.value as any;
      if (!val.error) {
        categoriesCount = typeof val.count === 'number' ? val.count : (val.data?.length || 0);
        if (Array.isArray(val.data) && val.data.length > 0) {
          latestCategoryUpdatedAt = val.data[0].updated_at || null;
        }
      }
    }

    let storeSettingsUpdatedAt: string | null = null;
    let productsVersion: string | null = null;

    if (settingsRes.status === 'fulfilled') {
      const val = settingsRes.value as any;
      if (!val.error && val.data) {
        storeSettingsUpdatedAt = val.data.updated_at || null;
        const details = val.data.company_details || val.data.companyDetails;
        if (details && details._syncMeta?.productsVersion) {
          productsVersion = String(details._syncMeta.productsVersion);
        }
      }
    }

    return {
      productsVersion,
      productsCount,
      latestProductUpdatedAt,
      latestProductId,
      categoriesCount,
      latestCategoryUpdatedAt,
      storeSettingsUpdatedAt,
      timestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

/**
 * Compares cached metadata with fresh backend metadata.
 * Returns true if the cache is 100% fresh and identical to backend.
 * Returns false if ANY backend change occurred (product added, updated, deleted, image changed, etc.).
 */
export function isCacheUpToDate(
  cached: FreshnessMetadata | null,
  fresh: FreshnessMetadata
): boolean {
  if (!cached) return false;

  // 1. Explicit productsVersion tag (if set by Admin panel)
  if (fresh.productsVersion && cached.productsVersion) {
    if (fresh.productsVersion !== cached.productsVersion) {
      return false;
    }
  }

  // 2. Total product count check (catches additions and deletions)
  if (cached.productsCount !== fresh.productsCount) {
    return false;
  }

  // 3. Latest product updated_at check (catches edits, image changes, renames)
  if (cached.latestProductUpdatedAt !== fresh.latestProductUpdatedAt) {
    return false;
  }

  // 4. Latest product id check
  if (cached.latestProductId !== fresh.latestProductId) {
    return false;
  }

  // 5. Total categories count check
  if (cached.categoriesCount !== fresh.categoriesCount) {
    return false;
  }

  // 6. Latest category updated_at check
  if (cached.latestCategoryUpdatedAt !== fresh.latestCategoryUpdatedAt) {
    return false;
  }

  // 7. Store settings updated_at check (branding, banners, hero)
  if (fresh.storeSettingsUpdatedAt && cached.storeSettingsUpdatedAt) {
    if (cached.storeSettingsUpdatedAt !== fresh.storeSettingsUpdatedAt) {
      return false;
    }
  }

  return true;
}

/**
 * Updates the backend store data version and update timestamp in Supabase
 * Call this after any Admin operation: add, update, delete product/category/settings.
 */
export async function bumpBackendStoreVersion(
  reason: string = 'admin_action'
): Promise<string> {
  const newVersion = `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  try {
    // 1. Fetch existing company_details to preserve all fields
    const { data } = await supabase
      .from('store_settings')
      .select('company_details')
      .eq('id', 'company_branding')
      .maybeSingle();

    const existingDetails = data?.company_details || {};
    const updatedDetails = {
      ...existingDetails,
      _syncMeta: {
        productsVersion: newVersion,
        updatedAt: nowIso,
        reason,
      },
    };

    // 2. Update store_settings with the new version and timestamp
    await supabase
      .from('store_settings')
      .upsert(
        {
          id: 'company_branding',
          company_details: updatedDetails,
          updated_at: nowIso,
        },
        { onConflict: 'id' }
      );
  } catch {
    // Offline fallback: non-blocking
  }

  return newVersion;
}

/**
 * Appends cache-busting version query parameter to image URLs if needed
 */
export function getVersionedImageUrl(url: string, versionOrTimestamp?: string | number): string {
  if (!url) return '';
  // Don't modify data URIs, blob URLs or SVGs
  if (url.startsWith('data:') || url.startsWith('blob:') || url.endsWith('.svg')) {
    return url;
  }

  // If already has query param or is unique Supabase storage URL (which already has timestamp in name)
  if (url.includes('?v=') || (url.includes('falcon_assets') && url.includes('_'))) {
    return url;
  }

  const v = versionOrTimestamp || Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(v)}`;
}

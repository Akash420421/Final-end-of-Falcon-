import { supabase } from '../supabase';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/safeStorage';

export const CACHE_META_KEY = 'falcon_cache_metadata';
export const CACHE_INITIALIZED_KEY = 'falcon_data_initialized';
export const STORE_VERSION_KEY = 'falcon_store_version';
export const STORE_VERSION_ROW_ID = 'store_version';
export const CACHE_TIMESTAMP_KEY = 'falcon_cache_timestamp';
export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (in milliseconds)

export interface FreshnessMetadata {
  serverVersion?: number | null;
  productsVersion: string | null;
  productsCount: number;
  latestProductUpdatedAt: string | null;
  latestProductId: string | null;
  categoriesCount: number;
  latestCategoryUpdatedAt: string | null;
  cataloguePagesCount: number;
  latestCatalogueUpdatedAt: string | null;
  storeSettingsUpdatedAt: string | null;
  timestamp: number;
}

/**
 * Gets the timestamp (in epoch ms) when local store cache was saved
 */
export function getLocalCacheTimestamp(): number | null {
  try {
    const raw = safeLocalStorageGet(CACHE_TIMESTAMP_KEY);
    if (!raw) return null;
    const num = parseInt(raw, 10);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

/**
 * Sets the timestamp (in epoch ms) when local store cache was saved
 */
export function setLocalCacheTimestamp(timestamp: number = Date.now()): boolean {
  try {
    return safeLocalStorageSet(CACHE_TIMESTAMP_KEY, String(timestamp));
  } catch {
    return false;
  }
}

/**
 * Checks if the 1-hour TTL timer has expired.
 * Returns true if no timestamp exists or if more than 1 hour (3600000ms) has passed.
 */
export function isCacheExpired(ttlMs: number = CACHE_TTL_MS): boolean {
  const ts = getLocalCacheTimestamp();
  if (!ts) return true;
  const age = Date.now() - ts;
  return age > ttlMs;
}

/**
 * Retrieves the locally stored integer store version (e.g. 12, 13)
 */
export function getLocalStoreVersion(): number | null {
  try {
    const raw = safeLocalStorageGet(STORE_VERSION_KEY);
    if (!raw) return null;
    const num = parseInt(raw, 10);
    return isNaN(num) ? null : num;
  } catch {
    return null;
  }
}

/**
 * Persists the integer store version to localStorage (e.g. 13)
 */
export function setLocalStoreVersion(version: number): boolean {
  try {
    if (typeof version !== 'number' || isNaN(version)) return false;
    return safeLocalStorageSet(STORE_VERSION_KEY, String(version));
  } catch {
    return false;
  }
}

/**
 * Fast-path: Fetches the lightweight integer store version row from Supabase (<60 bytes)
 */
export async function fetchServerStoreVersion(): Promise<{
  version: number;
  updatedAt: string;
  reason?: string;
} | null> {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('company_details, updated_at')
      .eq('id', STORE_VERSION_ROW_ID)
      .maybeSingle();

    if (error || !data) return null;
    const details = data.company_details || {};
    const versionNum =
      typeof details.version === 'number'
        ? details.version
        : parseInt(details.version, 10);

    if (isNaN(versionNum) || versionNum < 0) return null;

    return {
      version: versionNum,
      updatedAt: data.updated_at || details.updatedAt || new Date().toISOString(),
      reason: details.reason || 'update',
    };
  } catch {
    return null;
  }
}

/**
 * Option C Hard Purge: Clears all stale cached store data from localStorage
 * Does NOT touch admin credentials, session, or customer quote requests.
 */
export function hardPurgeLocalStoreCache(): void {
  const keysToPurge = [
    'falcon_products',
    'falcon_categories',
    'falcon_company_details',
    'falcon_hero_content',
    'falcon_logo_image',
    'falcon_why_choose_us',
    'falcon_catalogue_settings',
    CACHE_META_KEY,
    CACHE_INITIALIZED_KEY,
    CACHE_TIMESTAMP_KEY,
  ];

  for (const key of keysToPurge) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
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
    const [productsRes, categoriesRes, settingsRes, catalogueRes] = await Promise.allSettled([
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

      // 3. Store settings: updated_at + version marker (<200 bytes instead of 810KB)
      supabase
        .from('store_settings')
        .select('updated_at, company_details->"_syncMeta"')
        .eq('id', 'company_branding')
        .maybeSingle(),

      // 4. Catalogue pages: exact count + newest updated page
      supabase
        .from('catalogue_pages')
        .select('id, updated_at', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .limit(1),

      // 5. Option C Dedicated Store Version Row (<60 bytes)
      supabase
        .from('store_settings')
        .select('company_details, updated_at')
        .eq('id', STORE_VERSION_ROW_ID)
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

    let cataloguePagesCount = 0;
    let latestCatalogueUpdatedAt: string | null = null;

    if (catalogueRes.status === 'fulfilled') {
      const val = catalogueRes.value as any;
      if (!val.error) {
        cataloguePagesCount = typeof val.count === 'number' ? val.count : (val.data?.length || 0);
        if (Array.isArray(val.data) && val.data.length > 0) {
          latestCatalogueUpdatedAt = val.data[0].updated_at || null;
        }
      }
    }

    let storeSettingsUpdatedAt: string | null = null;
    let productsVersion: string | null = null;

    if (settingsRes.status === 'fulfilled') {
      const val = settingsRes.value as any;
      if (!val.error && val.data) {
        storeSettingsUpdatedAt = val.data.updated_at || null;
        const syncMeta = val.data._syncMeta || val.data.company_details?._syncMeta || val.data.companyDetails?._syncMeta;
        if (syncMeta?.productsVersion) {
          productsVersion = String(syncMeta.productsVersion);
        }
      }
    }

    let serverVersion: number | null = null;
    try {
      const serverVer = await fetchServerStoreVersion();
      if (serverVer && typeof serverVer.version === 'number') {
        serverVersion = serverVer.version;
      }
    } catch {}

    return {
      serverVersion,
      productsVersion,
      productsCount,
      latestProductUpdatedAt,
      latestProductId,
      categoriesCount,
      latestCategoryUpdatedAt,
      cataloguePagesCount,
      latestCatalogueUpdatedAt,
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

  // 0. Option C: Direct Integer Store Version check (e.g. 12 vs 13)
  const localVer = getLocalStoreVersion();
  if (typeof fresh.serverVersion === 'number' && fresh.serverVersion > 0) {
    if (localVer === null || localVer !== fresh.serverVersion) {
      return false;
    }
  }

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

  // 7. Catalogue pages count check
  if (typeof fresh.cataloguePagesCount === 'number' && typeof cached.cataloguePagesCount === 'number') {
    if (cached.cataloguePagesCount !== fresh.cataloguePagesCount) {
      return false;
    }
  }

  // 8. Latest catalogue page updated_at check
  if (fresh.latestCatalogueUpdatedAt && cached.latestCatalogueUpdatedAt) {
    if (cached.latestCatalogueUpdatedAt !== fresh.latestCatalogueUpdatedAt) {
      return false;
    }
  }

  // 9. Store settings updated_at check (branding, banners, hero)
  if (fresh.storeSettingsUpdatedAt && cached.storeSettingsUpdatedAt) {
    if (cached.storeSettingsUpdatedAt !== fresh.storeSettingsUpdatedAt) {
      return false;
    }
  }

  return true;
}

/**
 * Option C: Increments integer version counter in Supabase (e.g. 12 -> 13)
 * Call this after any Admin operation: add, update, delete product/category/settings.
 */
export async function bumpBackendStoreVersion(
  reason: string = 'admin_action'
): Promise<number> {
  const nowIso = new Date().toISOString();
  try {
    // 1. Fetch current integer version
    const { data } = await supabase
      .from('store_settings')
      .select('company_details')
      .eq('id', STORE_VERSION_ROW_ID)
      .maybeSingle();

    const existingDetails = data?.company_details || {};
    const currentVersion = Number(existingDetails.version) || 0;
    const nextVersion = currentVersion + 1;

    // 2. Save bumped version to store_version row
    await supabase
      .from('store_settings')
      .upsert(
        {
          id: STORE_VERSION_ROW_ID,
          company_details: {
            version: nextVersion,
            updatedAt: nowIso,
            reason,
          },
          updated_at: nowIso,
        },
        { onConflict: 'id' }
      );

    // 3. Keep local storage on admin device in sync immediately
    setLocalStoreVersion(nextVersion);
    setLocalCacheTimestamp(Date.now());

    // 4. Dual-sync into company_branding for backward compatibility
    try {
      const { data: brandData } = await supabase
        .from('store_settings')
        .select('company_details')
        .eq('id', 'company_branding')
        .maybeSingle();

      const bDetails = brandData?.company_details || {};
      await supabase
        .from('store_settings')
        .upsert(
          {
            id: 'company_branding',
            company_details: {
              ...bDetails,
              _syncMeta: {
                productsVersion: String(nextVersion),
                updatedAt: nowIso,
                reason,
              },
            },
            updated_at: nowIso,
          },
          { onConflict: 'id' }
        );
    } catch {}

    return nextVersion;
  } catch (err) {
    console.warn('[bumpBackendStoreVersion] network error:', err);
    return 0;
  }
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

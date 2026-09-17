import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Product, Category, QuoteRequest, CatalogueSettings, CataloguePage, CompanyDetails } from '../types';
import { uploadOrCompressImage } from '../utils/supabaseStorage';
import {
  companyDetails as defaultCompanyDetails,
  productsData as defaultProductsData,
  categoriesData as defaultCategoriesData,
  whyChooseUsData as defaultWhyChooseUsData,
  defaultCatalogueSettings,
} from '../data/falconData';
import { supabase } from '../supabase';
import {
  fetchSupabaseStoreSettings,
  fetchSupabaseStoreSettingsCore,
  fetchSupabaseCatalogueSettings,
  saveSupabaseStoreSettings,
  fetchSupabaseCategories,
  upsertSupabaseCategory,
  deleteSupabaseCategory,
  fetchSupabaseProducts,
  upsertSupabaseProduct,
  deleteSupabaseProduct,
  fetchSupabaseCataloguePages,
  upsertSupabaseCataloguePage,
  mapCategoryFromSupabase,
  mapProductFromSupabase,
  mapCataloguePageFromSupabase,
} from '../services/supabaseService';
import {
  hashAdminPassword,
  generateSessionToken,
  verifySessionToken,
} from '../utils/security';
import {
  safeLocalStorageSet,
  safeLocalStorageGet,
  safeLocalStorageRemove,
} from '../utils/safeStorage';
import { subscribeToHeartbeat } from '../services/heartbeatService';
import {
  getCachedFreshnessMetadata,
  setCachedFreshnessMetadata,
  fetchBackendFreshnessMetadata,
  isCacheUpToDate,
  bumpBackendStoreVersion,
  getLocalStoreVersion,
  setLocalStoreVersion,
  fetchServerStoreVersion,
  hardPurgeLocalStoreCache,
  setLocalCacheTimestamp,
  getLocalCacheTimestamp,
  isCacheExpired,
  FreshnessMetadata,
} from '../services/smartCacheService';
import {
  getCataloguePagesFromIdb,
  saveCataloguePagesToIdb,
} from '../services/indexedDbCache';
import { preloadCatalogueImage } from '../components/ProtectedCatalogueCanvas';

// Pre-computed hash of the initial default admin credentials (SHA-256)
const DEFAULT_ADMIN_EMAIL = 'rajveergreat786@gmail.com';
const DEFAULT_ADMIN_HASH = '7dde1b62c885a9d184a8b41e0ac7ef71f22f6d717aabb4064f6e6d28239cd372';

// Session expiry duration: 24 hours (as requested by owner)
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

function isSessionValid(): boolean {
  const session = safeLocalStorageGet('falcon_admin_session');
  if (!session) return false;
  try {
    const parsed = JSON.parse(session);
    if (parsed.active && parsed.expiresAt) {
      if (Date.now() >= parsed.expiresAt) {
        return false;
      }
      return true;
    }
  } catch {
    // Invalid JSON
  }
  return false;
}

function establishSessionSync(email: string, passwordHash?: string): number {
  const expiresAt = Date.now() + SESSION_EXPIRY_MS;
  const session = {
    active: true,
    email: email.trim().toLowerCase(),
    expiresAt,
    createdAt: new Date().toISOString(),
  };
  // Synchronous write immediately so React lifecycle and navigate('/admin') pass instantly
  safeLocalStorageSet('falcon_admin_session', JSON.stringify(session));

  // Asynchronously compute and attach signed token
  if (passwordHash) {
    generateSessionToken(email, passwordHash, expiresAt)
      .then((token) => {
        const stored = safeLocalStorageGet('falcon_admin_session');
        if (stored) {
          try {
            const p = JSON.parse(stored);
            if (p.active && p.expiresAt === expiresAt) {
              safeLocalStorageSet('falcon_admin_session', JSON.stringify({ ...p, token }));
            }
          } catch {}
        }
      })
      .catch(() => {});
  }

  return expiresAt;
}

function refreshSessionIfValid(): boolean {
  const session = safeLocalStorageGet('falcon_admin_session');
  if (!session) return false;
  try {
    const parsed = JSON.parse(session);
    if (parsed.active && parsed.expiresAt && Date.now() < parsed.expiresAt) {
      // Extend session for 24 hours on active usage
      parsed.expiresAt = Date.now() + SESSION_EXPIRY_MS;
      safeLocalStorageSet('falcon_admin_session', JSON.stringify(parsed));
      return true;
    }
  } catch {}
  return false;
}

function destroySession(): void {
  safeLocalStorageRemove('falcon_admin_session');
}

export type { CompanyDetails };

export interface HeroContent {
  badge?: string;
  showBadge?: boolean;
  headline: string;
  subtitle: string;
  switchImageUrl: string;
  switchImages?: string[];
  showHeroBgShape?: boolean;
  heroBgColor?: string;
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AdminCredentials {
  email: string;
  passwordHash: string;
}

interface StoreContextType {
  companyDetails: CompanyDetails;
  heroContent: HeroContent;
  logoImageUrl: string;
  products: Product[];
  categories: Category[];
  whyChooseUs: WhyChooseItem[];
  quotes: QuoteRequest[];
  catalogueSettings: CatalogueSettings;
  adminCredentials: AdminCredentials;
  isAdminLoggedIn: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  isCriticalDataReady: boolean;
  initialSyncStatus: 'loading' | 'success' | 'error';
  initialSyncError: string | null;
  hasOfflineCache: boolean;
  isCatalogueLoaded: boolean;
  isFirebaseConnected: boolean; // Alias for backward-compatibility with existing UI components
  isSupabaseConnected: boolean;
  firebaseError: string | null; // Alias for backward-compatibility with existing UI components
  supabaseError: string | null;

  // Actions
  retryFirebaseConnection: () => void;
  retrySupabaseConnection: () => void;
  proceedWithOfflineCache: () => void;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  logoutAdmin: () => void;
  updateAdminCredentials: (email: string, newPassword: string) => Promise<void>;
  updateCompanyDetails: (details: Partial<CompanyDetails>) => Promise<void>;
  updateHeroContent: (hero: Partial<HeroContent>) => Promise<void>;
  updateLogoImage: (url: string) => Promise<void>;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updated: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (newOrderedCategories: Category[]) => Promise<void>;

  // Quotes CRUD
  addQuote: (quote: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateQuoteStatus: (id: string, status: QuoteRequest['status']) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;

  // Why Choose Us CRUD
  updateWhyChooseUs: (items: WhyChooseItem[]) => Promise<void>;

  // Catalogue Settings & Pages CRUD
  updateCatalogueSettings: (settings: Partial<CatalogueSettings>) => Promise<void>;
  updateCataloguePages: (pages: CataloguePage[]) => Promise<void>;
  updateSingleCataloguePage: (page: CataloguePage) => Promise<void>;

  // Reset
  resetToDefaults: () => Promise<void>;

  // Manual Full Sync to Supabase
  syncAllDataToSupabase: () => Promise<{ success: boolean; message: string }>;
}

const defaultAdminCreds: AdminCredentials = {
  email: DEFAULT_ADMIN_EMAIL,
  passwordHash: DEFAULT_ADMIN_HASH,
};

const defaultHeroContent: HeroContent = {
  badge: 'DIRECT FACTORY MANUFACTURER',
  showBadge: true,
  headline: 'High Performance Switchgear & Modular Accessories',
  subtitle: 'Heavy-duty 16A fan regulators, heater rotary switches & appliance controls.',
  switchImageUrl: '',
  showHeroBgShape: true,
  heroBgColor: 'red',
};

const mergeCompanyDetails = (data?: Partial<CompanyDetails> | null): CompanyDetails => {
  const merged = {
    ...defaultCompanyDetails,
    ...(data || {}),
  };
  const result: CompanyDetails = {
    brandName: merged.brandName || defaultCompanyDetails.brandName,
    companyName: merged.companyName || defaultCompanyDetails.companyName,
    founder: merged.founder || defaultCompanyDetails.founder,
    foundedYear: merged.foundedYear || defaultCompanyDetails.foundedYear,
    tagline: merged.tagline || defaultCompanyDetails.tagline,
    logoTagline: merged.logoTagline || 'Switch to excellence',
    hideLogoText: typeof merged.hideLogoText === 'boolean' ? merged.hideLogoText : false,
    customHeaderBannerUrl: merged.customHeaderBannerUrl || '',
    headerBrandMode: (merged.headerBrandMode as 'logo_text' | 'banner') || 'logo_text',
    address: merged.address || defaultCompanyDetails.address,
    phone: merged.phone || defaultCompanyDetails.phone,
    whatsapp: merged.whatsapp || merged.phone || defaultCompanyDetails.whatsapp,
    email: merged.email || defaultCompanyDetails.email,
    gstin: merged.gstin || defaultCompanyDetails.gstin,
    businessHours: merged.businessHours || defaultCompanyDetails.businessHours,
    facebook: merged.facebook || defaultCompanyDetails.facebook,
    instagram: merged.instagram || defaultCompanyDetails.instagram,
    headerTheme: merged.headerTheme || defaultCompanyDetails.headerTheme,
    showInstallAppButton: typeof merged.showInstallAppButton === 'boolean' ? merged.showInstallAppButton : true,
    quote: merged.quote || defaultCompanyDetails.quote,
    visitingCardImageUrl: merged.visitingCardImageUrl || '',
    mapQuery: merged.mapQuery || defaultCompanyDetails.mapQuery || '',
    googleMapsEmbedUrl: merged.googleMapsEmbedUrl || defaultCompanyDetails.googleMapsEmbedUrl || '',
    googleMapsDirectionsUrl: merged.googleMapsDirectionsUrl || defaultCompanyDetails.googleMapsDirectionsUrl || '',
    location: {
      lat: typeof merged.location?.lat === 'number' ? merged.location.lat : defaultCompanyDetails.location.lat,
      lng: typeof merged.location?.lng === 'number' ? merged.location.lng : defaultCompanyDetails.location.lng,
      zoom: typeof merged.location?.zoom === 'number' ? merged.location.zoom : defaultCompanyDetails.location.zoom,
    },
  };

  if (typeof merged.headerBannerHeight === 'number' && !isNaN(merged.headerBannerHeight)) {
    result.headerBannerHeight = merged.headerBannerHeight;
  }

  return result;
};

const hasAnyCachedStoreData = (): boolean => {
  try {
    const storedProds = safeLocalStorageGet('falcon_products');
    const storedCats = safeLocalStorageGet('falcon_categories');
    if (storedProds) {
      const p = JSON.parse(storedProds);
      if (Array.isArray(p) && p.length > 0) return true;
    }
    if (storedCats) {
      const c = JSON.parse(storedCats);
      if (Array.isArray(c) && c.length > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fast Initial Render (Step A: 0ms from Cache):
  // If user has cached products or categories in localStorage, immediately set 'success'
  // so the website renders instantly without a skeleton block.
  // Then Step B runs in the background to validate freshness.
  const [initialSyncStatus, setInitialSyncStatus] = useState<'loading' | 'success' | 'error'>(() => {
    if (hasAnyCachedStoreData()) {
      return 'success';
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return 'error';
    }
    return 'loading';
  });
  const [initialSyncError, setInitialSyncError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
  });
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return isSessionValid();
  });

  const [adminCredentials, setAdminCredentialsState] = useState<AdminCredentials>(() => {
    try {
      const stored = safeLocalStorageGet('falcon_admin_credentials');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email && parsed.passwordHash) return parsed;
      }
    } catch {}
    return defaultAdminCreds;
  });

  const hasOfflineCache = useMemo(() => {
    return hasAnyCachedStoreData();
  }, []);

  const [companyDetails, setCompanyDetailsState] = useState<CompanyDetails>(() => {
    const saved = safeLocalStorageGet('falcon_company_details');
    try {
      return saved ? mergeCompanyDetails(JSON.parse(saved)) : defaultCompanyDetails;
    } catch {
      return defaultCompanyDetails;
    }
  });

  const [heroContent, setHeroContentState] = useState<HeroContent>(() => {
    const saved = safeLocalStorageGet('falcon_hero_content');
    return saved ? JSON.parse(saved) : defaultHeroContent;
  });

  const [logoImageUrl, setLogoImageUrlState] = useState<string>(() => {
    return safeLocalStorageGet('falcon_logo_image') || '';
  });

  // Never initialize with demo products. Only initialize with real cached products, else empty array.
  const [products, setProductsState] = useState<Product[]>(() => {
    try {
      const saved = safeLocalStorageGet('falcon_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  // Never initialize with demo categories. Only initialize with real cached categories, else empty array.
  const [categories, setCategoriesState] = useState<Category[]>(() => {
    try {
      const saved = safeLocalStorageGet('falcon_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [whyChooseUs, setWhyChooseUsState] = useState<WhyChooseItem[]>(() => {
    const saved = safeLocalStorageGet('falcon_why_choose_us');
    return saved ? JSON.parse(saved) : defaultWhyChooseUsData;
  });

  const [quotes, setQuotesState] = useState<QuoteRequest[]>(() => {
    const saved = safeLocalStorageGet('falcon_quotes');
    return saved ? JSON.parse(saved) : [];
  });

  const [catalogueSettings, setCatalogueSettingsState] = useState<CatalogueSettings>(() => {
    const saved = safeLocalStorageGet('falcon_catalogue_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultCatalogueSettings,
          ...parsed,
          pages: parsed.pages?.length ? parsed.pages : defaultCatalogueSettings.pages,
        };
      } catch {
        return defaultCatalogueSettings;
      }
    }
    return defaultCatalogueSettings;
  });

  const [isCatalogueLoaded, setIsCatalogueLoaded] = useState<boolean>(() => {
    try {
      const saved = safeLocalStorageGet('falcon_catalogue_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.pages) && parsed.pages.some((p: any) => p.imageUrl || p.image)) {
          return true;
        }
      }
    } catch {}
    return false;
  });

  const isSeedingRef = useRef(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retrySupabaseConnection = () => {
    setInitialSyncStatus('loading');
    setInitialSyncError(null);
    setSupabaseError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  const proceedWithOfflineCache = () => {
    setInitialSyncStatus('success');
    setSupabaseError('Running in offline mode with cached data');
  };

  // Session expiry check — auto-logout only if session is explicitly expired, and slide refresh on active use
  useEffect(() => {
    if (isAdminLoggedIn) {
      if (!isSessionValid()) {
        setIsAdminLoggedIn(false);
        destroySession();
      } else {
        refreshSessionIfValid();
      }
    }
  }, [isAdminLoggedIn]);

  // Sync connection state with heartbeat pulses
  useEffect(() => {
    const unsubscribe = subscribeToHeartbeat((status) => {
      if (status.lastPulseStatus === 'success' || status.lastSimulation?.status === 'success') {
        setIsSupabaseConnected(true);
      }
    });
    return unsubscribe;
  }, []);

  // Guard flag for initialization
  const isDataInitialized = () => safeLocalStorageGet('falcon_data_initialized') === 'true';
  const markDataInitialized = () => safeLocalStorageSet('falcon_data_initialized', 'true');

  // Instantly restore full high-resolution catalogue pages from IndexedDB (<5ms on re-visit)
  useEffect(() => {
    let isCancelled = false;
    getCataloguePagesFromIdb().then((cachedPages) => {
      if (isCancelled || !cachedPages || cachedPages.length === 0) return;
      const hasImages = cachedPages.some((p) => Boolean(p.imageUrl || p.image));
      if (hasImages) {
        setCatalogueSettingsState((prev) => ({
          ...prev,
          pages: [...cachedPages].sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0)),
        }));
        setIsCatalogueLoaded(true);
        // Preload all pages in memory immediately
        cachedPages.forEach((p) => {
          const url = p.imageUrl || p.image;
          if (url) preloadCatalogueImage(url);
        });
      }
    });
    return () => {
      isCancelled = true;
    };
  }, []);

  // Supabase initial load and real-time subscription
  useEffect(() => {
    let isMounted = true;

    // Background freshness check & sync (Option C: Smart Version Bump with Hard Purge):
    // Checks server version (<60 bytes).
    // If local version matches server version: skips downloading anything (0 wasted bytes).
    // If server version is higher (or force=true): hard purges local cache and replaces with fresh data.
    const syncFreshnessInBackground = async (force: boolean = false) => {
      try {
        const [serverVerRes, freshMetaRes] = await Promise.allSettled([
          fetchServerStoreVersion(),
          fetchBackendFreshnessMetadata(),
        ]);

        const serverVer = serverVerRes.status === 'fulfilled' ? serverVerRes.value : null;
        const freshMeta = freshMetaRes.status === 'fulfilled' ? freshMetaRes.value : null;

        if (!serverVer && !freshMeta) {
          // Network might be offline, do nothing to preserve local experience
          return;
        }

        const localVer = getLocalStoreVersion();
        const cachedMeta = getCachedFreshnessMetadata();

        let isOutdated = force || isCacheExpired();

        // Check A: Dedicated integer version check (Option C)
        if (serverVer && typeof serverVer.version === 'number') {
          if (localVer === null || localVer !== serverVer.version) {
            isOutdated = true;
          }
        }

        // Check B: Metadata validation (products count, timestamps)
        if (!isOutdated && freshMeta) {
          if (!isCacheUpToDate(cachedMeta, freshMeta)) {
            isOutdated = true;
          }
        }

        // Check C: Ensure catalogue pages have images
        if (!isOutdated && freshMeta && (freshMeta.cataloguePagesCount ?? 0) > 0) {
          const localIdbPages = await getCataloguePagesFromIdb();
          const hasValidLocalImages = Boolean(
            localIdbPages &&
            localIdbPages.length > 0 &&
            localIdbPages.some((p) => Boolean(p.imageUrl || p.image))
          );
          if (!hasValidLocalImages) {
            isOutdated = true;
          }
        }

        if (!isOutdated) {
          // Cache is 100% up to date!
          if (serverVer?.version) setLocalStoreVersion(serverVer.version);
          if (freshMeta) setCachedFreshnessMetadata({ ...freshMeta, timestamp: Date.now() });
          setIsCatalogueLoaded(true);
          return;
        }

        // Option C Hard Purge: Clear stale cached products and settings
        hardPurgeLocalStoreCache();

        // Fetch fresh products, categories, settings, and catalogue in parallel
        const [productsRes, categoriesRes, settingsRes, cataloguePagesRes] = await Promise.allSettled([
          fetchSupabaseProducts(),
          fetchSupabaseCategories(),
          fetchSupabaseStoreSettingsCore(),
          fetchSupabaseCataloguePages(),
        ]);

        if (!isMounted) return;

        // 1. Update Products if fetched
        if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
          const freshProducts = productsRes.value;
          setProductsState(freshProducts);
          safeLocalStorageSet('falcon_products', JSON.stringify(freshProducts));
        }

        // 2. Update Categories if fetched
        if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value)) {
          const freshCats = [...categoriesRes.value].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
          setCategoriesState(freshCats);
          safeLocalStorageSet('falcon_categories', JSON.stringify(freshCats));
        }

        // 3. Update Settings if fetched
        if (settingsRes.status === 'fulfilled' && settingsRes.value) {
          const s = settingsRes.value;
          if (s.companyDetails) {
            const merged = mergeCompanyDetails(s.companyDetails);
            setCompanyDetailsState(merged);
            safeLocalStorageSet('falcon_company_details', JSON.stringify(merged));
          }
          if (s.heroContent) {
            const mergedHero: HeroContent = {
              ...defaultHeroContent,
              ...s.heroContent,
              badge: s.heroContent.badge !== undefined ? s.heroContent.badge : defaultHeroContent.badge,
              showBadge: s.heroContent.showBadge !== undefined ? s.heroContent.showBadge : true,
            };
            setHeroContentState(mergedHero);
            safeLocalStorageSet('falcon_hero_content', JSON.stringify(mergedHero));
          }
          if (s.logoImageUrl !== undefined) {
            setLogoImageUrlState(s.logoImageUrl);
            safeLocalStorageSet('falcon_logo_image', s.logoImageUrl);
          }
          if (s.whyChooseUs) {
            setWhyChooseUsState(s.whyChooseUs);
            safeLocalStorageSet('falcon_why_choose_us', JSON.stringify(s.whyChooseUs));
          }
        }

        // 4. Update Catalogue Pages if fetched
        if (cataloguePagesRes.status === 'fulfilled' && Array.isArray(cataloguePagesRes.value)) {
          const freshPages = cataloguePagesRes.value;
          if (freshPages.length > 0) {
            saveCataloguePagesToIdb(freshPages).catch(() => {});

            freshPages.forEach((p) => {
              const url = p.imageUrl || p.image;
              if (url) preloadCatalogueImage(url);
            });

            setCatalogueSettingsState((prev) => {
              const currentPages = prev.pages || defaultCatalogueSettings.pages;
              const map = new Map<string, CataloguePage>();
              freshPages.forEach((p) => map.set(p.id, p));

              const merged = currentPages.map((page) => {
                const remote = map.get(page.id);
                if (remote) {
                  map.delete(remote.id);
                  return { ...page, ...remote };
                }
                return page;
              });

              map.forEach((extra) => {
                if (!merged.some((p) => p.id === extra.id)) {
                  merged.push(extra);
                }
              });

              merged.sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0));
              const updated = { ...prev, pages: merged };
              safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(updated));
              return updated;
            });

            setIsCatalogueLoaded(true);
          }
        }

        // 5. Update local store version to match server version
        if (serverVer && typeof serverVer.version === 'number') {
          setLocalStoreVersion(serverVer.version);
        } else if (freshMeta?.serverVersion) {
          setLocalStoreVersion(freshMeta.serverVersion);
        }

        if (freshMeta) {
          setCachedFreshnessMetadata(freshMeta);
        }
        setLocalCacheTimestamp(Date.now());
        markDataInitialized();
      } catch (err) {
        console.warn('[syncFreshnessInBackground error]:', err);
      }
    };

    const initSupabaseSync = async () => {
      try {
        const hasCached = hasAnyCachedStoreData();
        const expired = isCacheExpired(); // 1-Hour TTL: returns true if > 1 hour (3600000ms) or first visit

        if (!hasCached || expired) {
          // If 1 hour has expired, purge stale cache to load 100% fresh data
          if (expired && hasCached) {
            hardPurgeLocalStoreCache();
          }

          // FIRST LOAD or 1-HOUR EXPIRED RELOAD — User sees loading and receives full latest dataset
          setInitialSyncStatus('loading');
          setInitialSyncError(null);

          const [
            settingsRes,
            productsRes,
            categoriesRes,
            cataloguePagesRes,
            catalogueSettingsRes,
            freshnessMeta,
          ] = await Promise.allSettled([
            fetchSupabaseStoreSettingsCore(),
            fetchSupabaseProducts(),
            fetchSupabaseCategories(),
            fetchSupabaseCataloguePages(),
            fetchSupabaseCatalogueSettings(),
            fetchBackendFreshnessMetadata(),
          ]);

          if (!isMounted) return;

          const settingsResult = settingsRes.status === 'fulfilled' ? settingsRes.value : null;
          const productsResult = productsRes.status === 'fulfilled' ? productsRes.value : null;
          const categoriesResult = categoriesRes.status === 'fulfilled' ? categoriesRes.value : null;
          const cataloguePagesResult = cataloguePagesRes.status === 'fulfilled' ? cataloguePagesRes.value : null;
          const catalogueSettingsResult = catalogueSettingsRes.status === 'fulfilled' ? catalogueSettingsRes.value : null;
          const freshMeta = freshnessMeta.status === 'fulfilled' ? freshnessMeta.value : null;

          const hasAnyRemoteData = Boolean(
            settingsResult ||
            (productsResult && productsResult.length > 0) ||
            (categoriesResult && categoriesResult.length > 0) ||
            (cataloguePagesResult && cataloguePagesResult.length > 0)
          );

          // 1. Process Core Store Settings
          if (settingsResult) {
            markDataInitialized();
            if (settingsResult.companyDetails) {
              const merged = mergeCompanyDetails(settingsResult.companyDetails);
              setCompanyDetailsState(merged);
              safeLocalStorageSet('falcon_company_details', JSON.stringify(merged));
            }
            if (settingsResult.heroContent) {
              const mergedHero: HeroContent = {
                ...defaultHeroContent,
                ...settingsResult.heroContent,
                badge: settingsResult.heroContent.badge !== undefined ? settingsResult.heroContent.badge : defaultHeroContent.badge,
                showBadge: settingsResult.heroContent.showBadge !== undefined ? settingsResult.heroContent.showBadge : true,
              };
              setHeroContentState(mergedHero);
              safeLocalStorageSet('falcon_hero_content', JSON.stringify(mergedHero));
            }
            if (settingsResult.logoImageUrl !== undefined) {
              setLogoImageUrlState(settingsResult.logoImageUrl);
              safeLocalStorageSet('falcon_logo_image', settingsResult.logoImageUrl);
            }
            if (settingsResult.whyChooseUs) {
              setWhyChooseUsState(settingsResult.whyChooseUs);
              safeLocalStorageSet('falcon_why_choose_us', JSON.stringify(settingsResult.whyChooseUs));
            }
          } else if (!isDataInitialized() && !isSeedingRef.current) {
            // Attempt first-time seed if table is blank
            isSeedingRef.current = true;
            saveSupabaseStoreSettings({
              companyDetails: defaultCompanyDetails,
              heroContent: defaultHeroContent,
              logoImageUrl: '',
              whyChooseUs: defaultWhyChooseUsData,
              catalogueSettings: defaultCatalogueSettings,
            }).catch(() => {});
          }

          // 2. Process Products (Save real products to state & cache)
          if (productsResult && productsResult.length > 0) {
            markDataInitialized();
            setProductsState(productsResult);
            safeLocalStorageSet('falcon_products', JSON.stringify(productsResult));
          }

          // 3. Process Categories (Save real categories to state & cache)
          if (categoriesResult && categoriesResult.length > 0) {
            markDataInitialized();
            const sortedCats = [...categoriesResult].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
            setCategoriesState(sortedCats);
            safeLocalStorageSet('falcon_categories', JSON.stringify(sortedCats));
          }

          // 4. Process Catalogue Pages (Save real uploaded catalogue pages & images)
          if (cataloguePagesResult && cataloguePagesResult.length > 0) {
            markDataInitialized();
            saveCataloguePagesToIdb(cataloguePagesResult).catch(() => {});
            cataloguePagesResult.forEach((p) => {
              const u = p.imageUrl || p.image;
              if (u) preloadCatalogueImage(u);
            });
            setCatalogueSettingsState((prev) => {
              const currentPages = prev.pages && prev.pages.length > 0 ? prev.pages : defaultCatalogueSettings.pages;
              const map = new Map<string, CataloguePage>();
              cataloguePagesResult.forEach((p) => map.set(p.id, p));

              const merged = currentPages.map((page) => {
                const remote = map.get(page.id);
                if (remote) {
                  map.delete(remote.id);
                  return { ...page, ...remote };
                }
                return page;
              });

              map.forEach((extra) => {
                if (!merged.some((p) => p.id === extra.id)) {
                  merged.push(extra);
                }
              });

              merged.sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0));
              const updated = { ...prev, pages: merged };
              safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(updated));
              return updated;
            });
            setIsCatalogueLoaded(true);
          }

          // 5. Process Catalogue Settings
          if (catalogueSettingsResult) {
            setCatalogueSettingsState((prev) => {
              const mergedCat: CatalogueSettings = {
                ...prev,
                ...catalogueSettingsResult,
                pages: catalogueSettingsResult.pages?.length ? catalogueSettingsResult.pages : prev.pages,
              };
              safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(mergedCat));
              return mergedCat;
            });
          }

          setIsCatalogueLoaded(true);

          // Save freshness metadata & Option C integer store version
          if (freshMeta) {
            setCachedFreshnessMetadata(freshMeta);
            if (typeof freshMeta.serverVersion === 'number') {
              setLocalStoreVersion(freshMeta.serverVersion);
            }
          }
          fetchServerStoreVersion().then((sv) => {
            if (sv && typeof sv.version === 'number') {
              setLocalStoreVersion(sv.version);
            }
          });

          // Save 1-hour TTL cache timestamp
          setLocalCacheTimestamp(Date.now());

          // ONLY trigger offline error screen if device is genuinely OFFLINE with NO cached data!
          const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
          if (isOffline && !hasAnyRemoteData && !hasAnyCachedStoreData()) {
            setIsSupabaseConnected(false);
            setInitialSyncError('You are currently offline. Please reconnect your mobile data or Wi-Fi and tap retry.');
            setInitialSyncStatus('error');
            return;
          }

          setIsSupabaseConnected(true);
          setInitialSyncError(null);
          setInitialSyncStatus('success');
        } else {
          // SUBSEQUENT RELOAD / REVISIT (WITHIN 1 HOUR):
          // Step A — FAST DISPLAY (0ms):
          // Cached state is already rendered immediately.
          setIsSupabaseConnected(true);
          setInitialSyncError(null);
          setInitialSyncStatus('success');

          // Check if catalogue pages already have images in IndexedDB
          try {
            const idbPages = await getCataloguePagesFromIdb();
            if (idbPages && idbPages.some((p) => Boolean(p.imageUrl || p.image))) {
              setCatalogueSettingsState((prev) => ({
                ...prev,
                pages: [...idbPages].sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0)),
              }));
              setIsCatalogueLoaded(true);
              idbPages.forEach((p) => {
                const u = p.imageUrl || p.image;
                if (u) preloadCatalogueImage(u);
              });
            }
          } catch {}

          // Step B — FRESH BACKEND CHECK:
          // Perform lightweight version & freshness check in background
          await syncFreshnessInBackground();
        }
      } catch (err: any) {
        if (isMounted) {
          setIsCatalogueLoaded(true);
          const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
          if (isOffline && !hasAnyCachedStoreData()) {
            setIsSupabaseConnected(false);
            setInitialSyncError('You are currently offline. Please reconnect your mobile data or Wi-Fi and tap retry.');
            setInitialSyncStatus('error');
          } else {
            // Keep cached data available, never show error screen if cached data exists
            setIsSupabaseConnected(true);
            setInitialSyncError(null);
            setInitialSyncStatus('success');
          }
        }
      }
    };

    initSupabaseSync();

    // Listen for window online/offline events for dynamic reconnection
    const handleOnline = () => {
      setIsSupabaseConnected(true);
      setInitialSyncError(null);
      setInitialSyncStatus('success');
      syncFreshnessInBackground(true);
      setRetryTrigger((prev) => prev + 1);
    };
    const handleOffline = () => {
      setIsSupabaseConnected(false);
    };

    // Mobile & Desktop page focus / revisit triggers
    const handlePageShow = () => {
      syncFreshnessInBackground();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncFreshnessInBackground();
      }
    };
    const handleFocus = () => {
      syncFreshnessInBackground();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic heartbeat check every 30 seconds if window is visible
    const periodicCheck = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncFreshnessInBackground();
      }
    }, 30000);

    // Setup Supabase Real-Time Channel Listener
    const channel = supabase
      .channel('falcon_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          const rowId = (payload.new as any)?.id || (payload.old as any)?.id;
          if (rowId === 'store_version') {
            syncFreshnessInBackground(true);
            return;
          }
          if (payload.new && (payload.new as any).id === 'company_branding') {
            const data: any = payload.new;
            const newDetails = data.company_details || data.companyDetails;
            const newHero = data.hero_content || data.heroContent;
            const newLogo = data.logo_image_url || data.logoImageUrl;
            const newWhy = data.why_choose_us || data.whyChooseUs;
            const newCat = data.catalogue_settings || data.catalogueSettings;

            if (newDetails) {
              const merged = mergeCompanyDetails(newDetails);
              setCompanyDetailsState(merged);
              safeLocalStorageSet('falcon_company_details', JSON.stringify(merged));
            }
            if (newHero) {
              setHeroContentState(newHero);
              safeLocalStorageSet('falcon_hero_content', JSON.stringify(newHero));
            }
            if (newLogo !== undefined) {
              setLogoImageUrlState(newLogo);
              safeLocalStorageSet('falcon_logo_image', newLogo);
            }
            if (newWhy) {
              setWhyChooseUsState(newWhy);
              safeLocalStorageSet('falcon_why_choose_us', JSON.stringify(newWhy));
            }
            if (newCat) {
              setCatalogueSettingsState((prev) => {
                const merged = { ...prev, ...newCat };
                safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(merged));
                return merged;
              });
            }
            fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProd = mapProductFromSupabase(payload.new);
            setProductsState((prev) => {
              const next = [newProd, ...prev.filter((p) => p.id !== newProd.id)];
              safeLocalStorageSet('falcon_products', JSON.stringify(next));
              return next;
            });
            fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
          } else if (payload.eventType === 'UPDATE') {
            const updatedProd = mapProductFromSupabase(payload.new);
            setProductsState((prev) => {
              const next = prev.map((p) => (p.id === updatedProd.id ? updatedProd : p));
              safeLocalStorageSet('falcon_products', JSON.stringify(next));
              return next;
            });
            fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setProductsState((prev) => {
                const next = prev.filter((p) => p.id !== deletedId);
                safeLocalStorageSet('falcon_products', JSON.stringify(next));
                return next;
              });
              fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const cat = mapCategoryFromSupabase(payload.new);
            setCategoriesState((prev) => {
              const filtered = prev.filter((c) => c.id !== cat.id);
              const next = [...filtered, cat].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
              safeLocalStorageSet('falcon_categories', JSON.stringify(next));
              return next;
            });
            fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setCategoriesState((prev) => {
                const next = prev.filter((c) => c.id !== deletedId);
                safeLocalStorageSet('falcon_categories', JSON.stringify(next));
                return next;
              });
              fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_settings' },
        (payload) => {
          if (payload.new && (payload.new as any).id === 'company_branding') {
            const data: any = payload.new;
            const newDetails = data.company_details || data.companyDetails;
            const newHero = data.hero_content || data.heroContent;
            const newLogo = data.logo_image_url || data.logoImageUrl;
            const newWhy = data.why_choose_us || data.whyChooseUs;
            const newCat = data.catalogue_settings || data.catalogueSettings;

            if (newDetails) {
              const merged = mergeCompanyDetails(newDetails);
              setCompanyDetailsState(merged);
              safeLocalStorageSet('falcon_company_details', JSON.stringify(merged));
            }
            if (newHero) {
              setHeroContentState(newHero);
              safeLocalStorageSet('falcon_hero_content', JSON.stringify(newHero));
            }
            if (newLogo !== undefined) {
              setLogoImageUrlState(newLogo);
              safeLocalStorageSet('falcon_logo_image', newLogo);
            }
            if (newWhy) {
              setWhyChooseUsState(newWhy);
              safeLocalStorageSet('falcon_why_choose_us', JSON.stringify(newWhy));
            }
            if (newCat) {
              setCatalogueSettingsState((prev) => {
                const merged = { ...prev, ...newCat };
                safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(merged));
                return merged;
              });
            }
            fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'catalogue_pages' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const page = mapCataloguePageFromSupabase(payload.new);
            setCatalogueSettingsState((prev) => {
              const currentPages = prev.pages || defaultCatalogueSettings.pages;
              const idx = currentPages.findIndex((p) => p.id === page.id || p.pageNumber === page.pageNumber);
              let nextPages: CataloguePage[];
              if (idx >= 0) {
                nextPages = [...currentPages];
                nextPages[idx] = { ...nextPages[idx], ...page };
              } else {
                nextPages = [...currentPages, page];
              }
              nextPages.sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0));
              const updated = { ...prev, pages: nextPages };
              safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(updated));
              return updated;
            });
            fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setCatalogueSettingsState((prev) => {
                const currentPages = prev.pages || defaultCatalogueSettings.pages;
                const nextPages = currentPages.filter((p) => p.id !== deletedId);
                const updated = { ...prev, pages: nextPages };
                safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(updated));
                return updated;
              });
              fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(periodicCheck);
      supabase.removeChannel(channel);
    };
  }, [retryTrigger]);

  // Admin Login Handler — uses SHA-256 hash comparison (async)
  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    const cleanInputEmail = (email || '').trim().toLowerCase();
    const inputHash = await hashAdminPassword(cleanInputEmail, password);

    const handleSuccess = (matchedEmail: string, matchedHash: string) => {
      // 1. Establish session in localStorage SYNCHRONOUSLY FIRST
      establishSessionSync(matchedEmail, matchedHash);
      // 2. Set React state
      setIsAdminLoggedIn(true);
      return true;
    };

    // 1. Check in-memory state credentials
    const cleanAdminEmail = (adminCredentials.email || '').trim().toLowerCase();
    if (cleanInputEmail === cleanAdminEmail && inputHash === adminCredentials.passwordHash) {
      return handleSuccess(cleanAdminEmail, adminCredentials.passwordHash);
    }

    // 2. Check stored local credentials
    try {
      const stored = safeLocalStorageGet('falcon_admin_credentials');
      if (stored) {
        const parsed = JSON.parse(stored);
        const parsedEmail = (parsed.email || '').trim().toLowerCase();
        if (parsedEmail && parsed.passwordHash && cleanInputEmail === parsedEmail && inputHash === parsed.passwordHash) {
          return handleSuccess(parsedEmail, parsed.passwordHash);
        }
      }
    } catch {}

    // 3. Fallback check default credentials
    const cleanDefaultEmail = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
    if (cleanInputEmail === cleanDefaultEmail && inputHash === DEFAULT_ADMIN_HASH) {
      return handleSuccess(cleanDefaultEmail, DEFAULT_ADMIN_HASH);
    }

    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    destroySession();
  };

  // 1. Update Admin Credentials
  const updateAdminCredentials = async (email: string, newPassword: string) => {
    const cleanEmail = email.trim();
    let newHash = adminCredentials.passwordHash;
    if (newPassword && newPassword.trim()) {
      newHash = await hashAdminPassword(cleanEmail, newPassword.trim());
    } else {
      // Re-hash with existing credentials under new email if changed
      newHash = adminCredentials.passwordHash;
    }
    const newCreds: AdminCredentials = { email: cleanEmail, passwordHash: newHash };
    setAdminCredentialsState(newCreds);
    safeLocalStorageSet('falcon_admin_credentials', JSON.stringify(newCreds));
  };

  // 2. Update Company Details
  const updateCompanyDetails = async (details: Partial<CompanyDetails>) => {
    const updated = mergeCompanyDetails({ ...companyDetails, ...details });
    setCompanyDetailsState(updated);
    safeLocalStorageSet('falcon_company_details', JSON.stringify(updated));

    try {
      await saveSupabaseStoreSettings({ companyDetails: updated });
      const newVer = await bumpBackendStoreVersion('company_details_updated');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 3. Update Hero Content
  const updateHeroContent = async (hero: Partial<HeroContent>) => {
    let payload = { ...hero };
    if (payload.switchImageUrl) {
      payload.switchImageUrl = await uploadOrCompressImage(payload.switchImageUrl, 'hero');
    }
    if (payload.switchImages && payload.switchImages.length > 0) {
      payload.switchImages = await Promise.all(
        payload.switchImages.map((img) => uploadOrCompressImage(img, 'hero'))
      );
    }
    const updated = { ...heroContent, ...payload };
    setHeroContentState(updated);
    safeLocalStorageSet('falcon_hero_content', JSON.stringify(updated));

    try {
      await saveSupabaseStoreSettings({ heroContent: updated });
      const newVer = await bumpBackendStoreVersion('hero_content_updated');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 4. Update Logo Image URL
  const updateLogoImage = async (url: string) => {
    let finalUrl = url;
    if (url) {
      finalUrl = await uploadOrCompressImage(url, 'logo');
    }
    setLogoImageUrlState(finalUrl);
    safeLocalStorageSet('falcon_logo_image', finalUrl);

    try {
      await saveSupabaseStoreSettings({ logoImageUrl: finalUrl });
      const newVer = await bumpBackendStoreVersion('logo_updated');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 5. Add Product
  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newId = 'prod-' + Date.now();
    let mainImg = product.image || '';
    if (mainImg) {
      mainImg = await uploadOrCompressImage(mainImg, 'products');
    }

    const compressedImages = await Promise.all(
      (product.images || [mainImg]).map(async (img) => {
        if (img) {
          return await uploadOrCompressImage(img, 'products');
        }
        return img;
      })
    );

    const newProd: Product = {
      ...product,
      image: mainImg,
      images: compressedImages,
      id: newId,
    };

    setProductsState((prev) => [newProd, ...prev]);
    safeLocalStorageSet('falcon_products', JSON.stringify([newProd, ...products]));

    // Cloud synchronization & version bump
    try {
      await upsertSupabaseProduct(newProd);
      const newVer = await bumpBackendStoreVersion('product_added');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch (err) {
      console.warn('[addProduct cloud sync warning]:', err);
    }
  };

  // 6. Update Product
  const updateProduct = async (id: string, updated: Partial<Product>) => {
    let payload = { ...updated };
    if (payload.image) {
      payload.image = await uploadOrCompressImage(payload.image, 'products');
    }
    if (payload.images && payload.images.length > 0) {
      payload.images = await Promise.all(
        payload.images.map(async (img) => {
          if (img) {
            return await uploadOrCompressImage(img, 'products');
          }
          return img;
        })
      );
    }

    const nextProducts = products.map((p) => (p.id === id ? { ...p, ...payload } : p));
    setProductsState(nextProducts);
    safeLocalStorageSet('falcon_products', JSON.stringify(nextProducts));

    const target = nextProducts.find((p) => p.id === id);
    if (target) {
      try {
        await upsertSupabaseProduct(target);
        const newVer = await bumpBackendStoreVersion('product_updated');
        if (newVer) setLocalStoreVersion(newVer);
        fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
      } catch (err) {
        console.warn('[updateProduct cloud sync warning]:', err);
      }
    }
  };

  // 7. Delete Product
  const deleteProduct = async (id: string) => {
    const nextProducts = products.filter((p) => p.id !== id);
    setProductsState(nextProducts);
    safeLocalStorageSet('falcon_products', JSON.stringify(nextProducts));

    try {
      await deleteSupabaseProduct(id);
      const newVer = await bumpBackendStoreVersion('product_deleted');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch (err) {
      console.warn('[deleteProduct cloud sync warning]:', err);
    }
  };

  // 8. Add Category
  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newId = 'cat-' + Date.now();
    let img = category.image || '';
    if (img) {
      img = await uploadOrCompressImage(img, 'categories');
    }

    const newCat: Category = {
      ...category,
      image: img,
      imageUrl: img,
      id: newId,
      order: category.order ?? categories.length + 1,
    };

    const nextCategories = [...categories, newCat];
    setCategoriesState(nextCategories);
    safeLocalStorageSet('falcon_categories', JSON.stringify(nextCategories));

    try {
      await upsertSupabaseCategory(newCat);
      const newVer = await bumpBackendStoreVersion('category_added');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch (err) {
      console.warn('[addCategory cloud sync warning]:', err);
    }
  };

  // 9. Update Category
  const updateCategory = async (id: string, updated: Partial<Category>) => {
    let payload = { ...updated };
    if (payload.image) {
      payload.image = await uploadOrCompressImage(payload.image, 'categories');
      payload.imageUrl = payload.image;
    }

    const nextCategories = categories.map((c) => (c.id === id ? { ...c, ...payload } : c));
    setCategoriesState(nextCategories);
    safeLocalStorageSet('falcon_categories', JSON.stringify(nextCategories));

    const target = nextCategories.find((c) => c.id === id);
    if (target) {
      try {
        await upsertSupabaseCategory(target);
        const newVer = await bumpBackendStoreVersion('category_updated');
        if (newVer) setLocalStoreVersion(newVer);
        fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
      } catch (err) {
        console.warn('[updateCategory cloud sync warning]:', err);
      }
    }
  };

  // 10. Delete Category
  const deleteCategory = async (id: string) => {
    const nextCategories = categories.filter((c) => c.id !== id);
    setCategoriesState(nextCategories);
    safeLocalStorageSet('falcon_categories', JSON.stringify(nextCategories));

    try {
      await deleteSupabaseCategory(id);
      const newVer = await bumpBackendStoreVersion('category_deleted');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch (err) {
      console.warn('[deleteCategory cloud sync warning]:', err);
    }
  };

  // 11. Reorder Categories
  const reorderCategories = async (newOrderedCategories: Category[]) => {
    const updatedWithOrder = newOrderedCategories.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    setCategoriesState(updatedWithOrder);
    safeLocalStorageSet('falcon_categories', JSON.stringify(updatedWithOrder));

    try {
      for (const cat of updatedWithOrder) {
        await upsertSupabaseCategory(cat);
      }
      const newVer = await bumpBackendStoreVersion('categories_reordered');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 12. Add Quote Request (Local storage only, remote quote table disabled)
  const addQuote = async (quote: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>) => {
    const id = 'quote-' + Date.now();
    const newQuote: QuoteRequest = {
      ...quote,
      id,
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    const nextQuotes = [newQuote, ...quotes];
    setQuotesState(nextQuotes);
    safeLocalStorageSet('falcon_quotes', JSON.stringify(nextQuotes));
  };

  // 13. Update Quote Status
  const updateQuoteStatus = async (id: string, status: QuoteRequest['status']) => {
    const nextQuotes = quotes.map((q) => (q.id === id ? { ...q, status } : q));
    setQuotesState(nextQuotes);
    safeLocalStorageSet('falcon_quotes', JSON.stringify(nextQuotes));
  };

  // 14. Delete Quote Request
  const deleteQuote = async (id: string) => {
    const nextQuotes = quotes.filter((q) => q.id !== id);
    setQuotesState(nextQuotes);
    safeLocalStorageSet('falcon_quotes', JSON.stringify(nextQuotes));
  };

  // 15. Update Why Choose Us items
  const updateWhyChooseUs = async (items: WhyChooseItem[]) => {
    setWhyChooseUsState(items);
    safeLocalStorageSet('falcon_why_choose_us', JSON.stringify(items));

    try {
      await saveSupabaseStoreSettings({ whyChooseUs: items });
      const newVer = await bumpBackendStoreVersion('why_choose_us_updated');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 16. Update Catalogue Settings
  const updateCatalogueSettings = async (settings: Partial<CatalogueSettings>) => {
    const updated: CatalogueSettings = {
      ...catalogueSettings,
      ...settings,
    };
    setCatalogueSettingsState(updated);
    safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(updated));

    try {
      await saveSupabaseStoreSettings({ catalogueSettings: updated });
      const newVer = await bumpBackendStoreVersion('catalogue_settings_updated');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 17. Update Single Catalogue Page
  const updateSingleCataloguePage = async (page: CataloguePage) => {
    let nextSettings: CatalogueSettings | null = null;
    setCatalogueSettingsState((prev) => {
      const existing = prev.pages || defaultCatalogueSettings.pages;
      const idx = existing.findIndex((p) => p.id === page.id || p.pageNumber === page.pageNumber);
      let updatedPages: CataloguePage[];
      if (idx >= 0) {
        updatedPages = [...existing];
        updatedPages[idx] = { ...updatedPages[idx], ...page };
      } else {
        updatedPages = [...existing, page];
      }

      updatedPages.sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0));
      const updated: CatalogueSettings = {
        ...prev,
        pages: updatedPages,
      };
      nextSettings = updated;
      safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(updated));
      saveCataloguePagesToIdb(updatedPages).catch(() => {});
      return updated;
    });

    try {
      if (nextSettings) {
        await saveSupabaseStoreSettings({ catalogueSettings: nextSettings });
      }
      await upsertSupabaseCataloguePage(page);
      const newVer = await bumpBackendStoreVersion('catalogue_page_updated');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 18. Update Catalogue Pages
  const updateCataloguePages = async (pages: CataloguePage[]) => {
    const sorted = [...pages].sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0));
    let nextSettings: CatalogueSettings | null = null;
    setCatalogueSettingsState((prev) => {
      const updated: CatalogueSettings = {
        ...prev,
        pages: sorted,
      };
      nextSettings = updated;
      safeLocalStorageSet('falcon_catalogue_settings', JSON.stringify(updated));
      saveCataloguePagesToIdb(sorted).catch(() => {});
      return updated;
    });

    try {
      if (nextSettings) {
        await saveSupabaseStoreSettings({ catalogueSettings: nextSettings });
      }
      for (const page of sorted) {
        await upsertSupabaseCataloguePage(page);
      }
      const newVer = await bumpBackendStoreVersion('catalogue_pages_updated');
      if (newVer) setLocalStoreVersion(newVer);
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 19. Reset settings to default
  const resetToDefaults = async () => {
    setCompanyDetailsState(defaultCompanyDetails);
    setHeroContentState(defaultHeroContent);
    setLogoImageUrlState('');
    setProductsState(defaultProductsData);
    setCategoriesState(defaultCategoriesData);
    setWhyChooseUsState(defaultWhyChooseUsData);

    safeLocalStorageRemove('falcon_company_details');
    safeLocalStorageRemove('falcon_hero_content');
    safeLocalStorageRemove('falcon_logo_image');
    safeLocalStorageRemove('falcon_products');
    safeLocalStorageRemove('falcon_categories');
    safeLocalStorageRemove('falcon_why_choose_us');
    safeLocalStorageRemove('falcon_data_initialized');

    try {
      await saveSupabaseStoreSettings({
        companyDetails: defaultCompanyDetails,
        heroContent: defaultHeroContent,
        logoImageUrl: '',
        whyChooseUs: defaultWhyChooseUsData,
      });
      await bumpBackendStoreVersion('reset_to_defaults');
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));
    } catch {
      // Offline fallback
    }
  };

  // 20. Manual Force Sync All Data to Supabase
  const syncAllDataToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Save global store settings (public branding and settings only)
      await saveSupabaseStoreSettings({
        companyDetails,
        heroContent,
        logoImageUrl,
        whyChooseUs,
        catalogueSettings,
      });

      // 2. Save products
      for (const prod of products) {
        await upsertSupabaseProduct(prod);
      }

      // 3. Save categories
      for (const cat of categories) {
        await upsertSupabaseCategory(cat);
      }

      // 4. Save catalogue pages
      if (catalogueSettings?.pages?.length) {
        for (const page of catalogueSettings.pages) {
          await upsertSupabaseCataloguePage(page);
        }
      }

      await bumpBackendStoreVersion('manual_full_sync');
      fetchBackendFreshnessMetadata().then((m) => m && setCachedFreshnessMetadata(m));

      setIsSupabaseConnected(true);
      setSupabaseError(null);
      return {
        success: true,
        message: 'All products, categories, catalogue pages, and store settings successfully pushed to Supabase!',
      };
    } catch (err: any) {
      console.error('[Supabase Full Sync Error]', err);
      const errMsg = err?.message || String(err);
      setSupabaseError(errMsg);
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        companyDetails,
        heroContent,
        logoImageUrl,
        products,
        categories,
        whyChooseUs,
        quotes,
        catalogueSettings,
        adminCredentials,
        isAdminLoggedIn,
        isLoading: initialSyncStatus === 'loading',
        isInitialLoading: initialSyncStatus === 'loading',
        isCriticalDataReady: initialSyncStatus === 'success',
        initialSyncStatus,
        initialSyncError,
        hasOfflineCache,
        isCatalogueLoaded,
        isFirebaseConnected: isSupabaseConnected,
        isSupabaseConnected,
        firebaseError: supabaseError,
        supabaseError,
        retryFirebaseConnection: retrySupabaseConnection,
        retrySupabaseConnection,
        proceedWithOfflineCache,
        syncAllDataToSupabase,
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,
        updateCompanyDetails,
        updateHeroContent,
        updateLogoImage,
        updateCatalogueSettings,
        updateCataloguePages,
        updateSingleCataloguePage,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        addQuote,
        updateQuoteStatus,
        deleteQuote,
        updateWhyChooseUs,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useFalconStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useFalconStore must be used within a StoreProvider');
  }
  return context;
};

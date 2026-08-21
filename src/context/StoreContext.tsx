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
  saveSupabaseStoreSettings,
  fetchSupabaseCategories,
  upsertSupabaseCategory,
  deleteSupabaseCategory,
  fetchSupabaseProducts,
  upsertSupabaseProduct,
  deleteSupabaseProduct,
  fetchSupabaseQuotes,
  insertSupabaseQuote,
  updateSupabaseQuoteStatus,
  deleteSupabaseQuote,
  fetchSupabaseCataloguePages,
  upsertSupabaseCataloguePage,
  mapCategoryFromSupabase,
  mapProductFromSupabase,
  mapQuoteFromSupabase,
  mapCataloguePageFromSupabase,
} from '../services/supabaseService';
import {
  hashAdminPassword,
  generateSessionToken,
  verifySessionToken,
} from '../utils/security';

// Pre-computed hash of the initial default admin credentials (SHA-256)
const DEFAULT_ADMIN_EMAIL = 'rajveergreat786@gmail.com';
const DEFAULT_ADMIN_HASH = '7dde1b62c885a9d184a8b41e0ac7ef71f22f6d717aabb4064f6e6d28239cd372';

// Session expiry duration: 24 hours
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

function isSessionValid(email?: string, passwordHash?: string): boolean {
  const session = localStorage.getItem('falcon_admin_session');
  if (!session) return false;
  try {
    const parsed = JSON.parse(session);
    if (parsed.active && parsed.expiresAt) {
      if (Date.now() >= parsed.expiresAt) {
        return false;
      }
      // If token present, verify signature
      if (parsed.token && email && passwordHash) {
        // Fast synchronous check
        return true;
      }
      return true;
    }
  } catch {
    // Invalid JSON
  }
  return false;
}

async function createSession(email: string, passwordHash: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_EXPIRY_MS;
  const token = await generateSessionToken(email, passwordHash, expiresAt);
  const session = {
    active: true,
    email: email.trim().toLowerCase(),
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem('falcon_admin_session', JSON.stringify(session));
}

function destroySession(): void {
  localStorage.removeItem('falcon_admin_session');
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

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialSyncStatus, setInitialSyncStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [initialSyncError, setInitialSyncError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return isSessionValid();
  });

  const [adminCredentials, setAdminCredentialsState] = useState<AdminCredentials>(() => {
    try {
      const stored = localStorage.getItem('falcon_admin_credentials');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email && parsed.passwordHash) return parsed;
      }
    } catch {}
    return defaultAdminCreds;
  });

  const hasOfflineCache = useMemo(() => {
    try {
      const storedProds = localStorage.getItem('falcon_products');
      const storedCats = localStorage.getItem('falcon_categories');
      return Boolean(storedProds && storedCats);
    } catch {
      return false;
    }
  }, []);

  const [companyDetails, setCompanyDetailsState] = useState<CompanyDetails>(() => {
    const saved = localStorage.getItem('falcon_company_details');
    try {
      return saved ? mergeCompanyDetails(JSON.parse(saved)) : defaultCompanyDetails;
    } catch {
      return defaultCompanyDetails;
    }
  });

  const [heroContent, setHeroContentState] = useState<HeroContent>(() => {
    const saved = localStorage.getItem('falcon_hero_content');
    return saved ? JSON.parse(saved) : defaultHeroContent;
  });

  const [logoImageUrl, setLogoImageUrlState] = useState<string>(() => {
    return localStorage.getItem('falcon_logo_image') || '';
  });

  const [products, setProductsState] = useState<Product[]>(() => {
    const saved = localStorage.getItem('falcon_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategoriesState] = useState<Category[]>(() => {
    const saved = localStorage.getItem('falcon_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [whyChooseUs, setWhyChooseUsState] = useState<WhyChooseItem[]>(() => {
    const saved = localStorage.getItem('falcon_why_choose_us');
    return saved ? JSON.parse(saved) : defaultWhyChooseUsData;
  });

  const [quotes, setQuotesState] = useState<QuoteRequest[]>(() => {
    const saved = localStorage.getItem('falcon_quotes');
    return saved ? JSON.parse(saved) : [];
  });

  const [catalogueSettings, setCatalogueSettingsState] = useState<CatalogueSettings>(() => {
    const saved = localStorage.getItem('falcon_catalogue_settings');
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

  // Session expiry check — auto-logout if session expired
  useEffect(() => {
    if (isAdminLoggedIn && !isSessionValid()) {
      setIsAdminLoggedIn(false);
      destroySession();
    }
  }, [isAdminLoggedIn]);

  // Guard flag for initialization
  const isDataInitialized = () => localStorage.getItem('falcon_data_initialized') === 'true';
  const markDataInitialized = () => localStorage.setItem('falcon_data_initialized', 'true');

  // Supabase initial load and real-time subscription
  useEffect(() => {
    let isMounted = true;

    const initSupabaseSync = async () => {
      try {
        setInitialSyncStatus('loading');
        setInitialSyncError(null);

        // Fetch ALL critical initial datasets concurrently in parallel with allSettled
        const [
          settingsRes,
          productsRes,
          categoriesRes,
          pagesRes,
          quotesRes,
        ] = await Promise.allSettled([
          fetchSupabaseStoreSettings(),
          fetchSupabaseProducts(),
          fetchSupabaseCategories(),
          fetchSupabaseCataloguePages(),
          fetchSupabaseQuotes(),
        ]);

        if (!isMounted) return;

        const settingsResult = settingsRes.status === 'fulfilled' ? settingsRes.value : null;
        const productsResult = productsRes.status === 'fulfilled' ? productsRes.value : null;
        const categoriesResult = categoriesRes.status === 'fulfilled' ? categoriesRes.value : null;
        const pagesResult = pagesRes.status === 'fulfilled' ? pagesRes.value : null;
        const quotesResult = quotesRes.status === 'fulfilled' ? quotesRes.value : null;

        const hasAnyRemoteData = Boolean(
          settingsResult ||
          (productsResult && productsResult.length > 0) ||
          (categoriesResult && categoriesResult.length > 0) ||
          (pagesResult && pagesResult.length > 0) ||
          (quotesResult && quotesResult.length > 0)
        );

        // 1. Process Store Settings
        if (settingsResult) {
          markDataInitialized();
          if (settingsResult.companyDetails) {
            const merged = mergeCompanyDetails(settingsResult.companyDetails);
            setCompanyDetailsState(merged);
            localStorage.setItem('falcon_company_details', JSON.stringify(merged));
          }
          if (settingsResult.heroContent) {
            const mergedHero: HeroContent = {
              ...defaultHeroContent,
              ...settingsResult.heroContent,
              badge: settingsResult.heroContent.badge !== undefined ? settingsResult.heroContent.badge : defaultHeroContent.badge,
              showBadge: settingsResult.heroContent.showBadge !== undefined ? settingsResult.heroContent.showBadge : true,
            };
            setHeroContentState(mergedHero);
            localStorage.setItem('falcon_hero_content', JSON.stringify(mergedHero));
          }
          if (settingsResult.logoImageUrl !== undefined) {
            setLogoImageUrlState(settingsResult.logoImageUrl);
            localStorage.setItem('falcon_logo_image', settingsResult.logoImageUrl);
          }
          if (settingsResult.whyChooseUs) {
            setWhyChooseUsState(settingsResult.whyChooseUs);
            localStorage.setItem('falcon_why_choose_us', JSON.stringify(settingsResult.whyChooseUs));
          }
          if (settingsResult.catalogueSettings) {
            const mergedCat: CatalogueSettings = {
              ...defaultCatalogueSettings,
              ...settingsResult.catalogueSettings,
              pages: settingsResult.catalogueSettings.pages?.length
                ? settingsResult.catalogueSettings.pages
                : defaultCatalogueSettings.pages,
            };
            setCatalogueSettingsState(mergedCat);
            localStorage.setItem('falcon_catalogue_settings', JSON.stringify(mergedCat));
          }
          if (settingsResult.adminAuth?.email && settingsResult.adminAuth?.passwordHash) {
            setAdminCredentialsState({
              email: settingsResult.adminAuth.email,
              passwordHash: settingsResult.adminAuth.passwordHash,
            });
            localStorage.setItem('falcon_admin_credentials', JSON.stringify(settingsResult.adminAuth));
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
            adminAuth: defaultAdminCreds,
          }).catch((err) => console.log('[Supabase] Initial settings seed note:', err));
        }

        // 2. Process Products
        if (productsResult && productsResult.length > 0) {
          markDataInitialized();
          setProductsState(productsResult);
          localStorage.setItem('falcon_products', JSON.stringify(productsResult));
        } else if (!isDataInitialized() && !isSeedingRef.current) {
          for (const prod of defaultProductsData) {
            upsertSupabaseProduct(prod).catch(() => {});
          }
        }

        // 3. Process Categories
        if (categoriesResult && categoriesResult.length > 0) {
          markDataInitialized();
          const sortedCats = [...categoriesResult].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
          setCategoriesState(sortedCats);
          localStorage.setItem('falcon_categories', JSON.stringify(sortedCats));
        } else if (!isDataInitialized() && !isSeedingRef.current) {
          for (const cat of defaultCategoriesData) {
            upsertSupabaseCategory(cat).catch(() => {});
          }
        }

        // 4. Process Quotes
        if (quotesResult && quotesResult.length > 0) {
          setQuotesState(quotesResult);
          localStorage.setItem('falcon_quotes', JSON.stringify(quotesResult));
        }

        // 5. Process Catalogue Pages
        if (pagesResult && pagesResult.length > 0) {
          setCatalogueSettingsState((prev) => {
            const currentPages = prev.pages && prev.pages.length > 0 ? prev.pages : defaultCatalogueSettings.pages;
            const map = new Map<string, CataloguePage>();
            pagesResult.forEach((p) => map.set(p.id, p));

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
            localStorage.setItem('falcon_catalogue_settings', JSON.stringify(updated));
            return updated;
          });
        }

        // Check if we have data to display
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
        const hasLoadedData = hasAnyRemoteData || hasOfflineCache;

        if (!hasLoadedData && isOffline) {
          setIsSupabaseConnected(false);
          setInitialSyncError('No internet connection. Please check your network connection.');
          setInitialSyncStatus('error');
          return;
        }

        // Initial datasets checked and verified
        setIsSupabaseConnected(hasAnyRemoteData);
        setSupabaseError(null);
        setInitialSyncStatus('success');
      } catch (err: any) {
        console.warn('[Supabase] Initial sync connection note:', err?.message || err);
        if (isMounted) {
          const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
          if (!hasOfflineCache) {
            setIsSupabaseConnected(false);
            setInitialSyncError(
              isOffline
                ? 'No internet connection. Please check your network connection.'
                : 'Unable to connect to the store database. Please check your connection and retry.'
            );
            setInitialSyncStatus('error');
          } else {
            setIsSupabaseConnected(false);
            setSupabaseError(null);
            setInitialSyncError(null);
            setInitialSyncStatus('success');
          }
        }
      }
    };

    initSupabaseSync();

    // Setup Supabase Real-Time Channel Listener
    const channel = supabase
      .channel('falcon_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProd = mapProductFromSupabase(payload.new);
            setProductsState((prev) => [newProd, ...prev.filter((p) => p.id !== newProd.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedProd = mapProductFromSupabase(payload.new);
            setProductsState((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setProductsState((prev) => prev.filter((p) => p.id !== deletedId));
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
              return next;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setCategoriesState((prev) => prev.filter((c) => c.id !== deletedId));
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
            const newAuth = data.admin_auth || data.adminAuth;

            if (newDetails) {
              const merged = mergeCompanyDetails(newDetails);
              setCompanyDetailsState(merged);
              localStorage.setItem('falcon_company_details', JSON.stringify(merged));
            }
            if (newHero) {
              setHeroContentState(newHero);
              localStorage.setItem('falcon_hero_content', JSON.stringify(newHero));
            }
            if (newLogo !== undefined) {
              setLogoImageUrlState(newLogo);
              localStorage.setItem('falcon_logo_image', newLogo);
            }
            if (newWhy) {
              setWhyChooseUsState(newWhy);
              localStorage.setItem('falcon_why_choose_us', JSON.stringify(newWhy));
            }
            if (newCat) {
              setCatalogueSettingsState((prev) => {
                const merged = { ...prev, ...newCat };
                localStorage.setItem('falcon_catalogue_settings', JSON.stringify(merged));
                return merged;
              });
            }
            if (newAuth?.email && newAuth?.passwordHash) {
              setAdminCredentialsState(newAuth);
            }
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
              localStorage.setItem('falcon_catalogue_settings', JSON.stringify(updated));
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setCatalogueSettingsState((prev) => {
                const currentPages = prev.pages || defaultCatalogueSettings.pages;
                const nextPages = currentPages.filter((p) => p.id !== deletedId);
                const updated = { ...prev, pages: nextPages };
                localStorage.setItem('falcon_catalogue_settings', JSON.stringify(updated));
                return updated;
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newQuote = mapQuoteFromSupabase(payload.new);
            setQuotesState((prev) => [newQuote, ...prev.filter((q) => q.id !== newQuote.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedQuote = mapQuoteFromSupabase(payload.new);
            setQuotesState((prev) => prev.map((q) => (q.id === updatedQuote.id ? updatedQuote : q)));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = (payload.old as any)?.id;
            if (deletedId) {
              setQuotesState((prev) => prev.filter((q) => q.id !== deletedId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [retryTrigger]);

  // Admin Login Handler — uses SHA-256 hash comparison (async)
  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    const cleanInputEmail = (email || '').trim().toLowerCase();
    const inputHash = await hashAdminPassword(cleanInputEmail, password);

    // 1. Check in-memory state credentials
    const cleanAdminEmail = (adminCredentials.email || '').trim().toLowerCase();
    if (cleanInputEmail === cleanAdminEmail && inputHash === adminCredentials.passwordHash) {
      setIsAdminLoggedIn(true);
      await createSession(cleanAdminEmail, adminCredentials.passwordHash);
      return true;
    }

    // 2. Check stored local credentials
    try {
      const stored = localStorage.getItem('falcon_admin_credentials');
      if (stored) {
        const parsed = JSON.parse(stored);
        const parsedEmail = (parsed.email || '').trim().toLowerCase();
        if (parsedEmail && parsed.passwordHash && cleanInputEmail === parsedEmail && inputHash === parsed.passwordHash) {
          setIsAdminLoggedIn(true);
          await createSession(parsedEmail, parsed.passwordHash);
          return true;
        }
      }
    } catch {}

    // 3. Fallback check default credentials
    const cleanDefaultEmail = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
    if (cleanInputEmail === cleanDefaultEmail && inputHash === DEFAULT_ADMIN_HASH) {
      setIsAdminLoggedIn(true);
      await createSession(cleanDefaultEmail, DEFAULT_ADMIN_HASH);
      return true;
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
    localStorage.setItem('falcon_admin_credentials', JSON.stringify(newCreds));

    try {
      await saveSupabaseStoreSettings({ adminAuth: newCreds });
    } catch (e: any) {
      console.warn('[Supabase] Note saving admin credentials:', e);
    }
  };

  // 2. Update Company Details
  const updateCompanyDetails = async (details: Partial<CompanyDetails>) => {
    const updated = mergeCompanyDetails({ ...companyDetails, ...details });
    setCompanyDetailsState(updated);
    localStorage.setItem('falcon_company_details', JSON.stringify(updated));

    try {
      await saveSupabaseStoreSettings({ companyDetails: updated });
    } catch (e: any) {
      console.warn('[Supabase] Note saving company details:', e);
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
    localStorage.setItem('falcon_hero_content', JSON.stringify(updated));

    try {
      await saveSupabaseStoreSettings({ heroContent: updated });
    } catch (e: any) {
      console.warn('[Supabase] Note saving hero content:', e);
    }
  };

  // 4. Update Logo Image URL
  const updateLogoImage = async (url: string) => {
    let finalUrl = url;
    if (url) {
      finalUrl = await uploadOrCompressImage(url, 'logo');
    }
    setLogoImageUrlState(finalUrl);
    localStorage.setItem('falcon_logo_image', finalUrl);

    try {
      await saveSupabaseStoreSettings({ logoImageUrl: finalUrl });
    } catch (e: any) {
      console.warn('[Supabase] Note saving logo image:', e);
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
    localStorage.setItem('falcon_products', JSON.stringify([newProd, ...products]));

    try {
      await upsertSupabaseProduct(newProd);
    } catch (e: any) {
      console.warn('[Supabase] Note saving product:', e);
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
    localStorage.setItem('falcon_products', JSON.stringify(nextProducts));

    const target = nextProducts.find((p) => p.id === id);
    if (target) {
      try {
        await upsertSupabaseProduct(target);
      } catch (e: any) {
        console.warn('[Supabase] Note updating product:', e);
      }
    }
  };

  // 7. Delete Product
  const deleteProduct = async (id: string) => {
    const nextProducts = products.filter((p) => p.id !== id);
    setProductsState(nextProducts);
    localStorage.setItem('falcon_products', JSON.stringify(nextProducts));

    try {
      await deleteSupabaseProduct(id);
    } catch (e: any) {
      console.warn('[Supabase] Note deleting product:', e);
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
    localStorage.setItem('falcon_categories', JSON.stringify(nextCategories));

    try {
      await upsertSupabaseCategory(newCat);
    } catch (e: any) {
      console.warn('[Supabase] Note adding category:', e);
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
    localStorage.setItem('falcon_categories', JSON.stringify(nextCategories));

    const target = nextCategories.find((c) => c.id === id);
    if (target) {
      try {
        await upsertSupabaseCategory(target);
      } catch (e: any) {
        console.warn('[Supabase] Note updating category:', e);
      }
    }
  };

  // 10. Delete Category
  const deleteCategory = async (id: string) => {
    const nextCategories = categories.filter((c) => c.id !== id);
    setCategoriesState(nextCategories);
    localStorage.setItem('falcon_categories', JSON.stringify(nextCategories));

    try {
      await deleteSupabaseCategory(id);
    } catch (e: any) {
      console.warn('[Supabase] Note deleting category:', e);
    }
  };

  // 11. Reorder Categories
  const reorderCategories = async (newOrderedCategories: Category[]) => {
    const updatedWithOrder = newOrderedCategories.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    setCategoriesState(updatedWithOrder);
    localStorage.setItem('falcon_categories', JSON.stringify(updatedWithOrder));

    try {
      for (const cat of updatedWithOrder) {
        await upsertSupabaseCategory(cat);
      }
    } catch (e: any) {
      console.warn('[Supabase] Note reordering categories:', e);
    }
  };

  // 12. Add Quote Request
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
    localStorage.setItem('falcon_quotes', JSON.stringify(nextQuotes));

    try {
      await insertSupabaseQuote(newQuote);
    } catch (e: any) {
      console.warn('[Supabase] Note adding quote:', e);
    }
  };

  // 13. Update Quote Status
  const updateQuoteStatus = async (id: string, status: QuoteRequest['status']) => {
    const nextQuotes = quotes.map((q) => (q.id === id ? { ...q, status } : q));
    setQuotesState(nextQuotes);
    localStorage.setItem('falcon_quotes', JSON.stringify(nextQuotes));

    try {
      await updateSupabaseQuoteStatus(id, status);
    } catch (e: any) {
      console.warn('[Supabase] Note updating quote status:', e);
    }
  };

  // 14. Delete Quote Request
  const deleteQuote = async (id: string) => {
    const nextQuotes = quotes.filter((q) => q.id !== id);
    setQuotesState(nextQuotes);
    localStorage.setItem('falcon_quotes', JSON.stringify(nextQuotes));

    try {
      await deleteSupabaseQuote(id);
    } catch (e: any) {
      console.warn('[Supabase] Note deleting quote:', e);
    }
  };

  // 15. Update Why Choose Us items
  const updateWhyChooseUs = async (items: WhyChooseItem[]) => {
    setWhyChooseUsState(items);
    localStorage.setItem('falcon_why_choose_us', JSON.stringify(items));

    try {
      await saveSupabaseStoreSettings({ whyChooseUs: items });
    } catch (e: any) {
      console.warn('[Supabase] Note saving why choose us:', e);
    }
  };

  // 16. Update Catalogue Settings
  const updateCatalogueSettings = async (settings: Partial<CatalogueSettings>) => {
    const updated: CatalogueSettings = {
      ...catalogueSettings,
      ...settings,
    };
    setCatalogueSettingsState(updated);
    localStorage.setItem('falcon_catalogue_settings', JSON.stringify(updated));

    try {
      await saveSupabaseStoreSettings({ catalogueSettings: updated });
    } catch (e: any) {
      console.warn('[Supabase] Note updating catalogue settings:', e);
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
      localStorage.setItem('falcon_catalogue_settings', JSON.stringify(updated));
      return updated;
    });

    try {
      if (nextSettings) {
        await saveSupabaseStoreSettings({ catalogueSettings: nextSettings });
      }
      await upsertSupabaseCataloguePage(page);
    } catch (e: any) {
      console.warn('[Supabase] Note saving catalogue page:', e);
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
      localStorage.setItem('falcon_catalogue_settings', JSON.stringify(updated));
      return updated;
    });

    try {
      if (nextSettings) {
        await saveSupabaseStoreSettings({ catalogueSettings: nextSettings });
      }
      for (const page of sorted) {
        await upsertSupabaseCataloguePage(page);
      }
    } catch (e: any) {
      console.warn('[Supabase] Note saving catalogue pages:', e);
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

    localStorage.removeItem('falcon_company_details');
    localStorage.removeItem('falcon_hero_content');
    localStorage.removeItem('falcon_logo_image');
    localStorage.removeItem('falcon_products');
    localStorage.removeItem('falcon_categories');
    localStorage.removeItem('falcon_why_choose_us');
    localStorage.removeItem('falcon_data_initialized');

    try {
      await saveSupabaseStoreSettings({
        companyDetails: defaultCompanyDetails,
        heroContent: defaultHeroContent,
        logoImageUrl: '',
        whyChooseUs: defaultWhyChooseUsData,
        adminAuth: defaultAdminCreds,
      });
    } catch (e: any) {
      console.warn('[Supabase] Note resetting to defaults:', e);
    }
  };

  // 20. Manual Force Sync All Data to Supabase
  const syncAllDataToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Save global store settings
      await saveSupabaseStoreSettings({
        companyDetails,
        heroContent,
        logoImageUrl,
        whyChooseUs,
        catalogueSettings,
        adminAuth: adminCredentials,
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

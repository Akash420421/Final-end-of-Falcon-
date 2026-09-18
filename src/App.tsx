import React, { useState, useMemo, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
} from 'react-router-dom';
import { NavigationTab, Product } from './types';
import { StoreProvider, useFalconStore } from './context/StoreContext';
import { Header } from './components/Header';
import { NavigationRow } from './components/NavigationRow';
import { HeroSection } from './components/HeroSection';
import { SearchBar } from './components/SearchBar';
import { CategoryCarousel } from './components/CategoryCarousel';
import { CategoryProductsView } from './components/CategoryProductsView';
import { TrustBenefitsStrip } from './components/TrustBenefitsStrip';
import { FeaturedProducts } from './components/FeaturedProducts';
import { BulkDealerCTA } from './components/BulkDealerCTA';
import { AboutFalcon } from './components/AboutFalcon';
import { FactoryMapCard } from './components/FactoryMapCard';
import { WhyChooseUs } from './components/WhyChooseUs';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminLoadingScreen } from './components/admin/AdminLoadingScreen';
import { FullPageSkeletonLoader } from './components/SkeletonLoaders';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-load the heavy Admin Panel chunk so normal visitors never download admin code
const LazyAdminPanelModal = React.lazy(() =>
  import('./components/AdminPanelModal').then((m) => ({ default: m.AdminPanelModal }))
);

import { CatalogueView } from './components/CatalogueView';
import { SEOHead } from './components/SEOHead';
import { initAutomatedHeartbeat } from './services/heartbeatService';
import { shareProductOnWhatsApp, openWhatsAppChat } from './utils/whatsappHelper';
import { Phone, X } from 'lucide-react';

function MainContent() {
  // Initialize silent 24h keep-alive heartbeat in the background
  useEffect(() => {
    initAutomatedHeartbeat();
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isLoading,
    initialSyncStatus,
    initialSyncError,
    hasOfflineCache,
    proceedWithOfflineCache,
    retrySupabaseConnection,
    products,
    categories,
    companyDetails,
    isAdminLoggedIn,
    firebaseError,
    retryFirebaseConnection,
  } = useFalconStore();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Derive active tab from path
  const activeTab: NavigationTab = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/catalogue') || path.startsWith('/catalog')) return 'CATALOGUE';
    if (path.startsWith('/about')) return 'ABOUT';
    if (path.startsWith('/why-us')) return 'WHY_US';
    if (path.startsWith('/contact')) return 'CONTACT';
    if (path.startsWith('/products') || path.startsWith('/category') || path.startsWith('/product/'))
      return 'PRODUCTS';
    return 'HOME';
  }, [location.pathname]);

  // Derive selected category ID from URL
  const selectedCategoryId = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/category/')) {
      return path.split('/category/')[1] || null;
    }
    return null;
  }, [location.pathname]);

  // Derive selected product from URL /product/:id or query param ?product=id
  const selectedProduct = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/product/')) {
      const prodId = path.split('/product/')[1];
      return products.find((p) => p.id === prodId) || null;
    }
    const queryProdId = searchParams.get('product');
    if (queryProdId) {
      return products.find((p) => p.id === queryProdId) || null;
    }
    return null;
  }, [location.pathname, searchParams, products]);

  const isAdminPanelOpen = location.pathname === '/admin';

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesCategory = !selectedCategoryId || prod.category === selectedCategoryId;
      const matchesSearch =
        !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.amps && prod.amps.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  // Smart navigation handlers (Amazon/Flipkart style history de-duplication)
  const handleSelectTab = (tab: NavigationTab) => {
    let targetPath = '/';
    switch (tab) {
      case 'HOME':
        targetPath = '/';
        break;
      case 'ABOUT':
        targetPath = '/about';
        break;
      case 'PRODUCTS':
        targetPath = '/products';
        break;
      case 'CATALOGUE':
        targetPath = '/catalogue';
        break;
      case 'WHY_US':
        targetPath = '/why-us';
        break;
      case 'CONTACT':
        targetPath = '/contact';
        break;
    }

    // 1. Exact match de-duplication: If already on target path, scroll top without adding history stack entry
    if (location.pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Intra-section category/product reset when clicking main Products tab: use replace
    if (
      tab === 'PRODUCTS' &&
      (location.pathname.startsWith('/category/') || location.pathname.startsWith('/product/'))
    ) {
      navigate('/products', { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catId: string | null) => {
    const targetPath = catId ? `/category/${catId}` : '/products';

    // 1. De-duplication: If clicking the category already active, don't create duplicate history item
    if (location.pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Smart Category Filter: If already inside the Products screen/category list,
    // replace current entry so switching multiple categories does not trap the user in back loops.
    const isAlreadyInProducts =
      location.pathname === '/products' ||
      location.pathname.startsWith('/category/') ||
      location.pathname.startsWith('/product/');

    if (isAlreadyInProducts) {
      navigate(targetPath, { replace: true });
    } else {
      navigate(targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    const targetPath = `/product/${product.id}`;
    if (location.pathname === targetPath) return;
    navigate(targetPath);
  };

  const handleCloseProductModal = () => {
    if (location.pathname.startsWith('/product/')) {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate('/products', { replace: true });
      }
    }
  };

  // WhatsApp Handler
  const handleOpenWhatsApp = (productOrName?: Product | string | null) => {
    const rawPhone = companyDetails?.whatsapp || companyDetails?.phone || '+91 97175 49515';
    
    if (productOrName && typeof productOrName === 'object') {
      shareProductOnWhatsApp(productOrName, companyDetails);
      return;
    }

    if (typeof productOrName === 'string' && productOrName.trim()) {
      const foundProduct = products.find(
        (p) => p.name.toLowerCase() === productOrName.trim().toLowerCase() || p.id === productOrName.trim()
      );
      if (foundProduct) {
        shareProductOnWhatsApp(foundProduct, companyDetails);
        return;
      }
    }

    const company = companyDetails?.companyName || 'Verma Enterprises';
    const brand = companyDetails?.brandName || 'Falcon Electrics';
    const messageText = `Hello ${company} (${brand}), I am interested in your electrical products. Please share your latest catalogue and wholesale price list.`;
    openWhatsAppChat(rawPhone, messageText);
  };

  // Phone Call Handler
  const handleOpenPhone = () => {
    setIsPhoneModalOpen(true);
  };

  // Full Page Skeleton Loader removed for instant perceived performance.
  // The app will render instantly with default/cached data and hydrate when Supabase is ready.

  // Coordinated Error Screen with retry and cache fallback if initial sync failed
  if (initialSyncStatus === 'error') {
    return (
      <FullPageSkeletonLoader
        error={initialSyncError}
        onRetry={retrySupabaseConnection}
        onUseOfflineCache={proceedWithOfflineCache}
        hasCachedData={hasOfflineCache}
      />
    );
  }

  // Standalone Admin Panel Route — requires authentication
  if (isAdminPanelOpen) {
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <SEOHead />
          <AdminLoginModal
            isOpen={true}
            onClose={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/', { replace: true });
              }
            }}
            onSuccess={() => {
              // Successfully logged in — state update will immediately render AdminPanelModal
            }}
          />
        </div>
      );
    }
    return (
      <React.Suspense
        fallback={
          <AdminLoadingScreen
            isStandalone={true}
            targetProgress={100}
            statusMessage="Loading Falcon Admin Portal..."
          />
        }
      >
        <LazyAdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/', { replace: true });
            }
          }}
        />
      </React.Suspense>
    );
  }

  return (
    <div className={`min-h-screen ${activeTab === 'CATALOGUE' ? 'bg-slate-950' : 'bg-[#F7F7F8]'} flex flex-col w-full selection:bg-red-500 selection:text-white`}>
      {/* Dynamic SEO & JSON-LD Structured Data */}
      <SEOHead />

      {firebaseError && (
        <div className="bg-red-950 text-red-200 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 border-b border-red-800 shadow-lg">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Database Connection Notice: {firebaseError}</span>
          </span>
          <button
            onClick={retryFirebaseConnection}
            className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-extrabold transition shrink-0 ml-2 shadow"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Pinned / Sticky Top Header & Navigation Container (Remains 100% visible on scroll & swipe) */}
      <div className="sticky top-0 z-40 w-full shadow-md">
        {/* 1. Header (Desktop unified white header with integrated navigation & mobile header) */}
        <Header
          onOpenPhoneModal={handleOpenPhone}
          onOpenWhatsApp={() => handleOpenWhatsApp()}
          onToggleMenu={() => setIsMenuOpen(true)}
          onAdminTrigger={() => {
            if (isAdminLoggedIn) {
              navigate('/admin');
            } else {
              setIsAdminLoginOpen(true);
            }
          }}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenProductsDropdown={() => {
            if (location.pathname === '/products') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onSelectCategory={(categoryId) => {
            handleSelectCategory(categoryId);
          }}
        />

        {/* 2. Navigation Row Tabs */}
        <NavigationRow
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenProductsDropdown={() => {
            if (location.pathname === '/products') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      </div>

      {/* Main Content Sections based on Active Tab / Route */}
      <main className={`flex-1 w-full ${activeTab === 'CATALOGUE' ? 'pb-0 bg-slate-950' : 'pb-10'}`}>
        {activeTab === 'HOME' && (
          <>
            {/* Hero Section */}
            <HeroSection
              onViewProducts={() => handleSelectCategory(null)}
              onViewCatalogue={() => {
                if (location.pathname === '/catalogue') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/catalogue');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />

            {/* Search Bar */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
              onSelectCategory={(catId) => {
                if (catId === 'all') {
                  handleSelectCategory(null);
                } else {
                  handleSelectCategory(catId);
                }
              }}
              onSearchSubmit={(e) => {
                e.preventDefault();
                if (location.pathname === '/products') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />

            {/* Browse Categories */}
            <div id="categories-section">
              <CategoryCarousel
                selectedCategory={selectedCategoryId}
                onSelectCategory={handleSelectCategory}
              />
            </div>

            {/* Trust & Benefits Strip */}
            <TrustBenefitsStrip />

            {/* Featured Products Carousel */}
            <div id="featured-products">
              <FeaturedProducts
                products={filteredProducts}
                selectedCategoryName={selectedCategoryObj?.title}
                searchQuery={searchQuery}
                onSelectProduct={handleSelectProduct}
                onOpenWhatsApp={(prod) => handleOpenWhatsApp(prod)}
                onViewAllProducts={() => {
                  setSearchQuery('');
                  handleSelectCategory(null);
                }}
              />
            </div>

            {/* Bulk / Dealer Orders CTA */}
            <BulkDealerCTA />

            {/* About Falcon Electrics */}
            <AboutFalcon />

            {/* Mobile-Only Factory Location Map Card (Directly below About Us on Mobile screens, hidden on Desktop) */}
            <section className="block lg:hidden py-4 px-4 max-w-md mx-auto">
              <FactoryMapCard />
            </section>

            {/* Why Choose Us (Hidden on mobile Home scroll; shown on desktop & when Why Us tab is clicked) */}
            <div className="hidden lg:block">
              <WhyChooseUs />
            </div>

            {/* Contact Section with integrated Google Map (Hidden on mobile Home scroll; shown on desktop & when Contact tab is clicked) */}
            <div className="hidden lg:block">
              <ContactSection
                onOpenPhoneModal={handleOpenPhone}
                onOpenWhatsApp={() => handleOpenWhatsApp()}
              />
            </div>
          </>
        )}

        {activeTab === 'PRODUCTS' && (
          <CategoryProductsView
            products={filteredProducts}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleSelectCategory}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            onSelectProduct={handleSelectProduct}
            onOpenWhatsApp={(prod) => handleOpenWhatsApp(prod)}
          />
        )}

        {activeTab === 'CATALOGUE' && (
          <CatalogueView
            onOpenWhatsApp={(prod) => handleOpenWhatsApp(prod)}
          />
        )}

        {activeTab === 'ABOUT' && (
          <div className="py-2">
            <AboutFalcon initialExpanded={true} />
            <TrustBenefitsStrip />
            <BulkDealerCTA />
          </div>
        )}

        {activeTab === 'WHY_US' && (
          <div className="py-2">
            <WhyChooseUs />
            <TrustBenefitsStrip />
            <BulkDealerCTA />
          </div>
        )}

        {activeTab === 'CONTACT' && (
          <div className="py-2">
            <ContactSection
              onOpenPhoneModal={handleOpenPhone}
              onOpenWhatsApp={() => handleOpenWhatsApp()}
            />
          </div>
        )}
      </main>

      {/* Compact Footer (Hidden on Catalogue page as requested) */}
      {activeTab !== 'CATALOGUE' && (
        <Footer
          onOpenWhatsApp={() => handleOpenWhatsApp()}
          onOpenPhoneModal={handleOpenPhone}
        />
      )}

      {/* Product Details Drawer Sheet (Multi-page step-by-step history support) */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={handleCloseProductModal}
        onOpenWhatsApp={(prod) => handleOpenWhatsApp(prod)}
      />

      {/* Mobile Side Menu Drawer */}
      <MobileMenuDrawer
        isOpen={isMenuOpen}
        activeTab={activeTab}
        onClose={() => setIsMenuOpen(false)}
        onSelectTab={(tab) => {
          handleSelectTab(tab);
          setIsMenuOpen(false);
        }}
        onOpenWhatsApp={() => {
          handleOpenWhatsApp();
          setIsMenuOpen(false);
        }}
        onOpenAdminPanel={() => {
          setIsMenuOpen(false);
          if (location.pathname === '/admin') return;
          if (isAdminLoggedIn) {
            navigate('/admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* Admin Login Modal (Triggered by 10 clicks on logo) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          navigate('/admin');
        }}
      />

      {/* Direct Phone Call Dialog */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 text-center shadow-2xl relative">
            <button
              onClick={() => setIsPhoneModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-red-100 rounded-full text-[#E0183D] flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6" />
            </div>

            <h3 className="text-[16px] font-extrabold text-[#171827] mb-1">
              Call {companyDetails?.brandName || 'Falcon Electrics'} Sales
            </h3>
            <p className="text-[12px] text-slate-600 mb-4">
              Reach our sales team directly at:
            </p>
            <a
              href={`tel:${String(companyDetails?.phone || '+919717549515').replace(/[^0-9+]/g, '')}`}
              className="block w-full bg-[#E0183D] text-white font-bold py-2.5 rounded-xl text-[14px] shadow-md mb-2"
            >
              {companyDetails?.phone || '+91 97175 49515'}
            </a>
            <span className="text-[10px] text-slate-400">Available Mon-Sat: {companyDetails?.businessHours || '10:00 AM - 7:00 PM'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Router>
          <Routes>
            <Route path="*" element={<MainContent />} />
          </Routes>
        </Router>
      </StoreProvider>
    </ErrorBoundary>
  );
}


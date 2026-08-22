import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Phone, ChevronDown } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useFalconStore } from '../context/StoreContext';
import { NavigationTab } from '../types';

interface HeaderProps {
  onOpenPhoneModal: () => void;
  onOpenWhatsApp: () => void;
  onToggleMenu: () => void;
  onAdminTrigger: () => void;
  activeTab?: NavigationTab;
  onSelectTab?: (tab: NavigationTab) => void;
  onOpenProductsDropdown?: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPhoneModal,
  onOpenWhatsApp,
  onToggleMenu,
  onAdminTrigger,
  activeTab = 'HOME',
  onSelectTab,
  onOpenProductsDropdown,
  onSelectCategory,
}) => {
  const { companyDetails, logoImageUrl, categories } = useFalconStore();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isProductsHovered, setIsProductsHovered] = useState(false);

  const theme = companyDetails.headerTheme || 'white';

  const getThemeClasses = () => {
    switch (theme) {
      case 'white':
        return {
          header: 'bg-white text-slate-900 border-b border-slate-200/90 shadow-sm',
          menuBtn: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100',
          brandTitle: 'text-slate-950',
          brandSub: 'text-[#E0183D]',
          taglineText: 'text-slate-500',
          navLink: 'text-slate-700 hover:text-[#E0183D] hover:bg-slate-50',
          navLinkActive: 'text-[#E0183D] bg-red-50/80 font-black',
          phoneBtn: 'border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950',
        };
      case 'dark':
      case 'black':
      case 'darknavy':
        return {
          header: 'bg-[#101124] text-white border-b border-white/10 shadow-lg',
          menuBtn: 'text-slate-300 hover:text-white hover:bg-white/10',
          brandTitle: 'text-white',
          brandSub: 'text-[#E0183D]',
          taglineText: 'text-slate-400',
          navLink: 'text-slate-300 hover:text-white hover:bg-white/5',
          navLinkActive: 'text-[#E0183D] bg-red-950/40 font-black',
          phoneBtn: 'border border-white/20 bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white',
        };
      case 'navy':
        return {
          header: 'bg-slate-900 text-white border-b border-slate-800 shadow-md',
          menuBtn: 'text-slate-200 hover:text-white hover:bg-white/10',
          brandTitle: 'text-white',
          brandSub: 'text-[#E0183D]',
          taglineText: 'text-slate-400',
          navLink: 'text-slate-300 hover:text-white hover:bg-white/5',
          navLinkActive: 'text-[#E0183D] bg-red-950/40 font-black',
          phoneBtn: 'border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white',
        };
      default:
        return {
          header: 'bg-white text-slate-900 border-b border-slate-200/90 shadow-sm',
          menuBtn: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100',
          brandTitle: 'text-slate-950',
          brandSub: 'text-[#E0183D]',
          taglineText: 'text-slate-500',
          navLink: 'text-slate-700 hover:text-[#E0183D] hover:bg-slate-50',
          navLinkActive: 'text-[#E0183D] bg-red-50/80 font-black',
          phoneBtn: 'border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800',
        };
    }
  };

  const themeStyles = getThemeClasses();

  const handleLogoClick = () => {
    // Increment click count for 10-click admin secret trigger
    clickCountRef.current += 1;

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 10) {
      clickCountRef.current = 0;
      onAdminTrigger();
    } else {
      // Reset clicks after 4 seconds of inactivity
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 4000);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTagline = companyDetails.logoTagline || companyDetails.tagline || 'Switch to excellence';
  const shouldHideText = companyDetails.hideLogoText === true;

  return (
    <header className={`${themeStyles.header} h-[68px] lg:h-[84px] px-4 lg:px-8 w-full transition-all duration-300`}>
      <div className="w-full max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        {/* Left: Mobile Drawer Trigger + Falcon Brand Logo */}
        <div className="flex items-center gap-2.5 lg:gap-4 shrink-0">
          <button
            onClick={onToggleMenu}
            aria-label="Open Navigation Menu"
            className={`p-1.5 lg:p-2 rounded-lg transition active:scale-95 lg:hidden ${themeStyles.menuBtn}`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Falcon Logo / Custom Header Brand Banner (10 Clicks triggers Admin Login) */}
          <div
            className="flex items-center gap-2.5 lg:gap-3.5 cursor-pointer select-none group py-1"
            onClick={handleLogoClick}
            title={`${companyDetails.brandName || 'Falcon Electrics'} (Click to scroll top)`}
          >
            {/* Case 1: Custom Full Combined Header Brand Banner (Image containing custom logo + stylized colored name) */}
            {companyDetails.customHeaderBannerUrl ? (
              <div className="h-10 sm:h-12 lg:h-16 flex items-center shrink-0 max-w-[210px] xs:max-w-[250px] sm:max-w-[320px] lg:max-w-[420px] overflow-hidden">
                <img
                  src={companyDetails.customHeaderBannerUrl}
                  alt={companyDetails.brandName || 'Falcon Electrics'}
                  className="h-full w-auto max-w-full object-contain object-left transition-transform group-hover:scale-105"
                />
              </div>
            ) : (
              /* Case 2: Standard Separate Logo Icon + Text Layout */
              <>
                {logoImageUrl ? (
                  <div className="w-9 h-9 lg:w-16 lg:h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={logoImageUrl}
                      alt={companyDetails.brandName}
                      className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                ) : (
                  /* High-fidelity Falcon Winged Eagle Logo matching Brand Image */
                  <div className="w-9 h-9 lg:w-14 lg:h-14 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg viewBox="0 0 160 120" fill="none" className="w-full h-full drop-shadow-sm">
                      {/* Left Navy Wing */}
                      <path
                        d="M72 65 C68 45, 55 20, 25 10 C35 30, 42 48, 40 70 C30 55, 18 42, 5 35 C12 55, 22 72, 38 85 C26 78, 15 72, 8 70 C18 85, 32 96, 52 98 C60 88, 68 76, 72 65 Z"
                        fill="#0B1E48"
                      />
                      <path
                        d="M48 42 C40 28, 30 18, 25 10 C32 24, 45 46, 58 60 C55 52, 50 46, 48 42 Z"
                        fill="#1E3A8A"
                      />
                      {/* Eagle Center Head */}
                      <path
                        d="M74 48 C78 40, 84 40, 88 48 C88 56, 82 62, 78 68 C74 65, 72 58, 74 48 Z"
                        fill="#FFFFFF"
                        stroke="#0B1E48"
                        strokeWidth="3"
                      />
                      <path
                        d="M76 56 C74 60, 71 64, 68 66 C72 68, 77 67, 80 64 Z"
                        fill="#0B1E48"
                      />
                      {/* Right Crimson Red Wing */}
                      <path
                        d="M88 65 C92 45, 105 20, 135 10 C125 30, 118 48, 120 70 C130 55, 142 42, 155 35 C148 55, 138 72, 122 85 C134 78, 145 72, 152 70 C142 85, 128 96, 108 98 C100 88, 92 76, 88 65 Z"
                        fill="#E0183D"
                      />
                      <path
                        d="M112 42 C120 28, 130 18, 135 10 C128 24, 115 46, 102 60 C105 52, 110 46, 112 42 Z"
                        fill="#B00E2E"
                      />
                    </svg>
                  </div>
                )}

                {!shouldHideText && (
                  <>
                    {/* Mobile View (< lg): Classic compact stacked brand name */}
                    <div className="flex lg:hidden flex-col leading-tight select-none">
                      <span className={`text-[15px] font-black font-brand tracking-wide ${themeStyles.brandTitle}`}>
                        Falcon
                      </span>
                      <span className="text-[9px] font-black font-brand tracking-[0.18em] uppercase text-[#E0183D]">
                        ELECTRICS
                      </span>
                    </div>

                    {/* Desktop View (>= lg): Single horizontal line with first letter capital for both words in black, and RED uppercase subtitle */}
                    <div className="hidden lg:flex flex-col justify-center select-none py-0.5">
                      <div className="flex items-baseline gap-1.5 leading-none">
                        <span className="text-[20px] xl:text-[22px] font-black font-brand tracking-tight text-slate-900">
                          Falcon
                        </span>
                        <span className="text-[20px] xl:text-[22px] font-black font-brand tracking-tight text-slate-900">
                          Electrics
                        </span>
                      </div>
                      {currentTagline && (
                        <span className="text-[10px] xl:text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#E0183D] mt-1 leading-none">
                          {currentTagline}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Center: Desktop Navigation Bar (Integrated directly into the white header) */}
        <nav aria-label="Desktop Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Home Tab */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab?.('HOME');
            }}
            className={`relative px-3.5 py-2 rounded-xl text-[14px] xl:text-[15px] font-bold transition-colors no-underline cursor-pointer ${
              activeTab === 'HOME' ? themeStyles.navLinkActive : themeStyles.navLink
            }`}
          >
            <span className="relative z-10">Home</span>
            {activeTab === 'HOME' && (
              <motion.span
                layoutId="headerNavIndicator"
                className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#E0183D] rounded-full shadow-[0_-1px_6px_rgba(224,24,61,0.6)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                style={{ willChange: 'transform' }}
              />
            )}
          </a>

          {/* About Tab */}
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab?.('ABOUT');
            }}
            className={`relative px-3.5 py-2 rounded-xl text-[14px] xl:text-[15px] font-bold transition-colors no-underline cursor-pointer ${
              activeTab === 'ABOUT' ? themeStyles.navLinkActive : themeStyles.navLink
            }`}
          >
            <span className="relative z-10">About</span>
            {activeTab === 'ABOUT' && (
              <motion.span
                layoutId="headerNavIndicator"
                className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#E0183D] rounded-full shadow-[0_-1px_6px_rgba(224,24,61,0.6)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                style={{ willChange: 'transform' }}
              />
            )}
          </a>

          {/* Products Dropdown Tab */}
          <div
            className="relative"
            onMouseEnter={() => setIsProductsHovered(true)}
            onMouseLeave={() => setIsProductsHovered(false)}
          >
            <a
              href="/products"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab?.('PRODUCTS');
                onOpenProductsDropdown?.();
              }}
              className={`relative px-3.5 py-2 rounded-xl text-[14px] xl:text-[15px] font-bold transition-colors flex items-center gap-1.5 no-underline cursor-pointer ${
                activeTab === 'PRODUCTS' ? themeStyles.navLinkActive : themeStyles.navLink
              }`}
            >
              <span className="relative z-10">Products</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isProductsHovered ? 'rotate-180 text-[#E0183D]' : 'opacity-70'
                }`}
              />
              {activeTab === 'PRODUCTS' && (
                <motion.span
                  layoutId="headerNavIndicator"
                  className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#E0183D] rounded-full shadow-[0_-1px_6px_rgba(224,24,61,0.6)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  style={{ willChange: 'transform' }}
                />
              )}
            </a>

            {/* Desktop Products Dropdown Menu with Butter-Smooth Entrance/Exit */}
            <AnimatePresence>
              {isProductsHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    willChange: 'transform, opacity',
                    transform: 'translate3d(0, 0, 0)',
                  }}
                  className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 overflow-hidden"
                >
                  <div className="px-3 pb-2 mb-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Product Categories
                    </span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {categories.length} Ranges
                    </span>
                  </div>
                  {categories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/category/${cat.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsProductsHovered(false);
                        if (onSelectCategory) {
                          onSelectCategory(cat.id);
                        } else {
                          onSelectTab?.('PRODUCTS');
                        }
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center justify-between group/item transition-colors no-underline cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover/item:text-[#E0183D] transition-colors">
                          {cat.title}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium line-clamp-1">
                          {cat.subtitle || 'Switches & controls'}
                        </p>
                      </div>
                    </a>
                  ))}
                  <div className="pt-2 mt-1 border-t border-slate-100 px-3">
                    <a
                      href="/products"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsProductsHovered(false);
                        onSelectTab?.('PRODUCTS');
                      }}
                      className="block w-full text-center py-1.5 rounded-lg bg-slate-900 hover:bg-[#E0183D] active:scale-98 text-white text-[11px] font-bold transition-all shadow-sm no-underline cursor-pointer"
                    >
                      View All Products ({categories.length}+ Ranges)
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Tab */}
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab?.('CONTACT');
            }}
            className={`relative px-3.5 py-2 rounded-xl text-[14px] xl:text-[15px] font-bold transition-colors no-underline cursor-pointer ${
              activeTab === 'CONTACT' ? themeStyles.navLinkActive : themeStyles.navLink
            }`}
          >
            <span className="relative z-10">Contact</span>
            {activeTab === 'CONTACT' && (
              <motion.span
                layoutId="headerNavIndicator"
                className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#E0183D] rounded-full shadow-[0_-1px_6px_rgba(224,24,61,0.6)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                style={{ willChange: 'transform' }}
              />
            )}
          </a>

          {/* Why Choose Us Tab */}
          <a
            href="/why-us"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab?.('WHY_US');
            }}
            className={`relative px-3.5 py-2 rounded-xl text-[14px] xl:text-[15px] font-bold transition-colors no-underline cursor-pointer ${
              activeTab === 'WHY_US' ? themeStyles.navLinkActive : themeStyles.navLink
            }`}
          >
            <span className="relative z-10">Why Choose Us</span>
            {activeTab === 'WHY_US' && (
              <motion.span
                layoutId="headerNavIndicator"
                className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#E0183D] rounded-full shadow-[0_-1px_6px_rgba(224,24,61,0.6)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                style={{ willChange: 'transform' }}
              />
            )}
          </a>

          {/* Catalogue Tab */}
          <a
            href="/catalogue"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab?.('CATALOGUE');
            }}
            className={`relative px-3.5 py-2 rounded-xl text-[14px] xl:text-[15px] font-bold transition-colors no-underline cursor-pointer ${
              activeTab === 'CATALOGUE' ? themeStyles.navLinkActive : themeStyles.navLink
            }`}
          >
            <span className="relative z-10">Catalogue</span>
            {activeTab === 'CATALOGUE' && (
              <motion.span
                layoutId="headerNavIndicator"
                className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#E0183D] rounded-full shadow-[0_-1px_6px_rgba(224,24,61,0.6)]"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                style={{ willChange: 'transform' }}
              />
            )}
          </a>
        </nav>

        {/* Right: CTA Buttons (Call Sales & WhatsApp) */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <button
            onClick={onOpenPhoneModal}
            aria-label="Call Falcon Electrics"
            className={`w-9 h-9 lg:w-auto lg:h-10 lg:px-4 rounded-full lg:rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-sm ${themeStyles.phoneBtn}`}
          >
            <Phone className="w-4 h-4" />
            <span className="hidden lg:inline text-xs font-bold">Call Sales</span>
          </button>

          <button
            onClick={onOpenWhatsApp}
            aria-label="WhatsApp Falcon Electrics"
            className="w-9 h-9 lg:w-auto lg:h-10 lg:px-4 rounded-full lg:rounded-xl bg-[#25D366] hover:bg-[#20ba5a] flex items-center justify-center gap-2 text-white transition active:scale-95 shadow-sm"
          >
            <span className="text-lg">
              <FaWhatsapp size={18} />
            </span>
            <span className="hidden lg:inline text-xs font-bold">WhatsApp</span>
          </button>
        </div>
      </div>
    </header>
  );
};



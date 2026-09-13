import React, { useEffect, useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { ShieldCheck, ImageOff } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';
import { CataloguePage } from '../types';
import { ProtectedCatalogueCanvas, preloadCatalogueImage } from './ProtectedCatalogueCanvas';

interface CatalogueViewProps {
  onOpenWhatsApp?: (message?: string) => void;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  onOpenWhatsApp,
}) => {
  const { catalogueSettings, companyDetails, isCatalogueLoaded, initialSyncStatus } = useFalconStore();
  const pages = catalogueSettings.pages || [];
  const isDataLoading = initialSyncStatus === 'loading' || !isCatalogueLoaded;
  const [isBlackout, setIsBlackout] = useState(false);

  // Background Preloader: Preload all catalogue pages immediately so any switch or return is instant (0ms)
  useEffect(() => {
    if (pages && pages.length > 0) {
      pages.forEach((page: CataloguePage) => {
        const url = page.imageUrl || page.image;
        if (url) {
          preloadCatalogueImage(url);
        }
      });
    }
  }, [pages]);

  // Anti-Screenshot, Anti-Print & Window Blur Protection Listener
  useEffect(() => {
    // 1. When window loses focus or document becomes hidden (e.g. snipping tool, Android/iOS screenshot gesture, multitasking window)
    const handleBlur = () => {
      setIsBlackout(true);
    };

    const handleFocus = () => {
      // Small timeout to allow OS screenshot frame buffer to finish capturing the blank screen
      setTimeout(() => {
        setIsBlackout(false);
      }, 100);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        setIsBlackout(true);
      } else {
        setTimeout(() => {
          setIsBlackout(false);
        }, 100);
      }
    };

    // 2. Keyboard shortcuts & PrintScreen interceptor
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        setIsBlackout(true);
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText('');
          }
        } catch {
          // Ignore clipboard permission errors
        }
        setTimeout(() => setIsBlackout(false), 1200);
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        // Ctrl+P / Cmd+P (Print)
        if (e.key === 'p' || e.key === 'P' || e.keyCode === 80) {
          e.preventDefault();
          setIsBlackout(true);
          setTimeout(() => setIsBlackout(false), 800);
          return;
        }

        // Ctrl+S / Cmd+S (Save Webpage)
        if (e.key === 's' || e.key === 'S' || e.keyCode === 83) {
          e.preventDefault();
          return;
        }

        // Ctrl+U / Cmd+U (View Source)
        if (e.key === 'u' || e.key === 'U' || e.keyCode === 85) {
          e.preventDefault();
          return;
        }

        // Ctrl+C / Cmd+C (Copy)
        if (e.key === 'c' || e.key === 'C' || e.keyCode === 67) {
          const target = e.target as HTMLElement;
          if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
          e.preventDefault();
          return;
        }

        // Mac Screenshot shortcuts: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
        if (e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5' || e.keyCode === 51 || e.keyCode === 52 || e.keyCode === 53)) {
          e.preventDefault();
          setIsBlackout(true);
          setTimeout(() => setIsBlackout(false), 1500);
          return;
        }

        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools Inspect)
        if (e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
          e.preventDefault();
          return;
        }
      }

      // F12 (DevTools)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return;
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      e.preventDefault();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('copy', handleCopy, { capture: true });
    window.addEventListener('cut', handleCopy, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('dragstart', handleDragStart, { capture: true });

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('copy', handleCopy, { capture: true });
      window.removeEventListener('cut', handleCopy, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('dragstart', handleDragStart, { capture: true });
    };
  }, []);

  // WhatsApp Enquiry Click
  const handleWhatsAppClick = () => {
    const defaultMsg = `Hello ${companyDetails.brandName || 'Falcon Electrics'}, I am viewing your complete Product Catalogue on your website. I want to inquire about bulk ordering, product range details, and price list.`;
    const msg = catalogueSettings.whatsappMessage || defaultMsg;
    if (onOpenWhatsApp) {
      onOpenWhatsApp(msg);
    } else {
      const cleanPhone = (companyDetails.whatsapp || companyDetails.phone || '919717549515').replace(/\D/g, '');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center selection:bg-none selection:text-inherit pb-16 pt-4 sm:pt-8 catalogue-secure-zone relative select-none"
    >
      {/* Print Protection Notice for Browser Print Dialog */}
      <div className="print-protection-notice hidden">
        <h2>FALCON ELECTRICS (VERMA ENTERPRISES)</h2>
        <p>This digital catalogue is protected. Printing, copying, and unauthorized digital reproduction are strictly prohibited.</p>
        <p>For inquiries, please contact: {companyDetails.phone || '+91 97175 49515'}</p>
      </div>

      {/* Container to restrict width gracefully across mobile, tablet, and desktop */}
      <div className="w-full max-w-4xl px-3 sm:px-6 flex flex-col items-center catalogue-page-wrapper">
        
        {/* Main Heading */}
        <div className="text-center mb-6 sm:mb-8 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {catalogueSettings.title || 'Our Range Products & Details'}
          </h1>
          {catalogueSettings.subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
              {catalogueSettings.subtitle}
            </p>
          )}
        </div>

        {/* Vertical Stream of Protected Catalogue Images (Canvas DRM Protected) */}
        <div className="w-full space-y-6 sm:space-y-10 flex flex-col items-center catalogue-image-container">
          {pages.length > 0 ? (
            pages.map((page: CataloguePage, idx: number) => (
              <ProtectedCatalogueCanvas
                key={page.id || idx}
                page={page}
                index={idx}
                showPageNumbers={catalogueSettings.showPageNumbers}
                brandName={companyDetails.brandName || 'FALCON ELECTRICS'}
                isBlackout={isBlackout}
                isDataLoading={isDataLoading}
              />
            ))
          ) : isDataLoading ? (
            /* Loading state while catalogue data is being fetched */
            <div className="w-full max-w-2xl aspect-[1/1.4] sm:aspect-[1.4/1] min-h-[360px] sm:min-h-[440px] skeleton-shimmer-dark rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-3 p-6 text-center shadow-2xl">
              <ShieldCheck className="w-8 h-8 text-slate-600 animate-pulse" />
              <p className="text-xs font-bold text-slate-400 tracking-wide">
                Loading Protected Catalogue...
              </p>
            </div>
          ) : (
            /* Confirmed loaded + no pages */
            <div className="w-full max-w-2xl aspect-[1/1.4] sm:aspect-[1.4/1] min-h-[360px] sm:min-h-[440px] bg-slate-900/95 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center p-6 sm:p-10 select-none shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-lg shadow-black/20">
                <ImageOff className="w-7 h-7 text-slate-400 stroke-[1.75]" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Image not available
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 max-w-xs sm:max-w-sm mt-1.5 leading-relaxed">
                No image has been uploaded for this page yet.
              </p>
            </div>
          )}
        </div>

        {/* End of Catalogue: Connect to WhatsApp CTA Card */}
        <div className="w-full mt-8 sm:mt-12 bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-lg mx-auto space-y-3.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Have Questions? Need Bulk Pricing?
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect directly with our sales and manufacturing team on WhatsApp for instant catalog pricing, dealership terms, and custom orders.
            </p>

            <div className="pt-2 flex items-center justify-center">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="w-full sm:w-auto min-w-[240px] bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
              >
                <FaWhatsapp className="w-5 h-5 text-slate-950" />
                <span>CONNECT TO WHATSAPP</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              Direct Helpline: <span className="text-slate-300 font-semibold">{companyDetails.phone || '+91 97175 49515'}</span> | Fast Response
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

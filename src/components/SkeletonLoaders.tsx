import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ServerOff } from 'lucide-react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm animate-pulse space-y-3">
      <div className="w-full h-28 bg-slate-100 rounded-xl"></div>
      <div className="h-3 bg-slate-100 rounded w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
        <div className="h-6 bg-slate-100 rounded w-1/3"></div>
      </div>
      <div className="h-8 bg-slate-100 rounded-lg w-full"></div>
    </div>
  );
};

export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};

export const CategoryThumbnailSkeleton: React.FC = () => {
  return (
    <div className="shrink-0 w-60 h-32 rounded-2xl bg-white animate-pulse p-4 flex flex-col justify-between border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
        <div className="w-16 h-4 rounded-md bg-slate-100"></div>
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
        <div className="w-1/2 h-3 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
};

export const CategoryCarouselSkeleton: React.FC = () => {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
      {Array.from({ length: 4 }).map((_, idx) => (
        <CategoryThumbnailSkeleton key={idx} />
      ))}
    </div>
  );
};

interface FullPageSkeletonLoaderProps {
  error?: string | null;
  onRetry?: () => void;
  onUseOfflineCache?: () => void;
  hasCachedData?: boolean;
}

export const FullPageSkeletonLoader: React.FC<FullPageSkeletonLoaderProps> = ({
  error,
  onRetry,
}) => {
  const isBrowserOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col w-full overflow-hidden relative">
      {/* 1. Header Skeleton - Clean White & Subtle Neutral Gray */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200/80 rounded-xl animate-pulse"></div>
          <div>
            <div className="w-32 h-4 bg-slate-200/80 rounded animate-pulse"></div>
            <div className="w-24 h-2.5 bg-slate-100 rounded mt-1.5 animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* 2. Navigation Row Skeleton */}
      <div className="bg-white/80 border-b border-slate-200/60 px-4 py-2.5 flex items-center gap-3 shrink-0">
        <div className="w-16 h-4 bg-slate-200/80 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-slate-100 rounded-full animate-pulse"></div>
        <div className="w-24 h-4 bg-slate-100 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-slate-100 rounded-full animate-pulse"></div>
      </div>

      {/* Offline Alert Modal ONLY when the device is genuinely offline (no mobile data or Wi-Fi) */}
      {error && isBrowserOffline ? (
        <div className="flex-1 flex items-center justify-center p-4 z-20">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-xl space-y-5">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto text-[#E0183D] shadow-xs">
              <WifiOff className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                No Internet Connection Detected
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                You are currently offline. Please reconnect your mobile data or Wi-Fi and tap retry.
              </p>
            </div>

            <div className="pt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full bg-[#E0183D] hover:bg-[#c01233] text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Repeat / Retry Connection</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Normal Animated White / Neutral Gray Skeleton Structure matching exact store layout */
        <div className="flex-1 flex flex-col w-full overflow-hidden animate-pulse">
          {/* 3. Hero Section Skeleton - Clean White & Neutral Gray */}
          <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto w-full">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm min-h-[190px] flex flex-col justify-between">
              <div className="space-y-3 max-w-md">
                <div className="w-36 h-4 bg-slate-200/90 rounded-full"></div>
                <div className="w-4/5 h-7 bg-slate-200 rounded-xl"></div>
                <div className="w-3/5 h-4 bg-slate-100 rounded-md"></div>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-32 h-9 bg-slate-200 rounded-xl"></div>
                <div className="w-28 h-9 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* 4. Search Bar Skeleton */}
          <div className="px-3 sm:px-4 max-w-6xl mx-auto w-full mb-3">
            <div className="w-full h-12 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex items-center px-4 gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0"></div>
              <div className="w-48 h-3.5 bg-slate-100 rounded-md"></div>
            </div>
          </div>

          {/* 5. Categories Carousel Skeleton */}
          <div className="p-3 sm:p-4 max-w-6xl mx-auto w-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-36 h-5 bg-slate-200 rounded-md"></div>
              <div className="w-16 h-3 bg-slate-100 rounded"></div>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[200px] h-28 bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col justify-between shadow-xs shrink-0">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                  <div className="space-y-1.5">
                    <div className="w-3/4 h-3.5 bg-slate-200 rounded"></div>
                    <div className="w-1/2 h-2.5 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Products Skeleton Grid */}
          <div className="p-3 sm:p-4 max-w-6xl mx-auto w-full space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="w-40 h-5 bg-slate-200 rounded-md"></div>
              <div className="w-20 h-3 bg-slate-100 rounded"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3 space-y-3 shadow-xs">
                  <div className="w-full h-32 bg-slate-100 rounded-xl"></div>
                  <div className="w-1/2 h-3 bg-slate-100 rounded"></div>
                  <div className="w-3/4 h-4 bg-slate-200 rounded"></div>
                  <div className="w-full h-8 bg-slate-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Footer Status Bar */}
      <div className="bg-white border-t border-slate-200/80 py-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2 shrink-0">
        <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-[#E0183D] animate-ping'}`}></div>
        <span>
          {error ? 'Database Connection Notice' : 'Loading Falcon Electrics...'}
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Page-Specific Skeleton Loaders for Instant Tab Switching Transitions      */
/* -------------------------------------------------------------------------- */

export const AboutPageSkeleton: React.FC = () => {
  return (
    <div className="py-4 lg:py-8 px-4 max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <div className="w-28 h-5 bg-slate-200/90 rounded-full"></div>
        <div className="w-3/4 h-8 bg-slate-200 rounded-xl"></div>
        <div className="w-2/3 h-4 bg-slate-100 rounded-md"></div>
        <div className="w-full h-16 bg-slate-100/80 rounded-xl pt-2"></div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center space-y-2 shadow-xs">
            <div className="w-16 h-7 bg-slate-200 rounded-lg mx-auto"></div>
            <div className="w-20 h-3 bg-slate-100 rounded mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Story / Factory Block Skeleton */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <div className="w-40 h-6 bg-slate-200 rounded-lg"></div>
        <div className="space-y-2.5">
          <div className="w-full h-3.5 bg-slate-100 rounded"></div>
          <div className="w-11/12 h-3.5 bg-slate-100 rounded"></div>
          <div className="w-4/5 h-3.5 bg-slate-100 rounded"></div>
        </div>
        <div className="w-full h-48 bg-slate-100 rounded-2xl mt-4"></div>
      </div>
    </div>
  );
};

export const ProductsPageSkeleton: React.FC = () => {
  return (
    <div className="py-4 lg:py-10 px-4 lg:px-8 max-w-md lg:max-w-7xl mx-auto space-y-4 lg:space-y-8 animate-pulse">
      {/* Search Bar Skeleton */}
      <div className="w-full h-11 lg:h-14 bg-white border border-slate-200/90 rounded-xl lg:rounded-2xl shadow-xs flex items-center px-4 gap-3">
        <div className="w-4 h-4 rounded-full bg-slate-200"></div>
        <div className="w-48 h-3.5 bg-slate-100 rounded"></div>
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-28 h-9 bg-white border border-slate-200/80 rounded-xl shrink-0 shadow-xs"></div>
        ))}
      </div>

      {/* Title Skeleton */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-1.5">
          <div className="w-24 h-3 bg-slate-200 rounded"></div>
          <div className="w-40 h-6 bg-slate-200 rounded"></div>
        </div>
      </div>

      {/* Product Cards Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const WhyUsPageSkeleton: React.FC = () => {
  return (
    <div className="py-6 lg:py-12 px-4 max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-28 h-5 bg-slate-200 rounded-full mx-auto"></div>
        <div className="w-64 h-8 bg-slate-200 rounded-xl mx-auto"></div>
        <div className="w-80 h-4 bg-slate-100 rounded mx-auto"></div>
      </div>

      {/* Feature Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
            <div className="w-36 h-5 bg-slate-200 rounded"></div>
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-slate-100 rounded"></div>
              <div className="w-4/5 h-3 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ContactPageSkeleton: React.FC = () => {
  return (
    <div className="py-6 lg:py-12 px-4 max-w-6xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="w-28 h-5 bg-slate-200 rounded-full mx-auto"></div>
        <div className="w-60 h-8 bg-slate-200 rounded-xl mx-auto"></div>
        <div className="w-72 h-4 bg-slate-100 rounded mx-auto"></div>
      </div>

      {/* Two Columns Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info Cards */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0"></div>
              <div className="space-y-1.5 flex-1">
                <div className="w-20 h-3 bg-slate-100 rounded"></div>
                <div className="w-40 h-4 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Skeleton */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="w-36 h-5 bg-slate-200 rounded"></div>
          <div className="w-full h-10 bg-slate-100 rounded-xl"></div>
          <div className="w-full h-10 bg-slate-100 rounded-xl"></div>
          <div className="w-full h-24 bg-slate-100 rounded-xl"></div>
          <div className="w-full h-11 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export const CataloguePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-[80vh] bg-slate-900 text-white flex flex-col items-center justify-center p-4 space-y-6 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="w-48 h-6 bg-slate-800 rounded-lg"></div>
        <div className="w-32 h-9 bg-slate-800 rounded-xl"></div>
      </div>

      {/* Flip Book Page Skeleton */}
      <div className="w-full max-w-3xl aspect-[1/1.4] sm:aspect-[1.4/1] bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-3">
          <div className="w-24 h-4 bg-slate-700 rounded"></div>
          <div className="w-2/3 h-8 bg-slate-700 rounded-xl"></div>
        </div>
        <div className="w-full h-48 bg-slate-750/60 rounded-2xl flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-700"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
          <div className="w-28 h-4 bg-slate-700 rounded"></div>
          <div className="w-20 h-4 bg-slate-700 rounded"></div>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-800 rounded-full"></div>
        <div className="w-24 h-6 bg-slate-800 rounded-lg"></div>
        <div className="w-10 h-10 bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );
};



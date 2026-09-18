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

      {/* Error Overlay / Modal if initialization failed */}
      {error ? (
        <div className="flex-1 flex items-center justify-center p-4 z-20">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-xl space-y-5">
            <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto text-[#E0183D] shadow-xs">
              {isBrowserOffline ? (
                <WifiOff className="w-7 h-7" />
              ) : (
                <ServerOff className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isBrowserOffline
                  ? 'No Internet Connection Detected'
                  : 'Unable to Connect to Database'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {isBrowserOffline
                  ? 'Please check your internet connection or network speed and try again.'
                  : 'We could not fetch live store data from the server. Please check your connection and tap retry.'}
              </p>
            </div>

            <div className="pt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full bg-[#E0183D] hover:bg-[#c01233] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Connection</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Normal Animated White / Neutral Skeleton Structure */
        <div className="flex-1 flex flex-col w-full overflow-hidden animate-pulse">
          {/* 3. Hero Section Skeleton */}
          <div className="p-4 md:p-6 max-w-6xl mx-auto w-full">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-10 space-y-4 shadow-sm">
              <div className="w-36 h-4 bg-slate-200/80 rounded-full"></div>
              <div className="w-3/4 h-8 bg-slate-200/80 rounded-xl"></div>
              <div className="w-1/2 h-4 bg-slate-100 rounded-md"></div>
              <div className="pt-2 flex gap-3">
                <div className="w-32 h-10 bg-slate-200/80 rounded-xl"></div>
                <div className="w-32 h-10 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* 4. Search Bar Skeleton */}
          <div className="px-4 max-w-6xl mx-auto w-full my-1">
            <div className="w-full h-12 bg-white border border-slate-200/80 rounded-2xl shadow-xs"></div>
          </div>

          {/* 5. Categories Carousel Skeleton */}
          <div className="p-4 max-w-6xl mx-auto w-full space-y-3">
            <div className="w-40 h-5 bg-slate-200/80 rounded-md"></div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-[200px] h-28 bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                  <div className="space-y-1.5">
                    <div className="w-3/4 h-3.5 bg-slate-200/80 rounded"></div>
                    <div className="w-1/2 h-2.5 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Products Skeleton Grid */}
          <div className="p-4 max-w-6xl mx-auto w-full space-y-3 flex-1">
            <div className="w-48 h-5 bg-slate-200/80 rounded-md"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-3 space-y-3 shadow-xs">
                  <div className="w-full h-28 bg-slate-100 rounded-xl"></div>
                  <div className="w-1/2 h-3 bg-slate-100 rounded"></div>
                  <div className="w-3/4 h-4 bg-slate-200/80 rounded"></div>
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



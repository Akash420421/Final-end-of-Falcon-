import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm animate-pulse space-y-3">
      <div className="w-full h-28 bg-slate-200 rounded-xl"></div>
      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <div className="h-5 bg-slate-200 rounded w-1/4"></div>
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
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
    <div className="shrink-0 w-60 h-32 rounded-2xl bg-slate-200 animate-pulse p-4 flex flex-col justify-between border border-slate-300/50">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl bg-slate-300"></div>
        <div className="w-16 h-4 rounded-md bg-slate-300"></div>
      </div>
      <div className="space-y-2">
        <div className="w-3/4 h-4 bg-slate-300 rounded"></div>
        <div className="w-1/2 h-3 bg-slate-300 rounded"></div>
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

import { AlertTriangle, RefreshCw, Database } from 'lucide-react';

interface FullPageSkeletonLoaderProps {
  error?: string | null;
  onRetry?: () => void;
  onUseOfflineCache?: () => void;
  hasCachedData?: boolean;
}

export const FullPageSkeletonLoader: React.FC<FullPageSkeletonLoaderProps> = ({
  error,
  onRetry,
  onUseOfflineCache,
  hasCachedData = false,
}) => {
  return (
    <div className="min-h-screen bg-[#0E0F1D] text-white flex flex-col w-full overflow-hidden relative">
      {/* 1. Header Skeleton */}
      <div className="bg-[#121324] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-800 rounded-xl animate-pulse"></div>
          <div>
            <div className="w-28 h-4 bg-slate-800 rounded animate-pulse"></div>
            <div className="w-20 h-2.5 bg-slate-800/60 rounded mt-1 animate-pulse"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-800 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-slate-800 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* 2. Navigation Row Skeleton */}
      <div className="bg-[#18192E] border-b border-slate-800/80 px-4 py-2.5 flex items-center gap-4 shrink-0">
        <div className="w-16 h-3.5 bg-slate-800 rounded-full animate-pulse"></div>
        <div className="w-16 h-3.5 bg-slate-800 rounded-full animate-pulse"></div>
        <div className="w-16 h-3.5 bg-slate-800 rounded-full animate-pulse"></div>
        <div className="w-16 h-3.5 bg-slate-800 rounded-full animate-pulse"></div>
      </div>

      {/* Error Overlay / Modal if initialization failed */}
      {error ? (
        <div className="flex-1 flex items-center justify-center p-4 z-20">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-red-950/80 border border-red-800/60 rounded-2xl flex items-center justify-center mx-auto text-[#E0183D] shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-black text-white">
                Database Synchronization Issue
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unable to load initial products, categories, or website data from the database.
              </p>
            </div>

            {error && (
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 text-[11px] text-slate-300 font-mono break-all text-left">
                <span className="text-red-400 font-bold block mb-0.5">Error Details:</span>
                {error}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full bg-[#E0183D] hover:bg-[#c01233] text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Database Connection</span>
                </button>
              )}

              {hasCachedData && onUseOfflineCache && (
                <button
                  onClick={onUseOfflineCache}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Continue with Cached Data</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Normal Animated Skeleton Structure */
        <div className="flex-1 flex flex-col w-full overflow-hidden animate-pulse">
          {/* 3. Hero Section Skeleton */}
          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-10 space-y-4">
              <div className="w-36 h-4 bg-red-900/40 rounded-full"></div>
              <div className="w-3/4 h-8 bg-slate-800 rounded-lg"></div>
              <div className="w-1/2 h-4 bg-slate-800/80 rounded"></div>
              <div className="pt-2 flex gap-3">
                <div className="w-32 h-10 bg-red-600/30 rounded-xl"></div>
                <div className="w-32 h-10 bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* 4. Search Bar Skeleton */}
          <div className="px-4 max-w-6xl mx-auto w-full my-2">
            <div className="w-full h-12 bg-slate-900 border border-slate-800 rounded-2xl"></div>
          </div>

          {/* 5. Categories Carousel Skeleton */}
          <div className="p-4 max-w-6xl mx-auto w-full space-y-3">
            <div className="w-40 h-5 bg-slate-800 rounded"></div>
            <div className="flex gap-3 overflow-x-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-[200px] h-28 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg"></div>
                  <div className="space-y-1.5">
                    <div className="w-3/4 h-3.5 bg-slate-800 rounded"></div>
                    <div className="w-1/2 h-2.5 bg-slate-800/60 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Products Skeleton Grid */}
          <div className="p-4 max-w-6xl mx-auto w-full space-y-3 flex-1">
            <div className="w-48 h-5 bg-slate-800 rounded"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3">
                  <div className="w-full h-28 bg-slate-800 rounded-xl"></div>
                  <div className="w-1/2 h-3 bg-slate-800 rounded"></div>
                  <div className="w-3/4 h-4 bg-slate-800 rounded"></div>
                  <div className="w-full h-8 bg-slate-800 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Footer Status Bar */}
      <div className="bg-[#121324] border-t border-slate-800 py-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2 shrink-0">
        <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-amber-500 animate-ping'}`}></div>
        <span>
          {error ? 'Database Synchronization Paused' : 'Synchronizing Falcon Electrics Database...'}
        </span>
      </div>
    </div>
  );
};


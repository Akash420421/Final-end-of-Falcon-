import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. Product Card Skeleton — Exact 1:1 Pixel Match to Real Product Card     */
/* -------------------------------------------------------------------------- */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
      {/* Top Row: Badge & Rating */}
      <div className="flex items-center justify-between h-5">
        <div className="w-16 h-3.5 rounded-md skeleton-shimmer" />
        <div className="w-10 h-3.5 rounded skeleton-shimmer" />
      </div>

      {/* Product Image Container (Exact h-36 sm:h-40 matching FeaturedProducts) */}
      <div className="bg-slate-100 rounded-xl mb-2.5 h-36 sm:h-40 flex items-center justify-center mt-3 overflow-hidden relative">
        <div className="w-full h-full skeleton-shimmer" />
      </div>

      {/* Category / Amp Tag */}
      <div className="w-16 h-2.5 rounded skeleton-shimmer my-1" />

      {/* Product Name (2 Lines) */}
      <div className="space-y-1.5 my-1">
        <div className="w-11/12 h-3.5 rounded skeleton-shimmer" />
        <div className="w-3/5 h-3.5 rounded skeleton-shimmer" />
      </div>

      {/* Price & WhatsApp Button Row */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
        <div className="space-y-1">
          <div className="w-14 h-4 rounded skeleton-shimmer" />
          <div className="w-10 h-2.5 rounded skeleton-shimmer" />
        </div>
        <div className="w-8 h-8 rounded-lg skeleton-shimmer shrink-0" />
      </div>
    </div>
  );
};

export const ProductListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. Category Card Skeleton — Exact 1:1 Match to CategoryCarousel Card      */
/* -------------------------------------------------------------------------- */
export const CategoryThumbnailSkeleton: React.FC = () => {
  return (
    <div className="snap-start shrink-0 w-[82%] sm:w-[260px] lg:w-full rounded-2xl p-3 lg:p-3.5 bg-gradient-to-br from-[#101124] to-[#1E203C] border border-white/10 flex flex-col justify-between shadow-md relative overflow-hidden">
      {/* Top Right Floating Badge */}
      <div className="flex justify-end mb-1">
        <div className="w-16 h-4 rounded-full skeleton-shimmer-dark" />
      </div>

      {/* Prominent Image Box (Exact h-36 sm:h-40 lg:h-44) */}
      <div className="w-full h-36 sm:h-40 lg:h-44 xl:h-48 bg-white/95 rounded-xl p-2 flex items-center justify-center relative overflow-hidden shadow-inner border border-white/20">
        <div className="w-full h-full rounded-lg skeleton-shimmer" />
      </div>

      {/* Bottom Info Bar: Title & Arrow */}
      <div className="mt-3 pt-1 flex items-center justify-between gap-2">
        <div className="w-28 h-4 rounded skeleton-shimmer-dark" />
        <div className="w-7 h-7 rounded-full skeleton-shimmer-dark shrink-0" />
      </div>
    </div>
  );
};

export const CategoryCarouselSkeleton: React.FC = () => {
  return (
    <div className="px-4 max-w-md lg:max-w-7xl mx-auto py-2">
      <div className="mb-2 space-y-1">
        <div className="w-28 h-3 rounded skeleton-shimmer" />
        <div className="w-44 h-5 rounded skeleton-shimmer" />
      </div>
      <div className="flex gap-3 sm:gap-4 lg:gap-4 overflow-x-auto no-scrollbar pt-1 pb-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <CategoryThumbnailSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. Hero Section Skeleton — Dark Theme, Exact 7-Col / 5-Col Grid Structure  */
/* -------------------------------------------------------------------------- */
export const HeroSkeleton: React.FC = () => {
  return (
    <section className="bg-[#101124] text-white pt-4 pb-6 lg:pt-12 lg:pb-12 px-4 lg:px-8 relative overflow-hidden">
      <div className="max-w-md lg:max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-12 gap-2 sm:gap-6 lg:gap-12 items-center">
          {/* Left Column (7 cols) */}
          <div className="col-span-7 flex flex-col items-start pr-1 sm:pr-4 space-y-2 sm:space-y-3">
            {/* Red Badge Placeholder */}
            <div className="w-24 h-4 sm:h-5 rounded skeleton-shimmer-dark" />

            {/* Bold Headline (Exact line heights) */}
            <div className="w-full space-y-2">
              <div className="w-full h-5 xs:h-6 sm:h-8 lg:h-11 rounded-lg skeleton-shimmer-dark" />
              <div className="w-4/5 h-5 xs:h-6 sm:h-8 lg:h-11 rounded-lg skeleton-shimmer-dark" />
            </div>

            {/* Subtitle */}
            <div className="hidden sm:block w-3/4 h-3.5 lg:h-4 rounded skeleton-shimmer-dark" />

            {/* Action Buttons: View Catalogue & View Products */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-fit pt-1">
              <div className="w-28 sm:w-32 h-8 sm:h-10 rounded-xl skeleton-shimmer-dark" />
              <div className="w-24 sm:w-28 h-8 sm:h-10 rounded-xl skeleton-shimmer-dark" />
            </div>
          </div>

          {/* Right Column (5 cols) */}
          <div className="col-span-5 relative flex flex-col items-center justify-center py-1 sm:py-4">
            <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-44 sm:h-44 lg:w-60 lg:h-60 rounded-2xl skeleton-shimmer-dark" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. Search Bar Skeleton — Exact Height and Padding Match                    */
/* -------------------------------------------------------------------------- */
export const SearchBarSkeleton: React.FC = () => {
  return (
    <div className="px-4 max-w-md lg:max-w-7xl mx-auto my-3 sm:my-4">
      <div className="w-full h-11 sm:h-12 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex items-center justify-between px-3 sm:px-4 gap-3">
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-4 h-4 rounded-full skeleton-shimmer shrink-0" />
          <div className="w-48 h-3.5 rounded skeleton-shimmer" />
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl skeleton-shimmer shrink-0" />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. Complete Home Screen Skeleton (Rendered inside <main> under real Header)*/
/* -------------------------------------------------------------------------- */
export const HomeContentSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      {/* 1. Hero Section (Zero CLS, matches dark banner exactly) */}
      <HeroSkeleton />

      {/* 2. Search Bar */}
      <SearchBarSkeleton />

      {/* 3. Category Carousel */}
      <CategoryCarouselSkeleton />

      {/* 4. Featured Products Section */}
      <div className="px-4 max-w-md lg:max-w-7xl mx-auto py-3 space-y-3">
        <div className="space-y-1">
          <div className="w-28 h-3 rounded skeleton-shimmer" />
          <div className="w-44 h-5 rounded skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 6. Products Page Skeleton                                                  */
/* -------------------------------------------------------------------------- */
export const ProductsPageSkeleton: React.FC = () => {
  return (
    <div className="py-4 lg:py-10 px-4 lg:px-8 max-w-md lg:max-w-7xl mx-auto space-y-4 lg:space-y-8">
      {/* Search Bar Skeleton */}
      <div className="w-full h-11 lg:h-14 bg-white border border-slate-200/90 rounded-xl lg:rounded-2xl shadow-xs flex items-center px-4 gap-3">
        <div className="w-4 h-4 rounded-full skeleton-shimmer" />
        <div className="w-48 h-3.5 skeleton-shimmer rounded" />
      </div>

      {/* Category Pills Skeleton */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-28 h-9 rounded-xl shrink-0 skeleton-shimmer shadow-xs" />
        ))}
      </div>

      {/* Title Skeleton */}
      <div className="space-y-1.5 pt-1">
        <div className="w-24 h-3 skeleton-shimmer rounded" />
        <div className="w-40 h-6 skeleton-shimmer rounded" />
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 7. Full Page Error / Offline Fallback                                      */
/* -------------------------------------------------------------------------- */
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
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-xl space-y-5">
        <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto text-[#E0183D] shadow-xs">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            {error ? 'Unable to Connect to Server' : 'No Internet Connection Detected'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Please check your network connection and retry.
          </p>
        </div>

        <div className="pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-[#E0183D] hover:bg-[#c01233] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Connection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 8. Catalogue / About / Why Us / Contact Skeletons                         */
/* -------------------------------------------------------------------------- */
export const CataloguePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-[80vh] bg-slate-950 text-white flex flex-col items-center justify-center p-4 space-y-6">
      <div className="w-full max-w-4xl text-center space-y-2">
        <div className="w-64 h-8 skeleton-shimmer-dark rounded-xl mx-auto" />
        <div className="w-80 h-4 skeleton-shimmer-dark rounded mx-auto" />
      </div>

      <div className="w-full max-w-2xl aspect-[1/1.4] sm:aspect-[1.4/1] skeleton-shimmer-dark border border-slate-800 rounded-2xl shadow-2xl" />
    </div>
  );
};

export const AboutPageSkeleton: React.FC = () => {
  return (
    <div className="py-4 lg:py-8 px-4 max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
        <div className="w-28 h-5 skeleton-shimmer rounded-full" />
        <div className="w-3/4 h-8 skeleton-shimmer rounded-xl" />
        <div className="w-2/3 h-4 skeleton-shimmer rounded-md" />
        <div className="w-full h-16 skeleton-shimmer rounded-xl pt-2" />
      </div>
    </div>
  );
};

export const WhyUsPageSkeleton: React.FC = () => {
  return (
    <div className="py-6 lg:py-12 px-4 max-w-6xl mx-auto space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-28 h-5 skeleton-shimmer rounded-full mx-auto" />
        <div className="w-64 h-8 skeleton-shimmer rounded-xl mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="w-12 h-12 skeleton-shimmer rounded-xl" />
            <div className="w-36 h-5 skeleton-shimmer rounded" />
            <div className="w-full h-3 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ContactPageSkeleton: React.FC = () => {
  return (
    <div className="py-6 lg:py-12 px-4 max-w-6xl mx-auto space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="w-28 h-5 skeleton-shimmer rounded-full mx-auto" />
        <div className="w-60 h-8 skeleton-shimmer rounded-xl mx-auto" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-10 h-10 skeleton-shimmer rounded-xl shrink-0" />
              <div className="w-40 h-4 skeleton-shimmer rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="w-36 h-5 skeleton-shimmer rounded" />
          <div className="w-full h-10 skeleton-shimmer rounded-xl" />
          <div className="w-full h-24 skeleton-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ProductVisual } from './ProductVisual';
import { useFalconStore } from '../context/StoreContext';

interface HeroSectionProps {
  onViewProducts: () => void;
  onViewCatalogue?: () => void;
}

const HeroSectionComponent: React.FC<HeroSectionProps> = ({
  onViewProducts,
  onViewCatalogue,
}) => {
  const { heroContent } = useFalconStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Collect array of hero images (supports multiple images uploaded from Admin Panel, with fallback to permanent hero-switch.png)
  const defaultPermanentHeroImage = '/hero-switch.png';

  const rawHeroImages =
    heroContent.switchImages && heroContent.switchImages.length > 0
      ? heroContent.switchImages
      : heroContent.switchImageUrl
      ? [heroContent.switchImageUrl]
      : [defaultPermanentHeroImage];

  const heroImages = rawHeroImages
    .map((img) => {
      if (
        !img ||
        img.trim() === '' ||
        img === 'hero-fan-regulator' ||
        img === 'fan-regulator-5step' ||
        img === 'fan-regulator-white'
      ) {
        return defaultPermanentHeroImage;
      }
      return img;
    })
    .filter(Boolean);

  // Auto-slide transition effect every 3 seconds
  useEffect(() => {
    if (heroImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [heroImages.length, isPaused]);

  // Keep index within bounds if images array length changes
  useEffect(() => {
    if (currentIdx >= heroImages.length) {
      setCurrentIdx(0);
    }
  }, [heroImages.length, currentIdx]);

  return (
    <section className="bg-[#101124] text-white pt-4 pb-6 lg:pt-12 lg:pb-12 px-4 lg:px-8 relative overflow-hidden min-h-[220px] sm:min-h-[260px] lg:min-h-[340px]">
      <div className="max-w-md lg:max-w-7xl mx-auto relative z-10">
        {/* Top Split Layout: Content on Left, Product Visual on Right */}
        <div className="grid grid-cols-12 gap-2 sm:gap-6 lg:gap-12 items-center">
          
          {/* Left / Content Area (7 columns) */}
          <div className="col-span-7 flex flex-col items-start pr-1 sm:pr-4">
            {/* Small Red Accent Label (Shown only when enabled and not blank) */}
            {heroContent.showBadge !== false && !!heroContent.badge?.trim() && (
              <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-extrabold tracking-wider text-[#E0183D] uppercase bg-red-950/60 px-2 py-0.5 sm:px-3 sm:py-1 rounded sm:rounded-md border border-red-800/40 mb-1.5 sm:mb-2.5">
                {heroContent.badge.trim()}
              </span>
            )}

            {/* Bold Compact Heading */}
            <h1 className="text-[18px] xs:text-[20px] sm:text-[26px] lg:text-[40px] xl:text-[46px] leading-[1.18] lg:leading-[1.15] font-black text-white tracking-tight mb-2 sm:mb-3.5">
              {heroContent.headline || 'High Performance Switchgear & Modular Accessories'}
            </h1>

            {/* Description Paragraph (Hidden on very small screens to keep hero image prominent like screenshot) */}
            {heroContent.subtitle && (
              <p className="hidden sm:block text-xs lg:text-[16px] text-slate-300 leading-relaxed mb-3.5 lg:mb-6 max-w-xl">
                {heroContent.subtitle}
              </p>
            )}

            {/* Action Buttons: View Catalogue (Red) & View Products (Dark) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-fit mt-1">
              <a
                href="/catalogue"
                onClick={(e) => {
                  e.preventDefault();
                  if (onViewCatalogue) onViewCatalogue();
                  else onViewProducts();
                }}
                className="bg-[#E0183D] hover:bg-[#c01233] text-white font-bold text-[12px] sm:text-[14px] px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-md shadow-red-950/40 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap no-underline"
              >
                <span>View Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </a>

              <a
                href="/products"
                onClick={(e) => {
                  e.preventDefault();
                  onViewProducts();
                }}
                className="bg-[#14172C] hover:bg-[#1f2343] text-white font-medium text-[12px] sm:text-[14px] px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-center transition active:scale-95 cursor-pointer whitespace-nowrap no-underline"
              >
                <span>View Products</span>
              </a>
            </div>
          </div>

          {/* Right / Product Graphic Carousel Slider (5 columns) */}
          <div
            className="col-span-5 relative flex flex-col items-center justify-center py-1 sm:py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Product Cutout Slider with Smooth Cross-Fade Transition */}
            <div className="relative z-10 w-full flex items-center justify-center h-[130px] xs:h-[150px] sm:h-[180px] lg:h-[260px] px-0.5">
              {heroImages.length === 0 ? (
                <div className="w-full max-w-[120px] xs:max-w-[135px] sm:max-w-[180px] lg:max-w-[260px] aspect-square rounded-2xl flex items-center justify-center p-3 sm:p-5 drop-shadow-2xl">
                  <svg viewBox="0 0 160 120" fill="none" className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(224,24,61,0.35)]">
                    <path
                      d="M72 65 C68 45, 55 20, 25 10 C35 30, 42 48, 40 70 C30 55, 18 42, 5 35 C12 55, 22 72, 38 85 C26 78, 15 72, 8 70 C18 85, 32 96, 52 98 C60 88, 68 76, 72 65 Z"
                      fill="#3B82F6"
                    />
                    <path
                      d="M74 48 C78 40, 84 40, 88 48 C88 56, 82 62, 78 68 C74 65, 72 58, 74 48 Z"
                      fill="#FFFFFF"
                      stroke="#1E293B"
                      strokeWidth="2"
                    />
                    <path
                      d="M88 65 C92 45, 105 20, 135 10 C125 30, 118 48, 120 70 C130 55, 142 42, 155 35 C148 55, 138 72, 122 85 C134 78, 145 72, 152 70 C142 85, 128 96, 108 98 C100 88, 92 76, 88 65 Z"
                      fill="#E0183D"
                    />
                  </svg>
                </div>
              ) : (
                heroImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`w-full h-full flex items-center justify-center transition-opacity duration-300 drop-shadow-2xl bg-transparent lg:scale-110 xl:scale-125 ${
                      idx === currentIdx
                        ? 'opacity-100 relative pointer-events-auto'
                        : 'opacity-0 absolute pointer-events-none'
                    }`}
                  >
                    <ProductVisual
                      type={img}
                      size="hero"
                      className="w-full max-w-[120px] xs:max-w-[135px] sm:max-w-[180px] lg:max-w-[260px] aspect-square"
                    />
                  </div>
                ))
              )}
            </div>

            {/* Slide Pagination Dots for multiple hero images */}
            {heroImages.length > 1 && (
              <div className="relative z-20 flex items-center justify-center gap-1.5 mt-2 lg:mt-6">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    aria-label={`Go to hero slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIdx
                        ? 'w-5 bg-[#E0183D]'
                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export const HeroSection = React.memo(HeroSectionComponent);


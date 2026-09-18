import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';
import { ProductVisual } from './ProductVisual';
import { CategoryCarouselSkeleton } from './SkeletonLoaders';

interface CategoryCarouselProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { categories } = useFalconStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.clientWidth * 0.75;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveIndex(Math.min(Math.max(newIndex, 0), categories.length - 1));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [categories.length]);

  // Auto-swipe effect: smooth scrolling every 2.5 seconds
  useEffect(() => {
    if (categories.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const nextIdx = (activeIndex + 1) % categories.length;
        const cardWidth = scrollRef.current.clientWidth * 0.75;
        scrollRef.current.scrollTo({
          left: nextIdx * cardWidth,
          behavior: 'smooth',
        });
        setActiveIndex(nextIdx);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeIndex, categories.length, isPaused]);

  return (
    <section className="pt-7 pb-5 lg:pt-14 lg:pb-10 px-4 lg:px-8 max-w-md lg:max-w-7xl mx-auto">
      {/* Category Section Title & Red Accent Underline */}
      <div className="mb-4 lg:mb-8">
        <span className="text-[10px] lg:text-[12px] font-extrabold tracking-widest text-[#E0183D] uppercase block mb-1">
          BROWSE CATEGORIES
        </span>
        <h2 className="text-[19px] lg:text-[30px] xl:text-[34px] font-extrabold text-[#171827] tracking-tight relative inline-block">
          Explore <span className="relative inline-block">Our<span className="absolute bottom-0 left-0 w-full h-[3px] lg:h-[4px] bg-[#E0183D] rounded-full"></span></span> Product Range
        </h2>
      </div>

      {/* Horizontal Carousel on Mobile / Multi-column Grid on Desktop */}
      {categories.length === 0 ? (
        <CategoryCarouselSkeleton />
      ) : (
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className={`flex lg:grid ${
          categories.length === 1
            ? 'lg:grid-cols-1 max-w-sm mx-auto'
            : categories.length === 2
            ? 'lg:grid-cols-2 max-w-2xl mx-auto'
            : categories.length === 3
            ? 'lg:grid-cols-3 max-w-4xl mx-auto'
            : categories.length === 4
            ? 'lg:grid-cols-4'
            : categories.length === 5
            ? 'md:grid-cols-3 lg:grid-cols-5'
            : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
        } gap-3 sm:gap-4 lg:gap-4 xl:gap-5 overflow-x-auto lg:overflow-visible no-scrollbar snap-x lg:snap-none snap-mandatory pt-1 pb-3 smooth-scroll`}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const isCustomBg =
            cat.bgColor &&
            (cat.bgColor.startsWith('#') ||
              cat.bgColor.startsWith('rgb') ||
              cat.bgColor.startsWith('hsl') ||
              cat.bgColor.startsWith('linear-gradient') ||
              cat.bgColor.startsWith('radial-gradient'));

          return (
            <a
              key={cat.id}
              href={`/category/${cat.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory(cat.id);
              }}
              className={`group snap-start shrink-0 w-[82%] sm:w-[260px] lg:w-full rounded-2xl lg:rounded-2xl p-3 lg:p-3.5 cursor-pointer shadow-md category-card-gpu relative overflow-hidden flex flex-col justify-between border border-white/10 no-underline ${
                isSelected ? 'ring-2 ring-[#E0183D] ring-offset-2' : ''
              } ${!isCustomBg ? (cat.bgColor || 'bg-gradient-to-br from-[#101124] to-[#1E203C]') : ''} text-white hover:shadow-xl active:scale-98`}
              style={{
                ...(isCustomBg ? { background: cat.bgColor } : {}),
                willChange: 'transform',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Top Right Floating Badge */}
              {cat.badge && (
                <div className="absolute top-3.5 right-3.5 z-10 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white border border-white/20 shadow-sm">
                  {cat.badge}
                </div>
              )}

              {/* Prominent Image Box */}
              <div
                className="w-full h-36 sm:h-40 lg:h-44 xl:h-48 bg-white rounded-xl lg:rounded-xl p-2 sm:p-2.5 flex items-center justify-center relative overflow-hidden shadow-inner border border-white/20 transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ willChange: 'transform', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                <div className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden bg-white">
                  <ProductVisual
                    type={cat.imageUrl || cat.image}
                    size="category"
                    objectFit={cat.imageFit || 'contain'}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Bottom Info Bar: Category Title & Right Arrow */}
              <div className="mt-3 pt-1 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="text-[13px] sm:text-[14px] lg:text-[14px] xl:text-[15px] font-bold text-white leading-tight line-clamp-2 tracking-tight">
                    {cat.title}
                  </h3>
                  {cat.subtitle && (
                    <span className="text-[10px] lg:text-[11px] font-medium text-white/70 line-clamp-1 mt-0.5 block">
                      {cat.subtitle}
                    </span>
                  )}
                </div>

                {/* Arrow Icon Box */}
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 lg:w-8 lg:h-8 rounded-lg bg-white/15 group-hover:bg-[#E0183D] text-white flex items-center justify-center shrink-0 border border-white/20 group-hover:border-[#E0183D] shadow-sm transition-all duration-300 group-hover:translate-x-0.5"
                  style={{ willChange: 'transform', transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                >
                  <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 stroke-[2.5]" />
                </div>
              </div>
            </a>
          );
        })}
      </div>
      )}

      {/* Pagination Indicators (Mobile only) */}
      {categories.length > 0 && (
      <div className="flex items-center justify-center gap-1.5 mt-2 lg:hidden">
        {categories.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (scrollRef.current) {
                const cardWidth = scrollRef.current.clientWidth * 0.75;
                scrollRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
              }
            }}
            aria-label={`Go to category slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'w-5 bg-[#E0183D]' : 'w-1.5 bg-slate-300'
            }`}
          />
        ))}
      </div>
      )}
    </section>
  );
};

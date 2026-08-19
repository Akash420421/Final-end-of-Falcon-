import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';
import { ProductVisual } from './ProductVisual';

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
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-3.5 lg:gap-6 overflow-x-auto lg:overflow-visible no-scrollbar snap-x lg:snap-none snap-mandatory pt-1 pb-3 smooth-scroll"
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group snap-start shrink-0 w-[82%] sm:w-[260px] lg:w-full rounded-2xl lg:rounded-3xl p-3 lg:p-4 cursor-pointer shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between border ${
                isSelected ? 'ring-2 ring-[#E0183D] ring-offset-2' : ''
              } ${cat.bgColor || 'bg-gradient-to-br from-[#101124] to-[#1E203C]'} text-white hover:shadow-xl lg:hover:-translate-y-1.5 active:scale-98`}
            >
              {/* Top Right Floating Badge / Icon if present */}
              {cat.badge && (
                <div className="absolute top-4 right-4 z-10 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/20 shadow-sm">
                  {cat.badge}
                </div>
              )}

              {/* Big Prominent Image Box (Auto-fits uploaded custom category image up to card borders) */}
              <div className="w-full h-44 sm:h-48 lg:h-56 bg-white/95 rounded-xl lg:rounded-2xl p-1.5 sm:p-2 flex items-center justify-center relative overflow-hidden shadow-inner border border-white/20 transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="w-full h-full flex items-center justify-center rounded-lg lg:rounded-xl overflow-hidden bg-white">
                  <ProductVisual
                    type={cat.imageUrl || cat.image}
                    size="category"
                    objectFit={cat.imageFit || 'contain'}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Bottom Info Bar: Category Title & Right Arrow */}
              <div className="mt-3 lg:mt-4 pt-1 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-[14px] sm:text-[15px] lg:text-[16px] xl:text-[17px] font-black text-white leading-tight line-clamp-2 tracking-tight group-hover:text-red-300 transition-colors">
                    {cat.title}
                  </h3>
                  {cat.subtitle && (
                    <span className="text-[10px] lg:text-[11px] font-medium text-white/70 line-clamp-1 mt-0.5 block">
                      {cat.subtitle}
                    </span>
                  )}
                </div>

                {/* Arrow Icon Box */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-white/15 group-hover:bg-[#E0183D] text-white flex items-center justify-center shrink-0 border border-white/20 group-hover:border-[#E0183D] shadow-sm transition-all duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Indicators (Mobile only) */}
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
    </section>
  );
};

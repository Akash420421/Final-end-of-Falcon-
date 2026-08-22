import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Flame, Tag, ChevronRight } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSelectCategory?: (catId: string) => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSelectCategory,
  onSearchChange,
  onSearchSubmit,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Typewriter animated placeholder phrases for electrical products
  const placeholderPhrases = [
    '16 Amp Fan Regulator',
    '5-Step Rotary Switch',
    'Modular Switch Plates',
    'Piano Switches & Sockets',
    '32A DP Main Switch',
    'Cooler Kit Speed Switch',
    'Winter Heater Switches',
    'Heavy Duty Switchgear',
    'Appliance Spare Parts',
  ];

  const [animatedText, setAnimatedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter animation effect
  useEffect(() => {
    // If user has already typed something, don't run animation timers
    if (searchQuery) return;

    const currentPhrase = placeholderPhrases[phraseIndex % placeholderPhrases.length];
    let typingSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && animatedText === currentPhrase) {
      // Pause at full phrase before deleting
      typingSpeed = 2000;
    } else if (isDeleting && animatedText === '') {
      // Pause briefly before starting next phrase
      typingSpeed = 400;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && animatedText === currentPhrase) {
        setIsDeleting(true);
      } else if (isDeleting && animatedText === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % placeholderPhrases.length);
      } else if (isDeleting) {
        setAnimatedText(currentPhrase.substring(0, animatedText.length - 1));
      } else {
        setAnimatedText(currentPhrase.substring(0, animatedText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [animatedText, isDeleting, phraseIndex, searchQuery]);

  // Popular quick searches
  const recentSearches = [
    '16 Amp Rotary Switch',
    '5-Step Fan Regulator',
    'Modular Switch 6A',
    '32A DP Main Switch',
    'Cooler Speed Switch',
  ];

  // Popular Categories quick picks: Winter, Summer, Rocker, and All Switches
  const popularCategories = [
    { id: 'winter', name: 'Winter Switches', tag: 'Heater & Geyser' },
    { id: 'summer', name: 'Summer Switches', tag: 'Fan & Cooler' },
    { id: 'rocker', name: 'Rocker Switches', tag: '1-Way & 2-Way' },
    { id: 'all', name: 'All Switches', tag: 'Complete Range' },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="px-4 pt-4 pb-2 lg:pt-8 lg:pb-4 lg:px-8 relative z-30 max-w-md lg:max-w-4xl mx-auto">
      <form
        onSubmit={(e) => {
          setIsFocused(false);
          onSearchSubmit(e);
        }}
        className="bg-white rounded-2xl lg:rounded-2xl shadow-lg border border-slate-200/90 p-1.5 lg:p-2 flex items-center gap-2 lg:gap-3 transition focus-within:ring-2 focus-within:ring-[#E0183D]/30 focus-within:border-[#E0183D]"
      >
        {/* Left Search Icon */}
        <div className="pl-2 lg:pl-3 text-slate-400 flex items-center justify-center">
          <Search className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>

        {/* Text Input with Dynamic Animated Placeholder */}
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            animatedText
              ? `Search "${animatedText}"`
              : 'Search products (e.g. 16 Amp, Rotary Switch)'
          }
          className="w-full bg-transparent text-[13px] lg:text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none py-1.5 lg:py-2.5 font-medium"
        />

        {/* Clear Search Query Button if text exists */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="text-slate-400 hover:text-slate-600 p-1 lg:p-1.5"
          >
            <X className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          </button>
        )}

        {/* Right Red Square Search Button */}
        <button
          type="submit"
          aria-label="Execute Search"
          className="bg-[#E0183D] hover:bg-[#c01233] text-white w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition active:scale-95"
        >
          <Search className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2.5]" />
        </button>
      </form>

      {/* Quick-Access Dropdown Panel on Focus */}
      {isFocused && (
        <div className="absolute top-full left-4 right-4 lg:left-8 lg:right-8 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 lg:p-6 z-40 animate-fade-in divide-y divide-slate-100">
          {/* Recent / Popular Searches Section */}
          <div className="pb-3 lg:pb-4">
            <div className="flex items-center gap-1.5 text-[10px] lg:text-[12px] font-extrabold uppercase text-[#E0183D] tracking-wider mb-2 lg:mb-3">
              <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Recent & Popular Searches</span>
            </div>

            <div className="flex flex-wrap gap-1.5 lg:gap-2.5">
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onSearchChange(term);
                    setIsFocused(false);
                  }}
                  className="bg-slate-100 hover:bg-red-50 hover:text-[#E0183D] hover:border-red-200 text-slate-700 text-[11px] lg:text-[13px] font-semibold px-2.5 py-1 lg:px-3.5 lg:py-1.5 rounded-lg lg:rounded-xl border border-slate-200/80 transition flex items-center gap-1.5 active:scale-95"
                >
                  <Tag className="w-3 h-3 lg:w-3.5 lg:h-3.5 opacity-60" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Categories Section */}
          <div className="pt-3 lg:pt-4">
            <div className="flex items-center gap-1.5 text-[10px] lg:text-[12px] font-extrabold uppercase text-[#E0183D] tracking-wider mb-2 lg:mb-3">
              <Flame className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Explore Top Categories</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 lg:gap-3">
              {popularCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(cat.id);
                    }
                    setIsFocused(false);
                  }}
                  className="p-2 lg:p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[11px] lg:text-[13px] font-bold text-slate-800 group-hover:text-[#E0183D] block leading-tight">
                      {cat.name}
                    </span>
                    <span className="text-[9px] lg:text-[11px] text-slate-400 font-medium">
                      {cat.tag}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E0183D] transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

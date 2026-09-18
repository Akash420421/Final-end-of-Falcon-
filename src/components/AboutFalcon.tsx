import React, { useState, useRef } from 'react';
import { Factory, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';
import { OptimizedImage } from './OptimizedImage';

interface AboutFalconProps {
  initialExpanded?: boolean;
}

export const AboutFalcon: React.FC<AboutFalconProps> = ({ initialExpanded = false }) => {
  const { companyDetails } = useFalconStore();
  const [isMobileExpanded, setIsMobileExpanded] = useState(initialExpanded);
  const sectionRef = useRef<HTMLElement | null>(null);

  const handleReadLess = () => {
    setIsMobileExpanded(false);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="py-6 lg:py-12 px-4 lg:px-8 max-w-md lg:max-w-7xl mx-auto space-y-4 scroll-mt-20"
    >
      <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/90 shadow-sm lg:shadow-md p-5 lg:p-10 relative overflow-hidden transition-all duration-300">
        
        {/* Mobile View Container with Height Clamping & Smooth Dissolve Animation */}
        <div
          className={`transition-[max-height,opacity] duration-500 ease-in-out ${
            isMobileExpanded
              ? 'max-h-[1800px] opacity-100'
              : 'max-h-[210px] lg:max-h-none overflow-hidden relative opacity-95'
          }`}
        >
          <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
            {/* Left Column: Brand Story & Founder Quote */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-1.5 text-[10px] lg:text-[12px] font-extrabold tracking-widest text-[#E0183D] uppercase mb-1 lg:mb-2">
                <Factory className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                <span>ABOUT US</span>
              </div>

              <h2 className="text-[19px] lg:text-[30px] xl:text-[34px] font-extrabold text-[#171827] leading-snug mb-3 lg:mb-5">
                Manufacturing Excellence Since {companyDetails.foundedYear}
              </h2>

              <div className="space-y-3 lg:space-y-4 text-[12px] lg:text-[15px] text-slate-600 leading-relaxed">
                <p className="font-medium text-slate-800">
                  <strong>{companyDetails.brandName}</strong> is a brand of <strong>{companyDetails.companyName}</strong> — a Delhi-based B2B switch manufacturer focused on rotary switches, piano switches, rocker switches and mixer grinder switchgear for appliance makers across North India and PAN India.
                </p>

                <p>
                  Founded by <strong>{companyDetails.founder} in {companyDetails.foundedYear}</strong>, {companyDetails.companyName} has grown from a small workshop to one of Delhi's trusted switch manufacturers. Our journey has been driven by a singular focus on quality and reliability.
                </p>

                <p>
                  We specialize in manufacturing home appliance switches including rotary switches, piano switches, rocker switches, and mixer grinder switches. Each product undergoes rigorous quality testing before it leaves our facility.
                </p>
              </div>

              {/* Founder Quote Card */}
              <div className="mt-4 lg:mt-6 p-3.5 lg:p-6 bg-red-50/60 rounded-xl lg:rounded-2xl border border-red-200/80 relative">
                <Quote className="w-5 h-5 lg:w-7 lg:h-7 text-[#E0183D] opacity-40 absolute top-2 right-2 lg:top-4 lg:right-4" />
                <p className="text-[12px] lg:text-[15px] font-bold text-[#9E0B25] italic leading-snug lg:leading-relaxed">
                  "{companyDetails.quote}"
                </p>
              </div>
            </div>

            {/* Right Column: Key Metrics / Stats */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full pt-4 lg:pt-0">
              <div className="grid grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2 lg:gap-4 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="bg-slate-50 rounded-xl lg:rounded-2xl p-2.5 lg:p-5 border border-slate-200 text-center">
                  <span className="text-[17px] lg:text-[28px] font-extrabold text-[#E0183D] block leading-none mb-1 lg:mb-2">
                    {companyDetails.foundedYear}
                  </span>
                  <span className="text-[9px] lg:text-[12px] font-bold text-slate-600 leading-tight block">
                    Established
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl lg:rounded-2xl p-2.5 lg:p-5 border border-slate-200 text-center">
                  <span className="text-[17px] lg:text-[28px] font-extrabold text-[#E0183D] block leading-none mb-1 lg:mb-2">
                    500+
                  </span>
                  <span className="text-[9px] lg:text-[12px] font-bold text-slate-600 leading-tight block">
                    Products
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl lg:rounded-2xl p-2.5 lg:p-5 border border-slate-200 text-center">
                  <span className="text-[17px] lg:text-[28px] font-extrabold text-[#E0183D] block leading-none mb-1 lg:mb-2">
                    1000+
                  </span>
                  <span className="text-[9px] lg:text-[12px] font-bold text-slate-600 leading-tight block">
                    Clients
                  </span>
                </div>
              </div>

              {/* Visiting Card / Factory Certificate / Custom Image Box (Rendered when uploaded via Admin Panel) */}
              {companyDetails.visitingCardImageUrl && (
                <div className="mt-4 lg:mt-5 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm relative group overflow-hidden">
                  <div className="relative rounded-xl overflow-hidden bg-white border border-slate-200/80 aspect-[16/9] flex items-center justify-center">
                    <OptimizedImage
                      src={companyDetails.visitingCardImageUrl}
                      alt="Falcon Electrics Visiting Card"
                      width={640}
                      height={360}
                      quality={85}
                      objectFit="contain"
                      className="w-full h-full object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between px-1">
                    <span className="text-[10px] lg:text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Business Card & Verification
                    </span>
                    <a
                      href={companyDetails.visitingCardImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] lg:text-[11px] font-bold text-[#E0183D] hover:underline"
                    >
                      View Full
                    </a>
                  </div>
                </div>
              )}

              {/* Desktop Factory Reliability Card */}
              <div className="hidden lg:block mt-6 p-6 bg-slate-900 text-white rounded-2xl border border-slate-800">
                <span className="text-xs font-extrabold text-[#E0183D] uppercase tracking-wider block mb-2">
                  VERMA ENTERPRISES COMMITMENT
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Complete in-house tool room, injection molding & automated assembly lines to ensure zero-defect distribution across all Indian industrial hubs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Seamless Fade Overlay & Read More Trigger (Zero harsh lines, perfectly blended into background) */}
        {!isMobileExpanded && (
          <div className="lg:hidden absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/95 via-35% to-transparent pointer-events-none flex items-end justify-center pb-3">
            <button
              onClick={() => setIsMobileExpanded(true)}
              className="pointer-events-auto bg-white hover:bg-red-50 text-[#E0183D] border border-red-200 shadow-md shadow-slate-900/10 text-[12px] font-extrabold px-5 py-2 rounded-full flex items-center gap-1.5 transition-all active:scale-95 animate-pulse"
            >
              <span>Read More</span>
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Mobile Read Less Button (Visible on mobile when expanded) */}
        {isMobileExpanded && (
          <div className="lg:hidden pt-4 mt-2 border-t border-slate-100 flex justify-center">
            <button
              onClick={handleReadLess}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <span>Read Less</span>
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};


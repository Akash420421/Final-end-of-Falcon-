import React from 'react';
import { Navigation, ExternalLink, MapPin } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';
import { isSafeMapsEmbedUrl } from '../utils/security';

interface FactoryMapCardProps {
  className?: string;
  heightClass?: string;
}

export const FactoryMapCard: React.FC<FactoryMapCardProps> = ({
  className = '',
  heightClass = 'h-[230px] sm:h-[280px] lg:h-[380px]',
}) => {
  const { companyDetails } = useFalconStore();

  const mapQuery =
    companyDetails?.mapQuery?.trim() ||
    `${companyDetails?.companyName || 'Verma Enterprises'}, ${companyDetails?.address || '109-A/D, Block A, Vikas Nagar Extn, Uttam Nagar, New Delhi 110059'}`;

  // Default standard Google Maps embed URL
  const defaultEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&t=m&z=${companyDetails?.location?.zoom || 15}&ie=UTF8&iwloc=&output=embed`;

  let embedSrc = defaultEmbedSrc;

  if (companyDetails?.googleMapsEmbedUrl?.trim()) {
    const rawEmbed = companyDetails.googleMapsEmbedUrl.trim();
    let extractedSrc = rawEmbed;
    if (rawEmbed.includes('<iframe')) {
      const match = rawEmbed.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        extractedSrc = match[1];
      }
    }
    if (isSafeMapsEmbedUrl(extractedSrc)) {
      embedSrc = extractedSrc;
    }
  }

  const openGoogleMapsDirections = () => {
    if (companyDetails?.googleMapsDirectionsUrl?.trim()) {
      window.open(companyDetails.googleMapsDirectionsUrl.trim(), '_blank');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className={`bg-white rounded-2xl lg:rounded-3xl border border-slate-200/90 shadow-sm lg:shadow-md p-4 lg:p-7 space-y-3 lg:space-y-4 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-50 text-[#E0183D]">
            <Navigation className="w-4 h-4 lg:w-5 lg:h-5" />
          </div>
          <div>
            <span className="text-[10px] lg:text-[11px] font-extrabold uppercase text-[#E0183D] tracking-wider block">
              OUR LOCATION
            </span>
            <h3 className="text-[14px] lg:text-[17px] font-extrabold text-[#171827] leading-tight">
              {companyDetails?.companyName || 'Factory Location'}
            </h3>
          </div>
        </div>

        <button
          onClick={openGoogleMapsDirections}
          className="text-[11px] lg:text-[13px] font-bold text-[#E0183D] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 border border-red-100 shadow-sm"
        >
          <span>Directions</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Embedded Google Maps View (100% Reliable across all mobile devices & iframes) */}
      <div className={`relative rounded-xl lg:rounded-2xl overflow-hidden border border-slate-200 shadow-inner ${heightClass} z-10 flex-1 bg-slate-100`}>
        <iframe
          key={embedSrc}
          title="Falcon Electrics Factory Location Map"
          src={embedSrc}
          className="w-full h-full border-0"
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Quick Floating Map Open Overlay Button */}
        <div className="absolute bottom-2.5 right-2.5 z-20">
          <button
            onClick={openGoogleMapsDirections}
            className="bg-white/95 hover:bg-white text-[#101124] text-[10px] lg:text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-md border border-slate-200/90 flex items-center gap-1.5 transition active:scale-95"
          >
            <MapPin className="w-3 h-3 text-[#E0183D]" />
            <span>Open in Google Maps</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] lg:text-[13px] text-slate-600 font-medium leading-snug">
          {companyDetails.address}
        </p>
      </div>
    </div>
  );
};

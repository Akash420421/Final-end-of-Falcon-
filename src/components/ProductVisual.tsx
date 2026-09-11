import React from 'react';

interface ProductVisualProps {
  type: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'card' | 'category' | 'hero' | 'full';
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  type,
  size = 'card',
  className = '',
  objectFit,
}) => {
  // Default fit: 'contain' for hero showcases, logos & small icons, 'cover' for product cards
  const effectiveFit = objectFit || (size === 'hero' || size === 'sm' ? 'contain' : 'cover');

  // Dimensions based on size
  let containerSize = 'w-full h-full';
  if (!className.includes('w-') && !className.includes('h-')) {
    if (size === 'sm') containerSize = 'w-14 h-14';
    if (size === 'md') containerSize = 'w-full h-32 sm:h-36';
    if (size === 'card') containerSize = 'w-full h-36 sm:h-40 lg:h-44';
    if (size === 'lg') containerSize = 'w-full h-48 sm:h-56 lg:h-64';
    if (size === 'xl') containerSize = 'w-full h-56 sm:h-72 lg:h-80';
    if (size === 'category') containerSize = 'w-full h-full min-h-[140px] sm:min-h-[160px] lg:min-h-[190px]';
    if (size === 'hero') containerSize = 'w-28 h-28 xs:w-32 xs:h-32 sm:w-44 sm:h-44 lg:w-60 lg:h-60 max-w-full max-h-full';
  }

  // If custom uploaded image or image URL
  const isCustomImage =
    type &&
    (type.startsWith('data:') ||
      type.startsWith('http://') ||
      type.startsWith('https://') ||
      type.startsWith('blob:') ||
      type.startsWith('/') ||
      type.includes('/') ||
      type.endsWith('.png') ||
      type.endsWith('.jpg') ||
      type.endsWith('.jpeg') ||
      type.endsWith('.webp') ||
      type.endsWith('.svg'));

  if (isCustomImage) {
    const fitClass = effectiveFit === 'contain' ? 'object-contain' : effectiveFit === 'fill' ? 'object-fill' : 'object-cover';
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className} overflow-hidden`}>
        <img
          src={type}
          alt="Product or Category visual"
          loading="lazy"
          referrerPolicy="no-referrer"
          className={`w-full h-full ${fitClass} transition-transform duration-300 select-none`}
        />
      </div>
    );
  }

  if (type === 'hero-fan-regulator' || type === 'fan-regulator-5step' || type === 'fan-regulator-white') {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
        {/* Soft shadow under product plate */}
        <div className="absolute inset-2 bg-black/30 rounded-2xl blur-md transform translate-y-2"></div>
        {/* Main Modular Switch Plate */}
        <div className="relative w-full h-full bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-white/80 rounded-2xl shadow-xl flex flex-col items-center justify-center p-3">
          {/* Beveled Outer Trim */}
          <div className="w-full h-full rounded-xl bg-gradient-to-b from-slate-100 to-white border border-slate-200/90 shadow-inner flex flex-col items-center justify-center p-2 relative">
            
            {/* Top Brand Mark */}
            <div className="absolute top-1 text-[8px] font-bold text-slate-400 tracking-widest uppercase">
              FALCON
            </div>

            {/* Circular Dial Base Rim */}
            <div className="relative w-2/3 h-2/3 rounded-full bg-gradient-to-b from-slate-200 to-slate-100 shadow-md flex items-center justify-center border border-slate-300">
              
              {/* Dial Stepped Grooves & Dots around dial */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-400"></div>
              <div className="absolute top-1 right-2 w-1 h-1 rounded-full bg-slate-400"></div>
              <div className="absolute bottom-1 right-2 w-1 h-1 rounded-full bg-slate-400"></div>
              <div className="absolute bottom-1 left-2 w-1 h-1 rounded-full bg-slate-400"></div>
              <div className="absolute top-1 left-2 w-1 h-1 rounded-full bg-slate-400"></div>

              {/* Rotary Knob Cylinder */}
              <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-200 border border-slate-300 shadow-lg flex items-center justify-center relative">
                
                {/* Red Indicator Line on Knob */}
                <div className="w-1 h-1/2 bg-gradient-to-b from-[#E0183D] to-[#B00E2E] rounded-full absolute top-1 shadow-sm"></div>
                
                {/* Center Cap */}
                <div className="w-1/3 h-1/3 rounded-full bg-slate-300 border border-slate-400"></div>
              </div>
            </div>

            {/* Bottom Falcon Logo Icon */}
            <div className="absolute bottom-1.5 flex items-center gap-1 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span className="text-[7px] font-semibold text-slate-500">16A • 240V</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'rotary-switch-16a' || type === 'rotary-switch-blue') {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
        <div className="absolute inset-2 bg-black/25 rounded-2xl blur-md transform translate-y-1.5"></div>
        <div className="relative w-full h-full bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200 rounded-2xl shadow-lg flex flex-col items-center justify-center p-3">
          <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-2 relative">
            <div className="absolute top-1.5 text-[8px] font-extrabold text-slate-500 tracking-wider">
              HEATER 16A
            </div>
            {/* Dark Rotary Dial Box */}
            <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-300 shadow-md flex items-center justify-center relative">
              <div className="w-3/5 h-3/5 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
                <div className="w-1 h-full bg-red-500 rounded-full"></div>
              </div>
            </div>
            <div className="absolute bottom-1 text-[7px] font-bold text-slate-400">0 • 1 • 2 • 3</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'modular-switch-6a' || type === 'modular-plate-white') {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
        <div className="absolute inset-2 bg-black/20 rounded-2xl blur-sm transform translate-y-1"></div>
        <div className="relative w-full h-full bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 rounded-2xl shadow-md flex items-center justify-center p-3">
          <div className="w-2/3 h-4/5 bg-slate-100 border border-slate-300 rounded-lg shadow-inner flex flex-col items-center justify-between py-2">
            <div className="w-3/4 h-2/5 bg-gradient-to-b from-white to-slate-200 border border-slate-300 rounded shadow-sm flex items-center justify-center">
              <div className="w-2 h-0.5 bg-red-500 rounded-full"></div>
            </div>
            <div className="w-3/4 h-2/5 bg-gradient-to-b from-slate-200 to-slate-300 border border-slate-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'socket-6a-shutter') {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
        <div className="absolute inset-2 bg-black/20 rounded-2xl blur-sm transform translate-y-1"></div>
        <div className="relative w-full h-full bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 rounded-2xl shadow-md flex items-center justify-center p-3">
          <div className="w-3/4 h-3/4 bg-slate-100 border border-slate-300 rounded-full shadow-inner flex flex-col items-center justify-center relative p-2">
            {/* Top Pin */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 mb-1"></div>
            {/* Bottom 2 Pins */}
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-600"></div>
              <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-600"></div>
            </div>
            {/* Red Shutter Indicator */}
            <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-red-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / MCB / Heavy duty protection
  return (
    <div className={`relative flex items-center justify-center ${containerSize} ${className}`}>
      <div className="absolute inset-2 bg-black/20 rounded-2xl blur-sm transform translate-y-1"></div>
      <div className="relative w-full h-full bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-300 rounded-2xl shadow-md flex items-center justify-center p-3">
        <div className="w-2/3 h-5/6 bg-slate-800 rounded-md border border-slate-600 p-1.5 flex flex-col items-center justify-between">
          <div className="text-[7px] font-bold text-red-400">32A DP</div>
          <div className="w-full h-1/2 bg-red-600 rounded flex items-center justify-center text-white font-bold text-[9px] shadow">
            ON
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
        </div>
      </div>
    </div>
  );
};

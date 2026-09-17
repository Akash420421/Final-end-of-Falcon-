import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

interface ProductVisualProps {
  type?: string | null;
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [type]);

  // Default fit: 'contain' for hero showcases, category boxes & logos, 'cover' for standard product cards
  const effectiveFit =
    objectFit || (size === 'hero' || size === 'sm' || size === 'category' || size === 'full' ? 'contain' : 'cover');

  // Dimensions based on size
  let containerSize = 'w-full h-full';
  if (size === 'hero') {
    containerSize = 'w-28 h-28 xs:w-32 xs:h-32 sm:w-44 sm:h-44 lg:w-64 lg:h-64 aspect-square shrink-0';
  } else if (!className.includes('w-') && !className.includes('h-')) {
    if (size === 'sm') containerSize = 'w-14 h-14';
    if (size === 'md') containerSize = 'w-full h-32 sm:h-36';
    if (size === 'card') containerSize = 'w-full h-36 sm:h-40 lg:h-44';
    if (size === 'lg') containerSize = 'w-full h-48 sm:h-56 lg:h-64';
    if (size === 'xl') containerSize = 'w-full h-56 sm:h-72 lg:h-80';
    if (size === 'category') containerSize = 'w-full h-full min-h-[140px] sm:min-h-[160px] lg:min-h-[190px]';
  }

  const isDark = size === 'hero';
  const shimmerClass = isDark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer';

  const cleanType = type ? String(type).trim() : '';

  // Check if type is a legacy hardcoded demo placeholder name
  const isLegacyDemoString =
    !cleanType ||
    cleanType === 'hero-fan-regulator' ||
    cleanType === 'fan-regulator-5step' ||
    cleanType === 'fan-regulator-white' ||
    cleanType === 'rotary-switch-16a' ||
    cleanType === 'rotary-switch-blue' ||
    cleanType === 'modular-switch-6a' ||
    cleanType === 'modular-plate-white' ||
    cleanType === 'socket-6a-shutter' ||
    cleanType === 'mixer-rotary-overload' ||
    cleanType === 'rocker-1way-2way' ||
    cleanType === 'pedestal-fan-switch';

  const isCustomImage =
    !isLegacyDemoString &&
    (cleanType.startsWith('data:') ||
      cleanType.startsWith('http://') ||
      cleanType.startsWith('https://') ||
      cleanType.startsWith('blob:') ||
      cleanType.startsWith('/') ||
      cleanType.includes('/') ||
      cleanType.endsWith('.png') ||
      cleanType.endsWith('.jpg') ||
      cleanType.endsWith('.jpeg') ||
      cleanType.endsWith('.webp') ||
      cleanType.endsWith('.svg') ||
      cleanType.includes('supabase.co'));

  // If we have a valid custom image URL and no loading error
  if (isCustomImage && !hasError) {
    const fitClass =
      effectiveFit === 'contain'
        ? 'object-contain'
        : effectiveFit === 'fill'
        ? 'object-fill'
        : 'object-cover';

    return (
      <div
        className={`relative flex items-center justify-center ${containerSize} ${className} bg-transparent overflow-hidden`}
      >
        {/* Animated Skeleton Shimmer on the exact image area until loaded */}
        {!isLoaded && (
          <div
            className={`absolute inset-0 rounded-xl ${shimmerClass} z-10 transition-opacity duration-300 pointer-events-none`}
          />
        )}
        <img
          src={cleanType}
          alt="Product or Category"
          loading={size === 'hero' ? 'eager' : 'lazy'}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full ${fitClass} select-none transition-opacity duration-300 ${
            !isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    );
  }

  // If no image is provided, or during initial loading, or if image errored:
  // Render ONLY the animated skeleton shimmer on the image area (NO demo graphic / mock switch)
  return (
    <div
      className={`relative flex items-center justify-center ${containerSize} ${className} rounded-xl overflow-hidden`}
    >
      <div className={`absolute inset-0 ${shimmerClass}`} />
      {hasError && (
        <div className="relative z-10 flex flex-col items-center justify-center text-slate-400 opacity-40">
          <ImageIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

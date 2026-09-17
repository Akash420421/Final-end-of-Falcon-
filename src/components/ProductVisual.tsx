import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon } from 'lucide-react';

// Global memory cache of successfully loaded image URLs
// Ensures images that loaded once render instantly with 0ms delay across all page switches
const loadedImageCache = new Set<string>();

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
  const cleanType = type ? String(type).trim() : '';
  const imgRef = useRef<HTMLImageElement>(null);

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

  // Initialize isLoaded directly to true if already in our loaded image cache
  const [isLoaded, setIsLoaded] = useState<boolean>(() => {
    if (!isCustomImage) return true;
    return loadedImageCache.has(cleanType);
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isCustomImage) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    if (loadedImageCache.has(cleanType)) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    // Check if the HTMLImageElement in the DOM already completed loading synchronously
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      loadedImageCache.add(cleanType);
      setIsLoaded(true);
      setHasError(false);
    } else {
      setIsLoaded(false);
      setHasError(false);
    }
  }, [cleanType, isCustomImage]);

  const handleImageLoad = () => {
    if (cleanType) {
      loadedImageCache.add(cleanType);
    }
    setIsLoaded(true);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

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

  // Case 1: If there is a valid custom image URL and no loading error
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
        {/* Animated Skeleton Shimmer ONLY while the image is downloading for the first time */}
        {!isLoaded && (
          <div
            className={`absolute inset-0 rounded-xl ${shimmerClass} z-10 pointer-events-none transition-opacity duration-200`}
          />
        )}
        <img
          ref={imgRef}
          src={cleanType}
          alt="Product or Category"
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full ${fitClass} select-none transition-opacity duration-150 ${
            !isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    );
  }

  // Case 2: If image errored or no image exists, render a clean neutral container (NO endless shimmer)
  return (
    <div
      className={`relative flex items-center justify-center ${containerSize} ${className} bg-slate-100/90 rounded-xl overflow-hidden`}
    >
      <div className="flex flex-col items-center justify-center text-slate-400/60 p-2">
        <ImageIcon className="w-5 h-5" />
      </div>
    </div>
  );
};

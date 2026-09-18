import React, { useState } from 'react';
import { getOptimizedImageUrl, generateResponsiveSrcSet } from '../utils/imageOptimizer';

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'srcSet'> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  className?: string;
  fallbackSrc?: string;
}

/**
 * High-Performance Image component (Next.js Image equivalent for Vite/React)
 * 
 * Features:
 * - Next.js <Image /> API parity (priority, fill, sizes, quality >= 80, objectFit)
 * - Automatic Supabase Storage CDN URL optimization
 * - Above-the-fold priority loading (fetchPriority="high", loading="eager", decoding="async")
 * - Below-the-fold lazy loading (loading="lazy", decoding="async")
 * - Layout Shift (CLS) prevention with container sizing or intrinsic dimensions
 * - Smooth fade-in transition on load
 * - Fallback error handling
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  sizes,
  objectFit = 'contain',
  className = '',
  fallbackSrc,
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback if load fails
  const currentSrc = hasError && fallbackSrc ? fallbackSrc : src;

  // Optimized target dimension estimation
  const targetWidth = typeof width === 'number' ? width : undefined;
  const targetHeight = typeof height === 'number' ? height : undefined;

  const optimizedSrc = getOptimizedImageUrl(currentSrc, {
    width: targetWidth,
    height: targetHeight,
    quality: Math.max(80, quality),
    resize: objectFit === 'contain' ? 'contain' : objectFit === 'fill' ? 'fill' : 'cover',
  });

  const srcSet = !hasError ? generateResponsiveSrcSet(currentSrc) : undefined;

  const fitClass =
    objectFit === 'contain'
      ? 'object-contain'
      : objectFit === 'cover'
      ? 'object-cover'
      : objectFit === 'fill'
      ? 'object-fill'
      : '';

  const imgStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: 'absolute',
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
        }
      : {}),
  };

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes || (fill ? '100vw' : undefined)}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // @ts-ignore fetchPriority is a valid modern HTML attribute
      fetchpriority={priority ? 'high' : 'auto'}
      onLoad={(e) => {
        setIsLoaded(true);
        props.onLoad?.(e);
      }}
      onError={(e) => {
        if (!hasError && fallbackSrc) {
          setHasError(true);
        }
        props.onError?.(e);
      }}
      className={`${fitClass} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-90'
      } ${className}`}
      style={imgStyle}
      {...props}
    />
  );
};

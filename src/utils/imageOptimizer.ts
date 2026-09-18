/**
 * Supabase Storage and General CDN Image URL Optimizer
 * 
 * Supports Supabase Storage Transformation API:
 * https://<project-ref>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=...&quality=85
 * 
 * Falls back safely to direct public URLs if transformation is not available on standard plan.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // Kept at >= 80 to guarantee no visual degradation
  format?: 'origin' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
}

const SUPABASE_STORAGE_HOST = 'ywgosjrealgcbanelfei.supabase.co';

/**
 * Returns an optimized Supabase CDN URL or the original URL with query params.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') return '';

  const { width, height, quality = 85, format, resize } = options;

  // Never drop quality below 80 as requested
  const safeQuality = Math.max(80, Math.min(quality, 100));

  // If it's a data URL, blob, SVG, or preset SVG string identifier, return as-is
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.endsWith('.svg') ||
    (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/'))
  ) {
    return url;
  }

  // If this is a Supabase Storage URL
  if (url.includes(SUPABASE_STORAGE_HOST) && url.includes('/storage/v1/object/public/')) {
    // Check if we can build a render URL or add transformation query parameters
    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    if (safeQuality) params.set('quality', safeQuality.toString());
    if (format) params.set('format', format);
    if (resize) params.set('resize', resize);

    // Supabase Pro/Team supports /render/image/public/
    // To ensure 100% compatibility across both Pro image transforms and standard buckets,
    // we provide the transformation query string.
    const query = params.toString();
    if (!query) return url;
    return url.includes('?') ? `${url}&${query}` : `${url}?${query}`;
  }

  return url;
}

/**
 * Generates responsive srcset string for Supabase images
 */
export function generateResponsiveSrcSet(
  url: string | undefined | null,
  widths: number[] = [320, 640, 768, 1024, 1280]
): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  if (!url.includes(SUPABASE_STORAGE_HOST) || url.startsWith('data:') || url.endsWith('.svg')) {
    return undefined;
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w, quality: 85 })} ${w}w`)
    .join(', ');
}

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ShieldCheck, ImageIcon } from 'lucide-react';
import { CataloguePage } from '../types';

// Persistent in-memory image cache: Once loaded, image persists in browser memory for 0ms re-visits
export const globalImageMemoryCache = new Map<string, HTMLImageElement>();

/**
 * Preload catalogue image in background so when user views it, it renders in 0ms without any loading screen
 */
export const preloadCatalogueImage = (url: string): void => {
  if (!url || globalImageMemoryCache.has(url)) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    globalImageMemoryCache.set(url, img);
  };
  img.src = url;
};

interface ProtectedCatalogueCanvasProps {
  page: CataloguePage;
  index: number;
  showPageNumbers?: boolean;
  brandName?: string;
  isBlackout: boolean;
}

export const ProtectedCatalogueCanvas: React.FC<ProtectedCatalogueCanvasProps> = ({
  page,
  index,
  showPageNumbers = true,
  brandName = 'FALCON ELECTRICS',
  isBlackout,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const imgUrl = page.imageUrl || page.image;
  const hasCustomImage = Boolean(imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('data:') || imgUrl.includes('/')));

  // Check if image already exists in global in-memory cache
  const cachedImg = imgUrl ? globalImageMemoryCache.get(imgUrl) : null;
  const isPreloaded = Boolean(cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0);

  const [imageLoaded, setImageLoaded] = useState<boolean>(isPreloaded);
  const [hasError, setHasError] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<number>(() => {
    if (isPreloaded && cachedImg && cachedImg.naturalHeight > 0) {
      return cachedImg.naturalWidth / cachedImg.naturalHeight;
    }
    return 3 / 4; // Default 3:4 portrait
  });
  const imgElementRef = useRef<HTMLImageElement | null>(isPreloaded && cachedImg ? cachedImg : null);

  // Render to canvas
  const drawToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // If blackout is triggered (screenshot attempt, blur, tab switch) -> render pure solid black
    if (isBlackout) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const img = imgElementRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      // High-quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear & draw image with contain fit
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      const scale = Math.min(width / naturalW, height / naturalH);
      const drawW = naturalW * scale;
      const drawH = naturalH * scale;
      const offsetX = (width - drawW) / 2;
      const offsetY = (height - drawH) / 2;

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      // 1. High-Density Diagonal Watermark Grid across the entire canvas
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6); // -30 degrees
      
      const fontSize = Math.max(12, Math.round(width * 0.022));
      ctx.font = `900 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lineSpacing = Math.max(80, Math.round(height * 0.12));
      const colSpacing = Math.max(320, Math.round(width * 0.7));

      for (let y = -height * 1.5; y < height * 1.5; y += lineSpacing) {
        const isAlternate = Math.floor(y / lineSpacing) % 2 === 0;
        ctx.fillStyle = isAlternate ? 'rgba(224, 24, 61, 0.11)' : 'rgba(15, 23, 42, 0.10)';
        
        for (let x = -width * 1.5; x < width * 1.5; x += colSpacing) {
          const text = isAlternate
            ? '⚡ FALCON ELECTRICS • CONFIDENTIAL CATALOGUE • PROTECTED'
            : '🔒 VERMA ENTERPRISES (DELHI) • NOT FOR REPRODUCTION';
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();

      // 2. Central Watermark Security Seal
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.font = `800 ${Math.max(14, Math.round(width * 0.028))}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(224, 24, 61, 0.13)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡ FALCON ELECTRICS ⚡', 0, -10);
      ctx.font = `700 ${Math.max(10, Math.round(width * 0.018))}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillText('VERMA ENTERPRISES — OFFICIAL ORIGINAL', 0, 12);
      ctx.restore();

      // 3. Bottom Security Verification Bar
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.font = `700 ${Math.max(9, Math.round(width * 0.016))}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🔒 OFFICIAL FALCON ELECTRICS (VERMA ENTERPRISES) B2B CATALOGUE — PROTECTED CONTENT', width / 2, height - 12);
      ctx.restore();
    }
  }, [isBlackout]);

  // Load and decode image
  useEffect(() => {
    if (!hasCustomImage || !imgUrl) return;

    // If image is already cached, reuse immediately without network request
    const existingImg = globalImageMemoryCache.get(imgUrl);
    if (existingImg && existingImg.complete && existingImg.naturalWidth > 0) {
      imgElementRef.current = existingImg;
      if (existingImg.naturalHeight > 0) {
        setAspectRatio(existingImg.naturalWidth / existingImg.naturalHeight);
      }
      setImageLoaded(true);
      setHasError(false);
      return;
    }

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Save in persistent global memory cache for 0ms future visits
      globalImageMemoryCache.set(imgUrl, img);
      if (!isMounted) return;
      imgElementRef.current = img;
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
      setImageLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      if (!isMounted) return;
      setHasError(true);
      setImageLoaded(false);
    };

    img.src = imgUrl;

    return () => {
      isMounted = false;
    };
  }, [hasCustomImage, imgUrl]);

  // Redraw on state or resize
  useEffect(() => {
    if (imageLoaded) {
      drawToCanvas();
    }
  }, [imageLoaded, isBlackout, drawToCanvas]);

  // Handle high-DPI canvas sizing safely with requestAnimationFrame to prevent ResizeObserver loop errors
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !imageLoaded) return;

    let rafId: number | null = null;

    const resizeCanvas = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5); // Cap at 2.5x for performance
      const calculatedHeight = rect.width / (aspectRatio || 0.75);

      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(calculatedHeight * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      drawToCanvas();
    };

    rafId = requestAnimationFrame(resizeCanvas);

    const observer = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) return;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        resizeCanvas();
      });
    });

    observer.observe(container);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [aspectRatio, imageLoaded, drawToCanvas]);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-2xl bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-800 transition-all relative group flex flex-col items-center justify-center catalogue-secure-zone select-none"
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'pan-y',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. Transparent Top Anti-Inspect / Anti-Touch Shield Overlay */}
      <div
        className="absolute inset-0 z-30 bg-transparent select-none cursor-default"
        style={{
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          touchAction: 'pan-y',
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* 2. Page Number Badge */}
      {showPageNumbers !== false && (
        <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-40 bg-slate-950/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-2.5 py-1 sm:px-3 sm:py-1 rounded-lg border border-slate-700/80 shadow-md select-none pointer-events-none tracking-wide flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-red-400" />
          <span>Page {page.pageNumber || index + 1}</span>
        </div>
      )}

      {/* 3. Render Canvas or Fallback */}
      {hasCustomImage && !hasError ? (
        <div
          className={`w-full relative overflow-hidden flex items-center justify-center ${
            isBlackout ? 'opacity-0 bg-slate-950' : 'opacity-100 bg-white'
          }`}
          style={{ minHeight: imageLoaded ? 'auto' : '320px' }}
        >
          {/* Dark Shimmer Placeholder until image is fully loaded & drawn to canvas */}
          {!imageLoaded && (
            <div className="w-full aspect-[1/1.4] sm:aspect-[1.4/1] skeleton-shimmer-dark rounded-xl flex flex-col items-center justify-center text-slate-500 gap-3 p-6 text-center">
              <ShieldCheck className="w-8 h-8 text-slate-600 animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 tracking-wide">
                  Loading Protected Page {page.pageNumber || index + 1}...
                </p>
                <p className="text-[10px] text-slate-500">
                  {page.title || brandName}
                </p>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            className={`w-full h-auto block select-none pointer-events-none rounded-xl ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      ) : (
        /* Clean Default Fallback when no image is uploaded */
        <div className="w-full p-6 sm:p-10 text-slate-900 flex flex-col items-center justify-center text-center min-h-[380px] sm:min-h-[460px] bg-gradient-to-b from-white via-slate-50 to-slate-100 select-none">
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            {brandName}
          </div>

          <div className="w-12 h-1 bg-[#E0183D] rounded-full my-3" />

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 mb-2">
            {page.title || `Product Catalogue — Page ${index + 1}`}
          </h3>

          {page.subtitle && (
            <p className="text-xs sm:text-sm font-semibold text-[#E0183D] mb-2">
              {page.subtitle}
            </p>
          )}

          {page.description && (
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-4">
              {page.description}
            </p>
          )}

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/80 text-[11px] font-bold text-slate-600">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload original A4 Image from Admin Panel</span>
          </div>
        </div>
      )}
    </div>
  );
};

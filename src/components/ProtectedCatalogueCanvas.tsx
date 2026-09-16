import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ShieldCheck, ImageOff } from 'lucide-react';
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
    if ('decode' in img && typeof img.decode === 'function') {
      img.decode().catch(() => {});
    }
  };
  img.src = url;
};

interface ProtectedCatalogueCanvasProps {
  page: CataloguePage;
  index: number;
  showPageNumbers?: boolean;
  brandName?: string;
  isBlackout: boolean;
  isDataLoading?: boolean;
}

export const ProtectedCatalogueCanvas: React.FC<ProtectedCatalogueCanvasProps> = ({
  page,
  index,
  showPageNumbers = true,
  brandName = 'FALCON ELECTRICS',
  isBlackout,
  isDataLoading = false,
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

      {/* 3. Render Canvas or Futuristic DRM Loading Card */}
      <div
        className={`w-full relative overflow-hidden flex items-center justify-center rounded-xl sm:rounded-2xl ${
          isBlackout ? 'opacity-0 bg-slate-950' : 'opacity-100 bg-slate-950'
        }`}
        style={{ minHeight: imageLoaded ? 'auto' : '360px' }}
      >
        {/* Sleek Futuristic DRM Loading Card while image is loading, fetching, or decoding */}
        {!imageLoaded && !hasError && (
          <div className="w-full aspect-[1/1.4] sm:aspect-[1.4/1] min-h-[360px] sm:min-h-[440px] bg-slate-900/95 flex flex-col items-center justify-center text-center p-6 sm:p-10 relative overflow-hidden select-none border border-slate-800 shadow-2xl">
            {/* Background Ambient Radial Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950" />
            <div className="absolute inset-0 skeleton-shimmer-dark opacity-40" />

            {/* Glowing Shield with Pulse Ring */}
            <div className="relative z-10 mb-4">
              <div className="absolute -inset-3 rounded-2xl bg-red-600/20 blur-lg animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/90 border border-red-500/30 flex items-center justify-center shadow-xl shadow-black/50">
                <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 animate-pulse" />
              </div>
            </div>

            {/* Page & Security Details */}
            <div className="relative z-10 space-y-2 max-w-sm px-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Page {page.pageNumber || index + 1} • High Resolution DRM
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-snug">
                {page.title || `Loading Catalogue Page ${page.pageNumber || index + 1}...`}
              </h3>

              {page.subtitle ? (
                <p className="text-xs text-slate-400 line-clamp-1">
                  {page.subtitle}
                </p>
              ) : (
                <p className="text-xs text-slate-500 line-clamp-1">
                  {brandName}
                </p>
              )}

              {/* Shimmering Animated Progress Bar */}
              <div className="pt-4 flex flex-col items-center gap-2">
                <div className="w-48 sm:w-64 h-1.5 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700/50">
                  <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 rounded-full animate-beam-slide" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide">
                  Loading high-resolution specifications...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* In the rare event of an explicit network failure */}
        {hasError && (
          <div className="w-full aspect-[1/1.4] sm:aspect-[1.4/1] min-h-[360px] sm:min-h-[440px] bg-slate-900/95 flex flex-col items-center justify-center text-center p-6 sm:p-10 select-none border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-lg shadow-black/20">
              <ImageOff className="w-7 h-7 text-slate-400 stroke-[1.75]" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
              Page loading interrupted
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xs sm:max-w-sm mt-1.5 leading-relaxed">
              Unable to complete image stream for Page {page.pageNumber || index + 1}. Tap to retry.
            </p>

            <button
              onClick={() => {
                setHasError(false);
                setImageLoaded(false);
                if (imgUrl) preloadCatalogueImage(imgUrl);
              }}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md active:scale-95"
            >
              Retry Loading
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`w-full h-auto block select-none pointer-events-none rounded-xl transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
          }`}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
};

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ShieldCheck, ImageIcon } from 'lucide-react';
import { CataloguePage } from '../types';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(3 / 4); // Default 3:4 portrait
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const imgUrl = page.imageUrl || page.image;
  const hasCustomImage = Boolean(imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('data:') || imgUrl.includes('/')));

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

      // Subtle diagonal watermark protection (impossible to remove without corrupting image)
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6);
      ctx.font = '900 13px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '4px';
      for (let y = -height; y < height; y += 120) {
        ctx.fillText('FALCON ELECTRICS • CONFIDENTIAL CATALOGUE • PROTECTED', 0, y);
      }
      ctx.restore();
    }
  }, [isBlackout]);

  // Load and decode image
  useEffect(() => {
    if (!hasCustomImage || !imgUrl) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
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
      className="w-full max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-800 transition-all relative group flex flex-col items-center justify-center catalogue-secure-zone select-none"
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
          className={`w-full relative overflow-hidden flex items-center justify-center transition-opacity duration-75 ${
            isBlackout ? 'opacity-0 bg-slate-950' : 'opacity-100 bg-white'
          }`}
          style={{ minHeight: '320px' }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-auto block select-none pointer-events-none rounded-xl"
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

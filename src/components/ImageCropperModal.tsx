import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Check,
  X,
  Move,
  FlipHorizontal,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import { compressImageDataUrl } from '../utils/imageCompressor';

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  title?: string;
  aspectRatio?: number | null; // e.g. 1 for 1:1 square, null for free
  targetLabel?: string;
  recommendedSizeText?: string;
  onCropComplete: (croppedDataUrl: string) => void | Promise<void>;
  onCancel: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  title = 'Crop & Center Image',
  aspectRatio: initialAspectRatio = 1, // Default 1:1 square for products/categories
  targetLabel = 'Product Image',
  recommendedSizeText = 'Best fit: 800 x 800 px (Square 1:1 ratio)',
  onCropComplete,
  onCancel,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedRatio, setSelectedRatio] = useState<number | null>(initialAspectRatio);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });

  // Reset state on modal open with new imageSrc
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setPosition({ x: 0, y: 0 });
      setSelectedRatio(initialAspectRatio !== undefined ? initialAspectRatio : 1);
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc, initialAspectRatio]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
    // Center initially
    setPosition({ x: 0, y: 0 });
  };

  // Mouse & Touch Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse/touch move and up listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.002;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4));
  };

  // Center Image shortcut
  const handleCenterImage = () => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Render cropped canvas and export
  const handleApplyCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const cropBox = containerRef.current.getBoundingClientRect();

      // Desired export dimensions
      const exportWidth = selectedRatio ? (selectedRatio >= 1 ? 800 : Math.round(800 * selectedRatio)) : 800;
      const exportHeight = selectedRatio ? (selectedRatio >= 1 ? Math.round(800 / selectedRatio) : 800) : 800;

      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Fill crisp white background (great for electrical products / switchgear)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      // Save context for transform
      ctx.save();

      // Move context to center of canvas
      ctx.translate(exportWidth / 2, exportHeight / 2);

      // Apply rotation & flip
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) {
        ctx.scale(-1, 1);
      }

      // Scale factor between screen crop box and high-res export canvas
      const scaleFactor = exportWidth / cropBox.width;

      // Draw image with zoom and pan offsets
      const drawWidth = (img.width * zoom) * scaleFactor;
      const drawHeight = (img.height * zoom) * scaleFactor;
      const offsetX = position.x * scaleFactor;
      const offsetY = position.y * scaleFactor;

      ctx.drawImage(
        img,
        -drawWidth / 2 + offsetX,
        -drawHeight / 2 + offsetY,
        drawWidth,
        drawHeight
      );

      ctx.restore();

      // Export as high quality JPEG (or PNG if transparent)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const optimizedUrl = await compressImageDataUrl(dataUrl, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.88,
      });

      await onCropComplete(optimizedUrl || dataUrl);
    } catch (err: any) {
      console.error('[ImageCropper] Crop error:', err);
      alert('Failed to crop image: ' + (err?.message || err));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  // Aspect ratio calculations for the visual viewport
  let cropWidth = 280;
  let cropHeight = 280;
  if (selectedRatio) {
    if (selectedRatio >= 1) {
      cropWidth = 320;
      cropHeight = Math.round(320 / selectedRatio);
    } else {
      cropHeight = 320;
      cropWidth = Math.round(320 * selectedRatio);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[95vh]">
        {/* Header Bar */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-[#101124] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#E0183D] rounded-xl text-white shadow-md">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                {title}
              </h2>
              <span className="text-[11px] text-slate-400 font-medium block">
                {targetLabel} • Adjust position, zoom, and frame
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recommended Size Alert Banner */}
        <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2 text-xs">
          <Info className="w-4 h-4 text-[#E0183D] shrink-0" />
          <span className="text-slate-300 font-medium">
            <strong className="text-white font-bold">Recommended:</strong> {recommendedSizeText}
          </span>
        </div>

        {/* Interactive Cropper Viewport */}
        <div
          className="relative bg-slate-950 flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing p-4"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Subtle Background Blueprint Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

          {/* Crop Frame / Target Window */}
          <div
            ref={containerRef}
            style={{ width: `${cropWidth}px`, height: `${cropHeight}px` }}
            className="relative border-2 border-[#E0183D] rounded-2xl shadow-[0_0_0_9999px_rgba(2,6,23,0.78)] z-10 pointer-events-none flex items-center justify-center overflow-hidden transition-all duration-200"
          >
            {/* Rule of Thirds Alignment Grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-r border-b border-white/20"></div>
              <div className="border-b border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div className="border-r border-white/20"></div>
              <div></div>
            </div>

            {/* Corner Crop Marks */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white rounded-br-sm" />

            {/* Center Reticle Point */}
            <div className="w-2 h-2 rounded-full border border-white/60 bg-[#E0183D]/80 pointer-events-none" />
          </div>

          {/* Draggable & Scalable Image Layer */}
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${
                flipH ? -1 : 1
              })`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            className="absolute flex items-center justify-center pointer-events-none"
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={handleImageLoad}
              className="max-w-none max-h-none select-none pointer-events-none drop-shadow-xl"
              style={{
                width: naturalDimensions.width ? `${Math.min(naturalDimensions.width, 600)}px` : 'auto',
                height: 'auto',
              }}
              draggable={false}
            />
          </div>

          {/* Quick Drag Instruction Tag */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-[10px] text-slate-300 font-semibold flex items-center gap-1.5 pointer-events-none z-20 shadow-md">
            <Move className="w-3 h-3 text-[#E0183D]" />
            <span>Click & Drag to Center • Scroll to Zoom</span>
          </div>
        </div>

        {/* Toolbar & Controls Section */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-4">
          {/* Zoom Slider & Adjustments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(0.5, Number((prev - 0.1).toFixed(2))))}
                className="text-slate-400 hover:text-white p-1 rounded transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#E0183D] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3.0, Number((prev + 0.1).toFixed(2))))}
                className="text-slate-400 hover:text-white p-1 rounded transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-slate-300 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotate, Flip & Center Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5">
              <button
                type="button"
                onClick={handleRotate}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition active:scale-95"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => setFlipH((prev) => !prev)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition active:scale-95"
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span>Flip</span>
              </button>

              <button
                type="button"
                onClick={handleCenterImage}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition active:scale-95"
                title="Reset to Center"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Aspect Ratio Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1">
              Aspect Ratio:
            </span>
            <button
              type="button"
              onClick={() => setSelectedRatio(1)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                selectedRatio === 1
                  ? 'bg-[#E0183D] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              1:1 Square (Product / Icon)
            </button>
            <button
              type="button"
              onClick={() => setSelectedRatio(4 / 3)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                selectedRatio === 4 / 3
                  ? 'bg-[#E0183D] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              4:3 Standard
            </button>
            <button
              type="button"
              onClick={() => setSelectedRatio(3 / 4)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                selectedRatio === 3 / 4
                  ? 'bg-[#E0183D] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              3:4 Portrait (Catalogue)
            </button>
            <button
              type="button"
              onClick={() => setSelectedRatio(16 / 9)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                selectedRatio === 16 / 9
                  ? 'bg-[#E0183D] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              16:9 Banner
            </button>
            <button
              type="button"
              onClick={() => setSelectedRatio(null)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                selectedRatio === null
                  ? 'bg-[#E0183D] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Free / Custom
            </button>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onCropComplete(imageSrc)}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl transition hover:bg-slate-800"
            >
              Skip & Use Original
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs transition active:scale-95"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={isProcessing}
                className="bg-[#E0183D] hover:bg-[#c01233] text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-red-950/50 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isProcessing ? 'Saving Cropped Image...' : 'Crop & Save Image'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

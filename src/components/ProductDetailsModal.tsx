import React, { useState, useEffect } from 'react';
import { X, Star, ShieldCheck, Zap } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Product } from '../types';
import { ProductVisual } from './ProductVisual';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onRequestQuote?: (product: Product) => void;
  onOpenWhatsApp: (productOrName: Product | string) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onOpenWhatsApp,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  if (!product) return null;

  const allImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || 'fan-regulator-5step'];

  const activeImage = allImages[selectedImageIndex] || allImages[0];


  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm p-0 lg:p-4 animate-fade-in">
      <div className="bg-white rounded-t-3xl lg:rounded-3xl w-full max-w-md lg:max-w-2xl max-h-[90vh] lg:max-h-[85vh] overflow-y-auto p-4 lg:p-8 shadow-2xl relative animate-slide-up">
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 lg:hidden"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Product Details"
          className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition z-10"
        >
          <X className="w-4 h-4 lg:w-5 lg:h-5" />
        </button>

        {/* Product Visual Banner */}
        <div className="bg-slate-900 rounded-2xl lg:rounded-3xl flex items-center justify-center relative mb-3 lg:mb-5 shadow-inner h-60 sm:h-72 lg:h-80 overflow-hidden border border-slate-800">
          {product.badge && (
            <span className="absolute top-3 left-3 lg:top-4 lg:left-4 bg-[#E0183D] text-white text-[9px] lg:text-[11px] font-extrabold px-2.5 lg:px-3.5 py-1 rounded-md lg:rounded-lg uppercase tracking-wider z-10 shadow-md">
              {product.badge}
            </span>
          )}
          <ProductVisual type={activeImage} size="full" className="w-full h-full" />
        </div>

        {/* Multiple Image Thumbnails Gallery */}
        {allImages.length > 1 && (
          <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto no-scrollbar mb-4 py-1">
            {allImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl border p-1 bg-slate-900 shrink-0 flex items-center justify-center transition overflow-hidden ${
                  selectedImageIndex === idx
                    ? 'ring-2 ring-[#E0183D] border-transparent scale-105'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <ProductVisual type={imgUrl} size="sm" />
              </button>
            ))}
          </div>
        )}

        {/* Title, Box Price & 1 Piece Price */}
        <div className="flex items-start justify-between gap-2 lg:gap-4 mb-2 lg:mb-4">
          <div>
            <span className="text-[10px] lg:text-[12px] font-bold text-[#E0183D] uppercase tracking-wider">
              {product.categoryName}
            </span>
            <h2 className="text-[18px] lg:text-[24px] font-extrabold text-[#171827] leading-tight">
              {product.name}
            </h2>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[18px] lg:text-[24px] font-black text-[#E0183D] block">
              {product.price || 'Contact'}
            </span>
            {product.perPiecePrice && (
              <span className="inline-block text-[10px] lg:text-[12px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 lg:px-2.5 py-0.5 rounded-md mt-0.5">
                ₹{product.perPiecePrice} / Piece
              </span>
            )}
            {product.rating && (
              <div className="flex items-center justify-end gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold text-slate-800">{product.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tech Spec Tags */}
        <div className="grid grid-cols-3 gap-2 lg:gap-4 my-3 lg:my-5">
          {product.amps && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl p-2 lg:p-3 text-center">
              <span className="text-[9px] lg:text-[11px] text-slate-400 font-bold uppercase block">Current</span>
              <span className="text-[12px] lg:text-[15px] font-extrabold text-slate-800">{product.amps}</span>
            </div>
          )}
          {product.voltage && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl p-2 lg:p-3 text-center">
              <span className="text-[9px] lg:text-[11px] text-slate-400 font-bold uppercase block">Voltage</span>
              <span className="text-[12px] lg:text-[15px] font-extrabold text-slate-800">{product.voltage}</span>
            </div>
          )}
          {product.steps && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl lg:rounded-2xl p-2 lg:p-3 text-center">
              <span className="text-[9px] lg:text-[11px] text-slate-400 font-bold uppercase block">Control</span>
              <span className="text-[12px] lg:text-[15px] font-extrabold text-slate-800">{product.steps}</span>
            </div>
          )}
        </div>

        {/* Custom Admin Specifications */}
        {product.customSpecs && product.customSpecs.length > 0 && (
          <div className="my-3 lg:my-4 bg-slate-50 border border-slate-200 rounded-2xl p-3 lg:p-4">
            <h4 className="text-[10px] lg:text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Custom Specifications
            </h4>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {product.customSpecs.map((spec, idx) => (
                <div key={idx} className="bg-white p-2 lg:p-3 rounded-xl border border-slate-200">
                  <span className="text-[9px] lg:text-[11px] text-slate-400 block font-semibold">{spec.label}</span>
                  <span className="text-[11px] lg:text-[13px] font-extrabold text-slate-800">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-4 lg:mb-6">
          <h4 className="text-[12px] lg:text-[14px] font-bold text-[#171827] uppercase tracking-wider mb-1 lg:mb-2">
            Product Description
          </h4>
          <p className="text-[12px] lg:text-[14px] text-slate-600 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Key Features List */}
        {product.features && (
          <div className="mb-5 lg:mb-6 bg-red-50/50 border border-red-100 rounded-2xl p-3.5 lg:p-5">
            <h4 className="text-[11px] lg:text-[13px] font-extrabold text-[#E0183D] uppercase tracking-wider mb-2 lg:mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>Technical & Safety Highlights</span>
            </h4>
            <ul className="space-y-1.5 lg:space-y-2">
              {product.features.map((feat, i) => (
                <li key={i} className="text-[11px] lg:text-[13px] text-slate-700 flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#E0183D] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action CTA */}
        <div className="pt-2 lg:pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              onClose();
              onOpenWhatsApp(product);
            }}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[13px] lg:text-[15px] py-3 lg:py-3.5 rounded-xl lg:rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
          >
            <FaWhatsapp size={18} className="lg:scale-110" />
            <span>WhatsApp Enquiry</span>
          </button>
        </div>

      </div>
    </div>
  );
};

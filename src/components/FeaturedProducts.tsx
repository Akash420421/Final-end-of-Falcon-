import React, { useState, memo } from 'react';
import { ArrowRight, Star, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Product } from '../types';
import { ProductVisual } from './ProductVisual';

interface FeaturedProductsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onViewAllProducts: () => void;
  onOpenWhatsApp?: (product: Product) => void;
  selectedCategoryName?: string | null;
  searchQuery?: string;
}

/**
 * FeaturedProducts Component
 * 
 * Renders the responsive featured products showcase grid, including desktop expansion,
 * mobile horizontal card layouts, specifications viewer triggers, and WhatsApp quick-quote.
 * 
 * Wrapped in React.memo to ensure zero re-render overhead during tab transitions
 * or unrelated store state updates when product items remain unchanged.
 */
const FeaturedProductsComponent: React.FC<FeaturedProductsProps> = ({
  products,
  onSelectProduct,
  onViewAllProducts,
  onOpenWhatsApp,
  selectedCategoryName,
  searchQuery,
}) => {
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);

  // On desktop: show 4 products if not expanded, or all products if expanded
  const desktopProducts = isDesktopExpanded ? products : products.slice(0, 4);

  return (
    <section className="py-5 px-4 lg:py-12 lg:px-8 max-w-md lg:max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 lg:mb-8">
        <div>
          <span className="text-[10px] lg:text-[12px] font-extrabold tracking-widest text-[#E0183D] uppercase block mb-0.5 lg:mb-1">
            FEATURED PRODUCTS
          </span>
          <h2 className="text-[19px] lg:text-[30px] xl:text-[34px] font-extrabold text-[#171827] tracking-tight">
            {searchQuery ? `Search Results (${products.length})` : selectedCategoryName ? selectedCategoryName : 'Our Top Picks'}
          </h2>
        </div>

        <a
          href="/products"
          onClick={(e) => {
            e.preventDefault();
            onViewAllProducts();
          }}
          className="text-[#E0183D] font-bold text-[12px] lg:text-[15px] flex items-center gap-1 lg:gap-1.5 hover:underline shrink-0 no-underline cursor-pointer"
        >
          <span>View All Products</span>
          <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
        </a>
      </div>

      {/* If search or filter returns empty */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 p-6 lg:p-12 text-center">
          <p className="text-slate-600 text-[13px] lg:text-[16px] font-medium mb-2 lg:mb-4">
            No products match your search or category filter.
          </p>
          <button
            onClick={onViewAllProducts}
            className="text-[12px] lg:text-[14px] font-bold text-[#E0183D] bg-red-50 hover:bg-red-100 px-3 py-1.5 lg:px-5 lg:py-2.5 rounded-lg lg:rounded-xl border border-red-200 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* Mobile View: Fluid horizontal scroll carousel showing all products */}
          <div className="flex lg:hidden gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-1 pb-3 smooth-scroll">
            {products.map((product) => (
              <div
                key={`mobile-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="snap-start shrink-0 w-[54%] sm:w-[190px] bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-98 relative"
              >
                {/* Product Visual Container (Positioning reference for image & badges) */}
                <div className="relative w-full bg-slate-100 rounded-xl mb-2.5 h-36 sm:h-40 flex items-center justify-center border border-slate-200/80 group-hover:border-slate-300 transition-colors overflow-hidden">
                  {/* Top Left Badge (e.g. Popular, Winter Special) — anchored inside image area */}
                  {product.badge && (
                    <div className="absolute top-2 left-2 z-10 max-w-[calc(100%-54px)] pointer-events-none">
                      <span className="inline-block max-w-full truncate text-[8px] font-extrabold bg-[#101124]/90 backdrop-blur-xs text-white px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Rating Badge — anchored inside image area with consistent alignment & padding */}
                  {product.rating && Number(product.rating) > 0 && (
                    <div
                      className="absolute top-2 right-2 z-10 flex items-center justify-center gap-1 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded-md border border-amber-200/90 shadow-xs select-none pointer-events-none"
                      title={`Rating: ${Number(product.rating).toFixed(1)} / 5`}
                    >
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400 shrink-0" />
                      <span className="text-[9px] font-bold text-slate-800 leading-none tabular-nums">
                        {Number(product.rating).toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Product Visual */}
                  <div className="w-full h-full group-hover:scale-[1.03] transition-transform duration-200 flex items-center justify-center">
                    <ProductVisual
                      type={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : product.image || ''
                      }
                      size="card"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Category Tag */}
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {product.amps || product.categoryName}
                </span>

                {/* Product Name */}
                <h3 className="text-[12px] font-bold text-[#171827] leading-snug line-clamp-2 my-1">
                  {product.name}
                </h3>

                {/* Price & Action Button */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div>
                    <span className="text-[13px] font-extrabold text-[#E0183D] block">
                      {product.price || 'Quote'}
                    </span>
                    {product.perPiecePrice && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded">
                        ₹{product.perPiecePrice}/pc
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {onOpenWhatsApp && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenWhatsApp(product);
                        }}
                        title="WhatsApp Enquiry"
                        className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-1.5 rounded-lg transition active:scale-90 flex items-center justify-center shrink-0 shadow-sm"
                      >
                        <FaWhatsapp size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="bg-slate-100 hover:bg-[#E0183D] hover:text-white text-slate-700 p-1.5 rounded-lg transition active:scale-90 flex items-center gap-1 text-[10px] font-bold shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Specs</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Exactly 4 products in 1 clean row (with View More trigger) */}
          <div className="hidden lg:grid grid-cols-4 gap-6 pt-1">
            {desktopProducts.map((product) => (
              <div
                key={`desktop-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="w-full bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-98 relative"
              >
                {/* Product Visual Container (Positioning reference for image & badges) */}
                <div className="relative w-full bg-slate-100 rounded-2xl mb-3 h-48 flex items-center justify-center border border-slate-200/80 group-hover:border-slate-300 transition-colors overflow-hidden">
                  {/* Top Left Badge (e.g. Popular, Winter Special) — anchored inside image area */}
                  {product.badge && (
                    <div className="absolute top-2.5 left-2.5 z-10 max-w-[calc(100%-60px)] pointer-events-none">
                      <span className="inline-block max-w-full truncate text-[10px] font-extrabold bg-[#101124]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Rating Badge — anchored inside image area with consistent alignment & padding */}
                  {product.rating && Number(product.rating) > 0 && (
                    <div
                      className="absolute top-2.5 right-2.5 z-10 flex items-center justify-center gap-1 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-amber-200/90 shadow-xs select-none pointer-events-none"
                      title={`Rating: ${Number(product.rating).toFixed(1)} / 5`}
                    >
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-800 leading-none tabular-nums">
                        {Number(product.rating).toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Product Visual */}
                  <div className="w-full h-full group-hover:scale-[1.03] transition-transform duration-200 flex items-center justify-center">
                    <ProductVisual
                      type={
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : product.image || ''
                      }
                      size="card"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Category Tag */}
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {product.amps || product.categoryName}
                </span>

                {/* Product Name */}
                <h3 className="text-[15px] font-bold text-[#171827] leading-snug line-clamp-2 my-2">
                  {product.name}
                </h3>

                {/* Price & Action Button */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div>
                    <span className="text-[16px] font-extrabold text-[#E0183D] block">
                      {product.price || 'Quote'}
                    </span>
                    {product.perPiecePrice && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        ₹{product.perPiecePrice}/pc
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onOpenWhatsApp && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenWhatsApp(product);
                        }}
                        title="WhatsApp Enquiry"
                        className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-2 rounded-xl transition active:scale-90 flex items-center justify-center shrink-0 shadow-sm"
                      >
                        <FaWhatsapp size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="bg-slate-100 hover:bg-[#E0183D] hover:text-white text-slate-700 px-3 py-2 rounded-xl transition active:scale-90 flex items-center gap-1 text-[12px] font-bold shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Specs</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View More / Show Less Toggle Button */}
          {products.length > 4 && (
            <div className="hidden lg:flex justify-center mt-8">
              <button
                onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
                className="bg-white hover:bg-red-50 text-[#E0183D] border border-red-200 shadow-sm hover:shadow-md px-6 py-2.5 rounded-2xl text-[14px] font-extrabold transition-all duration-200 flex items-center gap-2 active:scale-95"
              >
                <span>{isDesktopExpanded ? 'Show Less Products' : `View More Products (${products.length - 4} More)`}</span>
                {isDesktopExpanded ? (
                  <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

FeaturedProductsComponent.displayName = 'FeaturedProducts';

export const FeaturedProducts = memo(FeaturedProductsComponent);

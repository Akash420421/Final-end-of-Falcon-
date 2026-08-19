import React from 'react';
import { ArrowLeft, Eye, Star, Fan, Flame, Sliders, Zap, Grid } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Product } from '../types';
import { useFalconStore } from '../context/StoreContext';
import { ProductVisual } from './ProductVisual';
import { ProductListSkeleton } from './SkeletonLoaders';

interface CategoryProductsViewProps {
  products: Product[];
  selectedCategoryId: string | null;
  onSelectCategory: (catId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenWhatsApp: (productOrName: Product | string) => void;
  isLoading?: boolean;
}

export const CategoryProductsView: React.FC<CategoryProductsViewProps> = ({
  products,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onOpenWhatsApp,
  isLoading = false,
}) => {
  const { categories } = useFalconStore();
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);
  const [selectedSubCat, setSelectedSubCat] = React.useState<string | null>(null);

  // Reset sub-category filter when category changes
  React.useEffect(() => {
    setSelectedSubCat(null);
  }, [selectedCategoryId]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Fan':
        return <Fan className="w-4 h-4 text-white" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-white" />;
      case 'Sliders':
        return <Sliders className="w-4 h-4 text-white" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-white" />;
      default:
        return <Grid className="w-4 h-4 text-white" />;
    }
  };

  // Filter products by sub-category if selected
  const filteredProducts = products.filter((p) => {
    if (!selectedSubCat) return true;
    return p.subCategory?.trim().toLowerCase() === selectedSubCat.trim().toLowerCase();
  });

  return (
    <div className="py-4 lg:py-10 px-4 lg:px-8 max-w-md lg:max-w-7xl mx-auto space-y-4 lg:space-y-8">
      {/* Search Bar Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search switches, 16 Amp, rotary, fan regulators..."
          className="w-full bg-white border border-slate-200/90 rounded-xl lg:rounded-2xl pl-10 lg:pl-12 pr-9 py-2.5 lg:py-4 text-[12px] lg:text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#E0183D] focus:ring-1 focus:ring-[#E0183D] shadow-sm transition"
        />
        <div className="absolute inset-y-0 left-3 lg:left-4 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-3 lg:right-4 flex items-center text-slate-400 hover:text-slate-600 text-[12px] lg:text-[14px] font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills Selector */}
      <div className="flex items-center gap-1.5 lg:gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 smooth-scroll">
        <button
          onClick={() => onSelectCategory(null)}
          className={`shrink-0 px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-xl lg:rounded-2xl text-[11px] lg:text-[13px] font-bold transition flex items-center gap-1.5 lg:gap-2 border ${
            selectedCategoryId === null
              ? 'bg-[#101124] text-white border-[#101124] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Grid className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span>All Products</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-xl lg:rounded-2xl text-[11px] lg:text-[13px] font-bold transition flex items-center gap-1.5 lg:gap-2 border ${
                isSelected
                  ? 'bg-[#E0183D] text-white border-[#E0183D] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Header Banner */}
      {currentCategory && (
        <div className={`rounded-2xl lg:rounded-3xl p-4 lg:p-8 text-white shadow-md relative overflow-hidden ${currentCategory.bgColor}`}>
          <div className="flex items-center justify-between mb-2 lg:mb-4">
            <button
              onClick={() => onSelectCategory(null)}
              className="inline-flex items-center gap-1 text-[10px] lg:text-[12px] font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-lg lg:rounded-xl transition"
            >
              <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>All Categories</span>
            </button>

            <span className="text-[9px] lg:text-[11px] font-extrabold bg-white/20 uppercase tracking-wider px-2 lg:px-3 py-0.5 lg:py-1 rounded-md lg:rounded-lg backdrop-blur-sm">
              {currentCategory.badge}
            </span>
          </div>

          <div className="flex items-start gap-3 lg:gap-5 mt-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/95 rounded-xl lg:rounded-2xl p-1.5 sm:p-2.5 backdrop-blur-sm border border-white/40 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
              <ProductVisual
                type={currentCategory.bannerImageUrl || currentCategory.imageUrl || currentCategory.image}
                size="sm"
                objectFit="contain"
                className="w-full h-full"
              />
            </div>

            <div>
              <h1 className="text-[18px] lg:text-[28px] font-extrabold text-white leading-tight">
                {currentCategory.title}
              </h1>
              <p className="text-[11px] lg:text-[15px] font-semibold text-white/90">
                {currentCategory.subtitle}
              </p>
              <p className="text-[10px] lg:text-[13px] text-white/80 leading-snug mt-1 lg:mt-2 max-w-3xl">
                {currentCategory.description}
              </p>
            </div>
          </div>

          {/* Sub-Categories Chips if defined */}
          {currentCategory.subCategories && currentCategory.subCategories.length > 0 && (
            <div className="mt-3 lg:mt-6 pt-3 lg:pt-5 border-t border-white/20">
              <span className="text-[9px] lg:text-[11px] font-extrabold uppercase tracking-wider text-white/80 block mb-1.5 lg:mb-2.5">
                Sub-Categories Range:
              </span>
              <div className="flex items-center gap-1.5 lg:gap-2.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedSubCat(null)}
                  className={`shrink-0 px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-lg lg:rounded-xl text-[10px] lg:text-[12px] font-bold transition ${
                    selectedSubCat === null
                      ? 'bg-white text-[#101124] shadow-sm font-extrabold'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  All {currentCategory.title}
                </button>
                {currentCategory.subCategories.map((sub) => {
                  const isSubSelected = selectedSubCat === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCat(sub)}
                      className={`shrink-0 px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-lg lg:rounded-xl text-[10px] lg:text-[12px] font-bold transition ${
                        isSubSelected
                          ? 'bg-white text-[#E0183D] shadow-sm font-extrabold'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product List Title & Count */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] lg:text-[12px] font-extrabold tracking-widest text-[#E0183D] uppercase block">
            {currentCategory ? currentCategory.title.toUpperCase() : 'FULL CATALOGUE'}
          </span>
          <h2 className="text-[17px] lg:text-[26px] font-extrabold text-[#171827]">
            {searchQuery
              ? `Results for "${searchQuery}" (${filteredProducts.length})`
              : selectedSubCat
              ? `${selectedSubCat} (${filteredProducts.length})`
              : currentCategory
              ? `Category Range (${filteredProducts.length})`
              : `All Available Products (${filteredProducts.length})`}
          </h2>
        </div>

        {selectedCategoryId && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-[11px] lg:text-[13px] font-bold text-[#E0183D] hover:underline"
          >
            Show All
          </button>
        )}
      </div>

      {/* Product Grid (2 Columns on mobile, 3/4 Columns on Desktop) */}
      {isLoading ? (
        <ProductListSkeleton count={6} />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 p-6 lg:p-12 text-center space-y-3 lg:space-y-4">
          <p className="text-slate-600 text-[12px] lg:text-[15px] font-medium">
            No products found matching your search or selected sub-category.
          </p>
          <button
            onClick={() => {
              setSelectedSubCat(null);
              onSearchChange('');
            }}
            className="text-[11px] lg:text-[13px] font-bold text-[#E0183D] bg-red-50 hover:bg-red-100 px-3 lg:px-5 py-1.5 lg:py-2.5 rounded-xl border border-red-200 transition"
          >
            Reset Filters & View All
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-5 border border-slate-200/90 shadow-sm hover:shadow-xl lg:hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-98 relative"
            >
              {/* Top Badge */}
              {product.badge && (
                <div className="absolute top-2 left-2 lg:top-3.5 lg:left-3.5 z-10">
                  <span className="text-[8px] lg:text-[10px] font-extrabold bg-[#101124] text-white px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-md uppercase tracking-wider">
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Rating */}
              {product.rating && (
                <div className="absolute top-2 right-2 lg:top-3.5 lg:right-3.5 z-10 flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 lg:px-2 lg:py-1 rounded border border-yellow-200">
                  <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-[9px] lg:text-[11px] font-bold text-slate-700">{product.rating}</span>
                </div>
              )}

              {/* Product Visual */}
              <div className="bg-slate-100 rounded-xl lg:rounded-2xl mb-2.5 lg:mb-3 h-36 sm:h-40 lg:h-48 flex items-center justify-center border border-slate-200/80 group-hover:scale-[1.03] transition duration-200 mt-4 overflow-hidden relative">
                <ProductVisual
                  type={
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : product.image || 'fan-regulator-5step'
                  }
                  size="card"
                  className="w-full h-full"
                />
              </div>

              {/* Category Tag */}
              <span className="text-[9px] lg:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {product.amps || product.categoryName}
              </span>

              {/* Product Name */}
              <h3 className="text-[12px] lg:text-[15px] font-bold text-[#171827] leading-snug line-clamp-2 my-1 lg:my-2">
                {product.name}
              </h3>

              {/* Price & Action Buttons */}
              <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-slate-100 space-y-1.5 lg:space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <span className="text-[13px] lg:text-[16px] font-extrabold text-[#E0183D] block">
                      {product.price || 'Quote'}
                    </span>
                    {product.perPiecePrice && (
                      <span className="text-[9px] lg:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 lg:px-1.5 py-0.5 rounded">
                        ₹{product.perPiecePrice}/pc
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(product);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 lg:px-3 lg:py-1.5 rounded-lg lg:rounded-xl transition active:scale-90 flex items-center gap-1 text-[10px] lg:text-[12px] font-bold shrink-0"
                  >
                    <Eye className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    <span>Specs</span>
                  </button>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenWhatsApp(product);
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[10px] lg:text-[12px] py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 group"
                >
                  <FaWhatsapp size={13} className="lg:scale-110 group-hover:scale-125 transition-transform" />
                  <span>WhatsApp Inquiry</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

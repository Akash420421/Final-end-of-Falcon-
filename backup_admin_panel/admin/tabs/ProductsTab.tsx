import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Star, Sparkles, AlertCircle } from 'lucide-react';
import { Product, Category } from '../../../types';
import { ProductVisual } from '../../ProductVisual';

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onToggleTopPick: (product: Product) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onToggleTopPick,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      (prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.amps || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.subCategory || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || prod.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Header Bar & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <span>Product Catalog Inventory</span>
            <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded-full border border-red-800">
              {products.length} Items Total
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Add specifications, per-piece pricing, ratings, badges, and photo galleries.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddProduct}
          className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, rating, or subcategory..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D] min-h-[38px]"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({products.filter((p) => p.category === c.id).length})
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid / List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-xs font-bold text-slate-300">No products found</h4>
          <p className="text-[11px] text-slate-500">
            Try adjusting your search query or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3 shadow-md"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 rounded-xl border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                  <ProductVisual type={prod.image || 'fan-regulator-5step'} size="md" />
                  {prod.isTopPick && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 p-0.5 rounded shadow">
                      <Star className="w-3 h-3 fill-current" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-extrabold uppercase bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-900 truncate max-w-[140px]">
                      {prod.categoryName || prod.category}
                    </span>
                    {prod.badge && (
                      <span className="text-[9px] font-bold bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-900 truncate max-w-[120px]">
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-black text-white truncate" title={prod.name}>
                    {prod.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                    {prod.perPiecePrice && (
                      <span className="text-emerald-400 font-bold">
                        ₹{prod.perPiecePrice}/pc
                      </span>
                    )}
                    {prod.price && <span className="text-slate-300">{prod.price}</span>}
                    {prod.amps && <span>• {prod.amps}</span>}
                    {prod.subCategory && (
                      <span className="text-slate-500 truncate max-w-[110px]">
                        • {prod.subCategory}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleTopPick(prod)}
                  className={`p-2 rounded-xl transition ${
                    prod.isTopPick
                      ? 'text-amber-400 bg-amber-950/50 hover:bg-amber-900/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={prod.isTopPick ? 'Remove from Top Picks' : 'Make Top Pick'}
                >
                  <Star className={`w-4 h-4 ${prod.isTopPick ? 'fill-current' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEditProduct(prod)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  title="Edit Product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                      onDeleteProduct(prod.id);
                      onShowToast('Product deleted from inventory!');
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-xl transition"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

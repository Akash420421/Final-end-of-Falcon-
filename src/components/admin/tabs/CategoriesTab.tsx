import React from 'react';
import { Plus, ArrowUp, ArrowDown, Edit2, Trash2, Layers } from 'lucide-react';
import { Category } from '../../../types';
import { ProductVisual } from '../../ProductVisual';

interface CategoriesTabProps {
  categories: Category[];
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onMoveCategory: (index: number, direction: 'up' | 'down') => void;
  onShowToast: (msg: string) => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onMoveCategory,
  onShowToast,
}) => {
  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#E0183D]" />
            <span>Product Categories</span>
            <span className="text-[10px] bg-red-950/80 text-red-300 px-2 py-0.5 rounded-full border border-red-800">
              {categories.length} Categories
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Organize catalog groupings, subcategory tags, order sequence, and dedicated visual icons.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddCategory}
          className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 min-h-[40px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <ProductVisual
                    type={cat.imageUrl || cat.image || 'fan-regulator-5step'}
                    size="sm"
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-[#E0183D] uppercase bg-red-950 px-2 py-0.5 rounded border border-red-900">
                      {cat.badge}
                    </span>
                    <h4 className="text-xs font-black text-white">{cat.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{cat.subtitle}</span>
                </div>
              </div>

              {/* Order and Edit Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => onMoveCategory(idx, 'up')}
                  className="px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-20 border border-slate-800 rounded-xl transition flex items-center gap-1 text-[10px] font-bold min-h-[34px]"
                  title="Move Category Up"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Move Up</span>
                </button>

                <button
                  type="button"
                  disabled={idx === categories.length - 1}
                  onClick={() => onMoveCategory(idx, 'down')}
                  className="px-2.5 py-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-20 border border-slate-800 rounded-xl transition flex items-center gap-1 text-[10px] font-bold min-h-[34px]"
                  title="Move Category Down"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Move Down</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEditCategory(cat)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete category "${cat.title}"?`)) {
                      onDeleteCategory(cat.id);
                      onShowToast('Category deleted!');
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-xl transition"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-categories tags */}
            {cat.subCategories && cat.subCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400">Sub-categories:</span>
                {cat.subCategories.map((sub, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

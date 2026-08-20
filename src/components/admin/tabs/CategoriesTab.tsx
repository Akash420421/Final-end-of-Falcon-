import React, { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Edit2, Trash2, Layers, Palette, Check } from 'lucide-react';
import { Category } from '../../../types';
import { ProductVisual } from '../../ProductVisual';

interface CategoriesTabProps {
  categories: Category[];
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: Category) => void;
  onUpdateCategory: (id: string, updated: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: string) => void;
  onMoveCategory: (index: number, direction: 'up' | 'down') => void;
  onShowToast: (msg: string) => void;
}

const PRESET_COLORS = [
  { name: 'Crimson Red', value: 'linear-gradient(135deg, #b91c1c, #7f1d1d)', hex: '#b91c1c' },
  { name: 'Royal Blue', value: 'linear-gradient(135deg, #1d4ed8, #172554)', hex: '#1d4ed8' },
  { name: 'Forest Green', value: 'linear-gradient(135deg, #047857, #064e3b)', hex: '#047857' },
  { name: 'Royal Purple', value: 'linear-gradient(135deg, #6b21a8, #3b0764)', hex: '#6b21a8' },
  { name: 'Amber Copper', value: 'linear-gradient(135deg, #c2410c, #7c2d12)', hex: '#c2410c' },
  { name: 'Midnight Navy', value: 'linear-gradient(135deg, #101124, #1E203C)', hex: '#101124' },
  { name: 'Dark Slate', value: 'linear-gradient(135deg, #334155, #0f172a)', hex: '#334155' },
  { name: 'Ruby Wine', value: 'linear-gradient(135deg, #9f1239, #4c0519)', hex: '#9f1239' },
  { name: 'Teal Ocean', value: 'linear-gradient(135deg, #0f766e, #134e4a)', hex: '#0f766e' },
  { name: 'Golden Bronze', value: 'linear-gradient(135deg, #b45309, #78350f)', hex: '#b45309' },
];

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  onOpenAddCategory,
  onOpenEditCategory,
  onUpdateCategory,
  onDeleteCategory,
  onMoveCategory,
  onShowToast,
}) => {
  const [openColorPickerId, setOpenColorPickerId] = useState<string | null>(null);

  const handleColorChange = async (catId: string, catTitle: string, newBgColor: string) => {
    try {
      await onUpdateCategory(catId, { bgColor: newBgColor });
      onShowToast(`🎨 Color updated for "${catTitle}"!`);
    } catch (err: any) {
      alert('Failed to update category color: ' + (err?.message || err));
    }
  };

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
            Organize catalog groupings, card color themes, badges, sequence order, and dedicated visuals.
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
        {categories.map((cat, idx) => {
          const currentBg = cat.bgColor || 'linear-gradient(135deg, #101124, #1E203C)';
          const isPickerOpen = openColorPickerId === cat.id;

          // Convert hex for native color picker fallback
          let nativePickerVal = '#101124';
          if (currentBg.startsWith('#')) {
            nativePickerVal = currentBg;
          } else {
            const foundPreset = PRESET_COLORS.find((p) => p.value === currentBg);
            if (foundPreset) nativePickerVal = foundPreset.hex;
          }

          return (
            <div
              key={cat.id}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md relative overflow-hidden"
            >
              {/* Subtle top accent bar matching the category color */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background:
                    currentBg.startsWith('#') ||
                    currentBg.startsWith('rgb') ||
                    currentBg.startsWith('linear-gradient')
                      ? currentBg
                      : '#E0183D',
                }}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl border border-slate-700/60 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner"
                    style={{
                      background:
                        currentBg.startsWith('#') ||
                        currentBg.startsWith('rgb') ||
                        currentBg.startsWith('linear-gradient')
                          ? currentBg
                          : '#121324',
                    }}
                  >
                    <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-xs">
                      <ProductVisual
                        type={cat.imageUrl || cat.image || 'fan-regulator-5step'}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black text-[#E0183D] uppercase bg-red-950 px-2 py-0.5 rounded border border-red-900">
                        {cat.badge}
                      </span>
                      <h4 className="text-xs font-black text-white">{cat.title}</h4>

                      {/* Quick Color Pill trigger */}
                      <button
                        type="button"
                        onClick={() => setOpenColorPickerId(isPickerOpen ? null : cat.id)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-300 bg-slate-900 hover:bg-slate-850 hover:text-white px-2.5 py-1 rounded-full border border-slate-700/80 transition active:scale-95 shadow-sm"
                        title="Click to change category card color"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-white/30 inline-block shadow-sm shrink-0"
                          style={{
                            background:
                              currentBg.startsWith('#') ||
                              currentBg.startsWith('rgb') ||
                              currentBg.startsWith('linear-gradient')
                                ? currentBg
                                : '#334155',
                          }}
                        />
                        <Palette className="w-3 h-3 text-amber-400" />
                        <span>Change Color</span>
                      </button>
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
                    title="Edit Category Details"
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

              {/* Direct In-Card Color Selection Palette Panel */}
              {isPickerOpen && (
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 space-y-2.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-150 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-white">
                      <Palette className="w-3.5 h-3.5 text-[#E0183D]" />
                      <span>Select Card Color Theme for &ldquo;{cat.title}&rdquo;:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenColorPickerId(null)}
                      className="text-[10px] text-slate-400 hover:text-white underline font-semibold"
                    >
                      Close
                    </button>
                  </div>

                  {/* Preset Swatches */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = currentBg === preset.value;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleColorChange(cat.id, cat.title, preset.value)}
                          className={`p-2 rounded-lg text-left transition flex items-center gap-2 border text-[11px] ${
                            isSelected
                              ? 'border-white ring-2 ring-white/30 bg-slate-800 font-black text-white'
                              : 'border-slate-800 hover:border-slate-600 bg-slate-950/80 text-slate-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm flex items-center justify-center"
                            style={{ background: preset.value }}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <span className="truncate">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold text-slate-400">Custom Solid Hex Color:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={nativePickerVal}
                        onChange={(e) => handleColorChange(cat.id, cat.title, e.target.value)}
                        className="w-7 h-7 rounded-lg border border-slate-700 bg-slate-950 cursor-pointer"
                        title="Choose custom color"
                      />
                      <span className="text-[10px] font-mono text-slate-300 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {nativePickerVal}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
          );
        })}
      </div>
    </div>
  );
};

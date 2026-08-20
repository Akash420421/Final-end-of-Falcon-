import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Palette, Eye } from 'lucide-react';
import { Category } from '../../../types';
import { ProductVisual } from '../../ProductVisual';

interface CategoryEditModalProps {
  category: Category | null;
  uploadingMap: Record<string, boolean>;
  onClose: () => void;
  onSave: (category: Partial<Category>) => Promise<void>;
  onFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void | Promise<void>,
    label?: string,
    slotKey?: string,
    cropOptions?: {
      aspectRatio?: number | null;
      recommendedSizeText?: string;
      title?: string;
    }
  ) => Promise<void>;
  onShowToast: (msg: string) => void;
}

const PRESET_COLORS = [
  { name: 'Crimson Red', value: 'linear-gradient(135deg, #b91c1c, #7f1d1d)', preview: '#b91c1c' },
  { name: 'Royal Blue', value: 'linear-gradient(135deg, #1d4ed8, #172554)', preview: '#1d4ed8' },
  { name: 'Forest Green', value: 'linear-gradient(135deg, #047857, #064e3b)', preview: '#047857' },
  { name: 'Royal Purple', value: 'linear-gradient(135deg, #6b21a8, #3b0764)', preview: '#6b21a8' },
  { name: 'Amber Copper', value: 'linear-gradient(135deg, #c2410c, #7c2d12)', preview: '#c2410c' },
  { name: 'Midnight Navy', value: 'linear-gradient(135deg, #101124, #1E203C)', preview: '#101124' },
  { name: 'Dark Slate', value: 'linear-gradient(135deg, #334155, #0f172a)', preview: '#334155' },
  { name: 'Ruby Wine', value: 'linear-gradient(135deg, #9f1239, #4c0519)', preview: '#9f1239' },
  { name: 'Teal Ocean', value: 'linear-gradient(135deg, #0f766e, #134e4a)', preview: '#0f766e' },
  { name: 'Golden Bronze', value: 'linear-gradient(135deg, #b45309, #78350f)', preview: '#b45309' },
];

export const CategoryEditModal: React.FC<CategoryEditModalProps> = ({
  category,
  uploadingMap,
  onClose,
  onSave,
  onFileUpload,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<Partial<Category>>(
    category || {
      id: `cat_${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      badge: 'RANGE',
      image: 'fan-regulator-5step',
      imageUrl: '',
      subCategories: [],
      bgColor: 'linear-gradient(135deg, #101124, #1E203C)',
      borderColor: 'border-slate-800',
      textColor: 'text-white',
      iconName: 'Zap',
    }
  );

  const [subCatInput, setSubCatInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Extract a hex color for the native color picker if bgColor is a hex or gradient
  const currentColorVal = formData.bgColor || 'linear-gradient(135deg, #101124, #1E203C)';
  const isHexOrGradient =
    currentColorVal.startsWith('#') ||
    currentColorVal.startsWith('rgb') ||
    currentColorVal.startsWith('linear-gradient');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Category title is required!');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
      onShowToast(category ? 'Category updated!' : 'New category created!');
      onClose();
    } catch (err: any) {
      alert('Error saving category: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubCategory = () => {
    if (!subCatInput.trim()) return;
    const current = formData.subCategories || [];
    setFormData({
      ...formData,
      subCategories: [...current, subCatInput.trim()],
    });
    setSubCatInput('');
  };

  const handleRemoveSubCategory = (index: number) => {
    const current = formData.subCategories || [];
    setFormData({
      ...formData,
      subCategories: current.filter((_, i) => i !== index),
    });
  };

  // Helper for card background preview
  const getCardBgStyle = () => {
    if (isHexOrGradient) {
      return { background: currentColorVal };
    }
    return undefined;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {category ? 'Edit Category' : 'Add New Category'}
            </h3>
            <span className="text-[11px] text-slate-400">
              Configure title, card color theme, badge, icon, and subcategories
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Live Card Mini Preview */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#E0183D]" />
                Live Card Preview
              </span>
              <span className="text-[10px] text-slate-500 font-medium">As visible on Home screen</span>
            </div>

            <div
              style={getCardBgStyle()}
              className={`rounded-2xl p-3 text-white border border-white/10 shadow-lg flex items-center justify-between gap-3 ${
                !isHexOrGradient ? currentColorVal : ''
              }`}
            >
              <div className="w-14 h-14 bg-white rounded-xl p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
                <ProductVisual
                  type={formData.imageUrl || formData.image || 'fan-regulator-5step'}
                  size="sm"
                  objectFit="contain"
                  className="w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                {formData.badge && (
                  <span className="inline-block bg-black/40 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/20 mb-1">
                    {formData.badge}
                  </span>
                )}
                <h4 className="text-[13px] font-black text-white leading-tight truncate">
                  {formData.title || 'Category Title'}
                </h4>
                <p className="text-[10px] text-white/70 truncate mt-0.5">
                  {formData.subtitle || 'Category Subtitle'}
                </p>
              </div>

              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-white text-xs">→</span>
              </div>
            </div>
          </div>

          {/* Category Card Color Chooser */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Palette className="w-4 h-4 text-[#E0183D]" />
                <span>Category Card Color Theme</span>
              </label>
              <span className="text-[10px] text-slate-400">Choose preset or custom color</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
              {PRESET_COLORS.map((preset) => {
                const isSelected = formData.bgColor === preset.value;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, bgColor: preset.value })}
                    className={`group flex flex-col items-center gap-1 p-1.5 rounded-xl border transition ${
                      isSelected
                        ? 'border-white ring-2 ring-[#E0183D] bg-slate-900'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                    }`}
                  >
                    <div
                      style={{ background: preset.value }}
                      className="w-full h-6 rounded-lg shadow-sm border border-white/20"
                    />
                    <span className="text-[9px] text-slate-300 font-bold truncate max-w-full">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input / Hex Code */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-[11px] font-bold text-slate-300 shrink-0">
                Custom Color / Gradient:
              </span>
              <div className="flex items-center gap-2 flex-1 w-full">
                {/* Native Color Picker button */}
                <div className="relative flex items-center shrink-0">
                  <input
                    type="color"
                    value={
                      formData.bgColor?.startsWith('#')
                        ? formData.bgColor
                        : '#1e293b'
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bgColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    title="Open Color Wheel / Palette"
                  />
                </div>
                {/* Text input for Hex or CSS Gradient */}
                <input
                  type="text"
                  value={formData.bgColor || ''}
                  onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                  placeholder="e.g. #1e40af or linear-gradient(...)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Category Title *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Summer Switches"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Badge Label</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. PEAK DEMAND / HEAVY DUTY"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Subtitle / Tagline</label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Cooling & Fan Controls"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          {/* Category Graphic / Icon Upload */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 rounded-xl border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <ProductVisual
                type={formData.imageUrl || formData.image || 'fan-regulator-5step'}
                size="sm"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="font-bold text-white block">Category Visual Graphic</span>
              <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingMap['Category Icon'] ? 'Uploading...' : 'Upload Custom Image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingMap['Category Icon'] === true}
                  className="hidden"
                  onChange={(e) =>
                    onFileUpload(
                      e,
                      (url) => {
                        setFormData({
                          ...formData,
                          imageUrl: url,
                          image: url,
                        });
                      },
                      'Category Icon',
                      'Category Icon',
                      {
                        aspectRatio: 1,
                        title: 'Crop Category Icon',
                        recommendedSizeText: '400 × 400 px (Square 1:1 ratio)',
                      }
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* Sub-categories Manager */}
          <div className="space-y-2 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <label className="font-bold text-slate-300 block">Sub-categories Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subCatInput}
                onChange={(e) => setSubCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubCategory();
                  }
                }}
                placeholder="e.g. Rotary Switches"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
              />
              <button
                type="button"
                onClick={handleAddSubCategory}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3.5 py-2 rounded-xl transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(formData.subCategories || []).map((sub, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-[10px] bg-slate-900 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-800"
                >
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubCategory(idx)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">Description</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Complete range of heavy duty fan regulators and summer cooling controls..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#E0183D] hover:bg-[#c01233] text-white font-black px-6 py-2.5 rounded-xl shadow-lg transition min-h-[40px] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
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
      bgColor: 'bg-red-950/20',
      borderColor: 'border-red-900/30',
      textColor: 'text-red-400',
      iconName: 'Zap',
    }
  );

  const [subCatInput, setSubCatInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {category ? 'Edit Category' : 'Add New Category'}
            </h3>
            <span className="text-[11px] text-slate-400">
              Configure title, badge, visual icon, and subcategory tags
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Category Title *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Summer Appliances"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Badge Label</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. SUMMER RANGE / BEST SELLER"
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
              placeholder="e.g. Regulators, Dimmers & Rotary Switches"
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
              <span className="font-bold text-white block">Category Visual Icon</span>
              <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingMap['Category Icon'] ? 'Uploading...' : 'Upload Custom Icon'}
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

import React, { useState } from 'react';
import { X, Upload, Crop, Trash2, Plus, Star, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Product, Category } from '../../../types';
import { ProductVisual } from '../../ProductVisual';

interface ProductEditModalProps {
  product: Product | null; // null means Add New Product
  categories: Category[];
  uploadingMap: Record<string, boolean>;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
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
  onOpenCropper: (config: {
    imageSrc: string;
    title: string;
    targetLabel: string;
    aspectRatio: number | null;
    recommendedSizeText: string;
    onCropComplete: (dataUrl: string) => void | Promise<void>;
  }) => void;
  onShowToast: (msg: string) => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  categories,
  uploadingMap,
  onClose,
  onSave,
  onFileUpload,
  onOpenCropper,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      id: `prod_${Date.now()}`,
      name: '',
      category: categories[0]?.id || 'summer',
      categoryName: categories[0]?.title || 'Summer Appliances',
      subCategory: categories[0]?.subCategories?.[0] || '',
      price: '',
      perPiecePrice: '',
      amps: '',
      description: '',
      features: ['Heavy Duty Brass Terminals', 'Fire Retardant Grade Polycarbonate Body'],
      image: 'fan-regulator-5step',
      images: ['fan-regulator-5step'],
      isTopPick: false,
      badge: 'Heavy Duty',
    }
  );

  const [featureInput, setFeatureInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Product name is required!');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
      onShowToast(product ? 'Product updated successfully!' : 'New product created!');
      onClose();
    } catch (err: any) {
      alert('Error saving product: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const currentCategory = categories.find((c) => c.id === formData.category);
  const availableSubCategories = currentCategory?.subCategories || [];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full p-5 sm:p-6 border border-slate-800 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {product ? 'Edit Product Details' : 'Add New Product to Catalog'}
            </h3>
            <span className="text-[11px] text-slate-400">
              Configure name, pricing, ratings, badges, and photo gallery
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
          {/* Product Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300">Product Title *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Falcon 5-Step Heavy Duty Modular Fan Regulator"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Category *</label>
              <select
                value={formData.category || ''}
                onChange={(e) => {
                  const catVal = e.target.value;
                  const catObj = categories.find((c) => c.id === catVal);
                  setFormData({
                    ...formData,
                    category: catVal,
                    categoryName: catObj ? catObj.title : '',
                    subCategory: catObj?.subCategories?.[0] || '',
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E0183D]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Sub-Category (Optional)</label>
              <select
                value={formData.subCategory || ''}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#E0183D]"
              >
                <option value="">-- None / General --</option>
                {availableSubCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Amperes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">1 Pc Rate (₹/pc)</label>
              <input
                type="text"
                value={formData.perPiecePrice || ''}
                onChange={(e) => setFormData({ ...formData, perPiecePrice: e.target.value })}
                placeholder="e.g. 45"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Box / Master Price</label>
              <input
                type="text"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. ₹450 / 10 Pcs"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Amperes / Rating</label>
              <input
                type="text"
                value={formData.amps || ''}
                onChange={(e) => setFormData({ ...formData, amps: e.target.value })}
                placeholder="e.g. 16 Amp / 240V"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
              />
            </div>
          </div>

          {/* Badge & Top Pick */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">Badge Tag</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Best Seller / Heavy Duty"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(formData.isTopPick)}
                  onChange={(e) => setFormData({ ...formData, isTopPick: e.target.checked })}
                  className="rounded text-[#E0183D] focus:ring-0 w-4 h-4 bg-slate-900 border-slate-700"
                />
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Feature in Top Picks</span>
                </span>
              </label>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="space-y-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-white block">Product Photo Gallery</span>
                <span className="text-[10px] text-slate-400">
                  First image is used as primary cover thumbnail
                </span>
              </div>

              <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 shadow min-h-[34px]">
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploadingMap['Product Image'] ? 'Uploading...' : '+ Upload New Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingMap['Product Image'] === true}
                  className="hidden"
                  onChange={(e) =>
                    onFileUpload(
                      e,
                      (url) => {
                        const current = formData.images || (formData.image ? [formData.image] : []);
                        const isPreset = (img: string) => !img.startsWith('data:') && !img.startsWith('http');
                        const filtered = current.filter((img) => !isPreset(img));
                        const nextImages = [...filtered, url];
                        setFormData({
                          ...formData,
                          image: nextImages[0],
                          images: nextImages,
                        });
                      },
                      'Product Image',
                      'Product Image',
                      {
                        aspectRatio: 1,
                        title: 'Crop Product Photo',
                        recommendedSizeText: '800 × 800 px (Square 1:1 ratio)',
                      }
                    )
                  }
                />
              </label>
            </div>

            {/* Photos Preview List */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {(formData.images || (formData.image ? [formData.image] : ['fan-regulator-5step'])).map(
                (img, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 bg-slate-900 rounded-xl border border-slate-800 p-1 flex items-center justify-center relative group overflow-hidden"
                  >
                    <ProductVisual type={img} size="sm" />
                    {img && (img.startsWith('http') || img.startsWith('data:')) && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.images || []).filter((_, i) => i !== idx);
                          setFormData({
                            ...formData,
                            image: updated[0] || 'fan-regulator-5step',
                            images: updated,
                          });
                        }}
                        className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-bold text-slate-300">Description</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Ultra-smooth rotary knob with precision brass step contacts for silent fan control..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          {/* Submit Actions */}
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
              {isSaving ? 'Saving Product...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

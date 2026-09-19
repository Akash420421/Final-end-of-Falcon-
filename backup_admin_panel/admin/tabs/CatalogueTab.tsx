import React, { useState } from 'react';
import {
  BookOpen,
  Save,
  Plus,
  Info,
  Image as ImageIcon,
  Crop,
  ArrowUp,
  ArrowDown,
  Trash2,
  Upload,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CatalogueSettings, CataloguePage } from '../../../types';

interface CatalogueTabProps {
  catalogueSettings: CatalogueSettings;
  uploadingMap: Record<string, boolean>;
  onUpdateCatalogueSettings: (settings: Partial<CatalogueSettings>) => Promise<void>;
  onUpdateCataloguePages: (pages: CataloguePage[]) => Promise<void>;
  onUpdateSingleCataloguePage: (page: CataloguePage) => Promise<void>;
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

export const CatalogueTab: React.FC<CatalogueTabProps> = ({
  catalogueSettings,
  uploadingMap,
  onUpdateCatalogueSettings,
  onUpdateCataloguePages,
  onUpdateSingleCataloguePage,
  onFileUpload,
  onOpenCropper,
  onShowToast,
}) => {
  const [editingCatalogue, setEditingCatalogue] = useState<CatalogueSettings>(catalogueSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateCatalogueSettings(editingCatalogue);
      onShowToast('Catalogue settings saved to Database!');
    } catch (err: any) {
      alert('Failed to save Catalogue: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewSlot = async () => {
    const currentPages = editingCatalogue.pages || [];
    const newPageNum = currentPages.length + 1;
    const newPage: CataloguePage = {
      id: `cat_page_${Date.now()}_${newPageNum}`,
      pageNumber: newPageNum,
      imageUrl: '',
      image: '',
      title: `Page ${newPageNum}`,
    };
    const updated = [...currentPages, newPage];
    setEditingCatalogue({ ...editingCatalogue, pages: updated });
    try {
      await onUpdateCataloguePages(updated);
      onShowToast(`Added image slot #${newPageNum}!`);
    } catch (err: any) {
      alert('Error adding slot: ' + (err?.message || err));
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Global Settings Form */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Catalogue Range Brochure Settings
              </h3>
              <p className="text-[11px] text-slate-400">
                Customize page headings, inquiry messages, and page number badges.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-black px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow transition min-h-[38px] disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              Page Heading / Title
            </label>
            <input
              type="text"
              value={editingCatalogue.title || ''}
              onChange={(e) =>
                setEditingCatalogue({ ...editingCatalogue, title: e.target.value })
              }
              placeholder="e.g. Our Range Products and Details"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              Subtitle Description
            </label>
            <input
              type="text"
              value={editingCatalogue.subtitle || ''}
              onChange={(e) =>
                setEditingCatalogue({ ...editingCatalogue, subtitle: e.target.value })
              }
              placeholder="e.g. Complete switchgear and electrical accessories range"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              WhatsApp Inquiry Default Message
            </label>
            <input
              type="text"
              value={editingCatalogue.whatsappMessage || ''}
              onChange={(e) =>
                setEditingCatalogue({ ...editingCatalogue, whatsappMessage: e.target.value })
              }
              placeholder="e.g. Hello Falcon Electrics, I am viewing your product catalogue..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          {/* Page Numbers Toggle */}
          <div className="space-y-1 sm:col-span-2 bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <span className="text-xs font-bold text-white block">
                Show Page Numbers on Images
              </span>
              <span className="text-[10px] text-slate-400 block">
                Display an elegant &quot;Page 1&quot;, &quot;Page 2&quot; badge in the corner of each brochure page.
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                const newVal = editingCatalogue.showPageNumbers === false ? true : false;
                const updated = { ...editingCatalogue, showPageNumbers: newVal };
                setEditingCatalogue(updated);
                await onUpdateCatalogueSettings({ showPageNumbers: newVal });
                onShowToast(newVal ? 'Page numbers enabled!' : 'Page numbers hidden!');
              }}
              className={`px-3 py-2 rounded-xl font-bold text-xs transition border cursor-pointer min-h-[38px] ${
                editingCatalogue.showPageNumbers !== false
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {editingCatalogue.showPageNumbers !== false
                ? 'Numbers: ON (Visible)'
                : 'Numbers: OFF (Hidden)'}
            </button>
          </div>
        </div>
      </form>

      {/* Catalogue Pages Upload Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red-400" />
              <span>Catalogue Pages ({(editingCatalogue.pages || []).length} Total Pages)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Upload your high-resolution A4 brochure pages in sequence.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddNewSlot}
            className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Page Slot</span>
          </button>
        </div>

        {/* Size Recommendation Info */}
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              <strong className="text-white">Best Fit Size:</strong> 1200 × 1600 px (Portrait 3:4 or Standard A4 Brochure Page).
            </span>
          </div>
          <span className="text-emerald-400 font-bold text-[10px]">
            Automatic mobile responsive fit • No stretching
          </span>
        </div>

        {/* Image Slots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(editingCatalogue.pages || []).map((page, pIdx) => {
            const imgUrl = page.imageUrl || page.image;
            const hasCustomImage = Boolean(
              imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('data:') || imgUrl.includes('/'))
            );

            return (
              <div
                key={page.id || pIdx}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition relative shadow-md"
              >
                <div>
                  {/* Top Bar: Page #, Crop, Reorder, Delete */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-900">
                    <span className="text-[11px] font-black text-[#E0183D] bg-red-950/80 px-2.5 py-0.5 rounded-md border border-red-900/60">
                      Page #{pIdx + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      {hasCustomImage && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenCropper({
                              imageSrc: imgUrl!,
                              title: `Crop Catalogue Image #${pIdx + 1}`,
                              targetLabel: `Catalogue Image #${pIdx + 1}`,
                              aspectRatio: 3 / 4,
                              recommendedSizeText: '1200 × 1600 px (Portrait 3:4 / Free Aspect)',
                              onCropComplete: async (croppedUrl) => {
                                const pageId =
                                  editingCatalogue.pages?.[pIdx]?.id || `cat_page_${pIdx + 1}`;
                                const updatedPage: CataloguePage = {
                                  ...(editingCatalogue.pages?.[pIdx] || {
                                    id: pageId,
                                    pageNumber: pIdx + 1,
                                  }),
                                  id: pageId,
                                  pageNumber: pIdx + 1,
                                  imageUrl: croppedUrl,
                                  image: croppedUrl,
                                };
                                const updated = [...(editingCatalogue.pages || [])];
                                updated[pIdx] = updatedPage;
                                setEditingCatalogue({ ...editingCatalogue, pages: updated });
                                await onUpdateSingleCataloguePage(updatedPage);
                                onShowToast(`Cropped Catalogue Page #${pIdx + 1}`);
                              },
                            })
                          }
                          className="p-1.5 text-amber-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition flex items-center gap-1 text-[10px] font-bold"
                          title="Crop Image"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>Crop</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={pIdx === 0}
                        onClick={async () => {
                          const updated = [...(editingCatalogue.pages || [])];
                          const [moved] = updated.splice(pIdx, 1);
                          updated.splice(pIdx - 1, 0, moved);
                          const renumbered = updated.map((p, i) => ({ ...p, pageNumber: i + 1 }));
                          setEditingCatalogue({ ...editingCatalogue, pages: renumbered });
                          await onUpdateCataloguePages(renumbered);
                          onShowToast(`Moved to Page ${pIdx + 1}!`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-20 rounded-lg transition"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={pIdx === (editingCatalogue.pages || []).length - 1}
                        onClick={async () => {
                          const updated = [...(editingCatalogue.pages || [])];
                          const [moved] = updated.splice(pIdx, 1);
                          updated.splice(pIdx + 1, 0, moved);
                          const renumbered = updated.map((p, i) => ({ ...p, pageNumber: i + 1 }));
                          setEditingCatalogue({ ...editingCatalogue, pages: renumbered });
                          await onUpdateCataloguePages(renumbered);
                          onShowToast(`Moved to Page ${pIdx + 2}!`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-20 rounded-lg transition"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete Page #${pIdx + 1}?`)) {
                            const updated = (editingCatalogue.pages || []).filter(
                              (_, i) => i !== pIdx
                            );
                            const renumbered = updated.map((p, i) => ({ ...p, pageNumber: i + 1 }));
                            setEditingCatalogue({ ...editingCatalogue, pages: renumbered });
                            try {
                              await onUpdateCataloguePages(renumbered);
                              onShowToast(`Deleted Page #${pIdx + 1}`);
                            } catch (err: any) {
                              alert('Error deleting page: ' + (err?.message || err));
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-red-950/60 rounded-lg transition"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Preview Container */}
                  <div className="mt-3 aspect-[3/4] bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden relative group">
                    {hasCustomImage ? (
                      <img
                        src={imgUrl}
                        alt={`Catalogue Page ${pIdx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-400 block">
                          No Image Uploaded
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Click upload below to add A4 brochure page
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <div className="pt-2">
                  <label className="w-full cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition shadow flex items-center justify-center gap-2 min-h-[38px]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {uploadingMap[`cat_page_${pIdx}`]
                        ? 'Uploading & Optimizing...'
                        : hasCustomImage
                        ? 'Replace Page Photo'
                        : 'Upload Page Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingMap[`cat_page_${pIdx}`] === true}
                      onChange={(e) =>
                        onFileUpload(
                          e,
                          async (url) => {
                            const pageId =
                              editingCatalogue.pages?.[pIdx]?.id || `cat_page_${pIdx + 1}`;
                            const updatedPage: CataloguePage = {
                              ...(editingCatalogue.pages?.[pIdx] || {
                                id: pageId,
                                pageNumber: pIdx + 1,
                              }),
                              id: pageId,
                              pageNumber: pIdx + 1,
                              imageUrl: url,
                              image: url,
                            };
                            const updated = [...(editingCatalogue.pages || [])];
                            updated[pIdx] = updatedPage;
                            setEditingCatalogue({ ...editingCatalogue, pages: updated });
                            await onUpdateSingleCataloguePage(updatedPage);
                            onShowToast(`Page #${pIdx + 1} uploaded & saved!`);
                          },
                          `Catalogue Page #${pIdx + 1}`,
                          `cat_page_${pIdx}`,
                          {
                            aspectRatio: 3 / 4,
                            title: `Crop Catalogue Page #${pIdx + 1}`,
                            recommendedSizeText: '1200 × 1600 px (Portrait 3:4 / Free Aspect)',
                          }
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

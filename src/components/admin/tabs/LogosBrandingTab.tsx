import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Upload,
  Crop,
  Sliders,
  Save,
  Check,
} from 'lucide-react';
import { CompanyDetails, HeroContent } from '../../../types';
import { ProductVisual } from '../../ProductVisual';

interface LogosBrandingTabProps {
  companyDetails: CompanyDetails;
  heroContent: HeroContent;
  logoImageUrl: string;
  uploadingMap: Record<string, boolean>;
  onUpdateCompanyDetails: (details: Partial<CompanyDetails>) => Promise<void>;
  onUpdateHeroContent: (hero: Partial<HeroContent>) => Promise<void>;
  onUpdateLogoImage: (url: string) => Promise<void>;
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

export const LogosBrandingTab: React.FC<LogosBrandingTabProps> = ({
  companyDetails,
  heroContent,
  logoImageUrl,
  uploadingMap,
  onUpdateCompanyDetails,
  onUpdateHeroContent,
  onUpdateLogoImage,
  onFileUpload,
  onOpenCropper,
  onShowToast,
}) => {
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [customBannerUrlInput, setCustomBannerUrlInput] = useState('');
  const [editingHero, setEditingHero] = useState<HeroContent>(heroContent);
  const [editingCompany, setEditingCompany] = useState<CompanyDetails>(companyDetails);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateHeroContent(editingHero);
      onShowToast('Hero Banner settings saved successfully!');
    } catch (err: any) {
      alert('Error saving hero content: ' + (err?.message || err));
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* SECTION 1: Full Custom Header Brand Banner Mode */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-red-900/50 space-y-4 shadow-lg ring-1 ring-red-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-[#E0183D] border border-red-500/30 text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Full Header Banner Mode</span>
            </div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#E0183D]" />
              Custom Header Brand Banner (Combined Logo + Stylized Name Image)
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              Upload a single complete image designed in Canva/Photoshop containing your custom Logo, colorful stylized Brand Name, and Taglines.
            </p>
          </div>

          {editingCompany.customHeaderBannerUrl && (
            <button
              type="button"
              onClick={async () => {
                const updated = {
                  ...editingCompany,
                  customHeaderBannerUrl: '',
                  headerBrandMode: 'logo_text' as const,
                };
                setEditingCompany(updated);
                await onUpdateCompanyDetails(updated);
                onShowToast('Custom Banner removed! Reverted to standard Logo + Text mode.');
              }}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 underline self-start sm:self-auto"
            >
              Remove Banner
            </button>
          )}
        </div>

        {/* Mode Selector Pill Buttons */}
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-white block">Active Header Display Mode</span>
            <span className="text-[10px] text-slate-400">Choose how your brand identity appears in the top navigation header</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const updated = { ...editingCompany, headerBrandMode: 'logo_text' as const };
                setEditingCompany(updated);
                await onUpdateCompanyDetails(updated);
                onShowToast('Switched to Standard Separate Logo + Text Mode!');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${
                (editingCompany.headerBrandMode || 'logo_text') === 'logo_text'
                  ? 'bg-[#E0183D] text-white border-red-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>Separate Logo + Text</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                const updated = { ...editingCompany, headerBrandMode: 'banner' as const };
                setEditingCompany(updated);
                await onUpdateCompanyDetails(updated);
                onShowToast('Switched to Full Custom Header Banner Mode!');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${
                editingCompany.headerBrandMode === 'banner'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Custom Banner</span>
            </button>
          </div>
        </div>

        {/* Banner Upload Box */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800">
            {/* Live Banner Preview Box */}
            <div className="w-full sm:w-64 h-20 bg-[#101124] rounded-xl border border-slate-700 flex items-center justify-center p-2 shrink-0 relative overflow-hidden group">
              {editingCompany.customHeaderBannerUrl ? (
                <img
                  src={editingCompany.customHeaderBannerUrl}
                  alt="Custom Header Brand Banner"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center p-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    No Banner Uploaded
                  </span>
                  <span className="text-[9px] text-slate-500 block">
                    (Upload your Canva/Photoshop Banner)
                  </span>
                </div>
              )}
            </div>

            {/* Banner Upload & URL Controls */}
            <div className="space-y-3 flex-1 w-full max-w-full overflow-hidden">
              <div className="flex flex-wrap items-center gap-2">
                <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow flex items-center gap-2 min-h-[40px]">
                  <Upload className="w-4 h-4" />
                  <span>
                    {uploadingMap['Header Banner']
                      ? 'Uploading & Saving...'
                      : 'Upload Full Header Banner Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingMap['Header Banner'] === true}
                    onChange={(e) =>
                      onFileUpload(
                        e,
                        async (url) => {
                          const updated = {
                            ...editingCompany,
                            customHeaderBannerUrl: url,
                            headerBrandMode: 'banner' as const,
                          };
                          setEditingCompany(updated);
                          await onUpdateCompanyDetails(updated);
                        },
                        'Header Banner',
                        'Header Banner',
                        {
                          aspectRatio: null,
                          title: 'Crop & Adjust Custom Header Brand Banner',
                          recommendedSizeText: 'Wide Landscape (e.g. 600 × 120 px or 800 × 160 px, Transparent PNG)',
                        }
                      )
                    }
                    className="hidden"
                  />
                </label>

                {editingCompany.customHeaderBannerUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenCropper({
                        imageSrc: editingCompany.customHeaderBannerUrl!,
                        title: 'Crop & Fine-Tune Header Brand Banner',
                        targetLabel: 'Header Brand Banner',
                        aspectRatio: null,
                        recommendedSizeText: 'Free Aspect Ratio (Custom Width & Height)',
                        onCropComplete: async (croppedUrl) => {
                          const updated = {
                            ...editingCompany,
                            customHeaderBannerUrl: croppedUrl,
                            headerBrandMode: 'banner' as const,
                          };
                          setEditingCompany(updated);
                          await onUpdateCompanyDetails(updated);
                          onShowToast('Header Brand Banner cropped & saved!');
                        },
                      })
                    }
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 min-h-[40px]"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Crop / Adjust</span>
                  </button>
                )}
              </div>

              {/* Paste URL Input - Safe Stacked Layout on Mobile */}
              <div className="space-y-1.5 pt-1 w-full max-w-full">
                <span className="text-[11px] text-slate-300 font-bold block">
                  Or Paste Banner Image URL / Link:
                </span>
                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full">
                  <input
                    type="text"
                    value={customBannerUrlInput}
                    onChange={(e) => setCustomBannerUrlInput(e.target.value)}
                    placeholder="Paste link e.g. https://.../falcon-banner.png"
                    className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const trimmed = customBannerUrlInput.trim();
                      if (trimmed) {
                        const updated = {
                          ...editingCompany,
                          customHeaderBannerUrl: trimmed,
                          headerBrandMode: 'banner' as const,
                        };
                        setEditingCompany(updated);
                        await onUpdateCompanyDetails(updated);
                        onShowToast('Custom Banner URL saved & activated!');
                        setCustomBannerUrlInput('');
                      }
                    }}
                    className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow shrink-0 min-h-[38px]"
                  >
                    Apply Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Standard Separate Logo Icon & Text Mode */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#E0183D]" />
              Standard Separate Logo Icon & Tagline
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Square or circular logo icon paired with customizable brand name text and subtitle tagline.
            </p>
          </div>

          {logoImageUrl && (
            <button
              type="button"
              onClick={async () => {
                await onUpdateLogoImage('');
                onShowToast('Reset to default vector Falcon logo!');
              }}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 underline self-start sm:self-auto"
            >
              Reset to Default Logo
            </button>
          )}
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800">
            {/* Logo Preview Box */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#101124] border border-slate-700 flex items-center justify-center p-2 shrink-0 relative overflow-hidden group">
              {logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt="Current Falcon Electrics Brand Logo"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-black text-xs mb-1">
                    FE
                  </div>
                  <span className="text-[9px] font-black text-slate-400">DEFAULT LOGO</span>
                </div>
              )}
            </div>

            {/* Logo Upload & Link Controls */}
            <div className="space-y-3 flex-1 w-full max-w-full overflow-hidden">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1.5">
                  Upload Logo Icon (PNG / JPG / WebP)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow flex items-center gap-2 min-h-[40px]">
                    <Upload className="w-4 h-4" />
                    <span>
                      {uploadingMap['Logo'] ? 'Uploading & Saving...' : 'Select & Upload Logo Icon'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingMap['Logo'] === true}
                      onChange={(e) =>
                        onFileUpload(
                          e,
                          async (url) => await onUpdateLogoImage(url),
                          'Logo',
                          'Logo',
                          {
                            aspectRatio: 1,
                            title: 'Crop & Center Brand Logo Icon',
                            recommendedSizeText: '800 × 800 px (Square 1:1 ratio, Transparent cutout PNG/WebP)',
                          }
                        )
                      }
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Paste Image URL / Link - Safe Stacked Layout */}
              <div className="space-y-1.5 pt-1 w-full max-w-full">
                <span className="text-[11px] text-slate-300 font-bold block">
                  Or Paste Image URL / Link:
                </span>
                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full">
                  <input
                    type="text"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    placeholder="Paste image link e.g. https://.../logo.png"
                    className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const trimmed = logoUrlInput.trim();
                      if (trimmed) {
                        await onUpdateLogoImage(trimmed);
                        onShowToast('Website Logo updated from URL Link!');
                        setLogoUrlInput('');
                      }
                    }}
                    className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow shrink-0 min-h-[38px]"
                  >
                    Apply Link
                  </button>
                </div>
              </div>

              {/* Logo Tagline & Hide Text Settings */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="w-full max-w-full">
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Logo Tagline / Subtitle Text (e.g. &quot;Switch to excellence&quot;)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full">
                    <input
                      type="text"
                      value={editingCompany.logoTagline || ''}
                      onChange={(e) =>
                        setEditingCompany({ ...editingCompany, logoTagline: e.target.value })
                      }
                      placeholder="e.g. Switch to excellence"
                      className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await onUpdateCompanyDetails({
                            ...editingCompany,
                            logoTagline: editingCompany.logoTagline || 'Switch to excellence',
                          });
                          onShowToast('Logo Tagline subtitle updated & saved!');
                        } catch (err: any) {
                          alert('Error saving tagline: ' + (err?.message || err));
                        }
                      }}
                      className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow shrink-0 min-h-[38px]"
                    >
                      Save Tagline
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    This subtitle is displayed directly beneath the Falcon Electrics brand logo on the desktop header.
                  </p>
                </div>

                {/* Hide Brand Name Text Toggle */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Hide Brand Name Text (Image Only)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      If enabled, only your uploaded logo image will show, hiding the textual &quot;Falcon Electrics&quot; words.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const nextVal = !editingCompany.hideLogoText;
                      const updated = { ...editingCompany, hideLogoText: nextVal };
                      setEditingCompany(updated);
                      try {
                        await onUpdateCompanyDetails(updated);
                        onShowToast(nextVal ? 'Brand name text hidden!' : 'Brand name text visible!');
                      } catch (err: any) {
                        alert('Error updating logo text visibility: ' + (err?.message || err));
                      }
                    }}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition border min-h-[38px] ${
                      editingCompany.hideLogoText
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                    }`}
                  >
                    {editingCompany.hideLogoText ? 'Text: Hidden (Image Only)' : 'Text: Visible (Default)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Hero Section Switch Photos & Auto-Slider */}
      <form onSubmit={handleSaveHero} className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#E0183D]" />
              Hero Section Switch Photos & Auto-Slider
            </h3>
            <p className="text-[11px] text-slate-400">
              Upload 1 to 4+ photos of switches/appliances. They will automatically transition in the Hero banner.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">
                Active Hero Photos (
                {(editingHero.switchImages && editingHero.switchImages.length > 0
                  ? editingHero.switchImages
                  : [editingHero.switchImageUrl || 'hero-fan-regulator']
                ).length}{' '}
                Active)
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">
                Auto-changes every 3 seconds
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(editingHero.switchImages && editingHero.switchImages.length > 0
                ? editingHero.switchImages
                : [editingHero.switchImageUrl || 'hero-fan-regulator']
              ).map((imgUrl, imgIdx) => (
                <div
                  key={imgIdx}
                  className="bg-slate-950 rounded-xl border border-slate-800 p-2 relative flex flex-col items-center justify-center group"
                >
                  <div className="w-20 h-20 flex items-center justify-center">
                    <ProductVisual type={imgUrl} size="md" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-bold text-slate-400">Photo #{imgIdx + 1}</span>
                    {imgUrl &&
                      (imgUrl.startsWith('data:') ||
                        imgUrl.startsWith('http') ||
                        imgUrl.includes('/')) && (
                        <button
                          type="button"
                          onClick={() =>
                            onOpenCropper({
                              imageSrc: imgUrl,
                              title: `Crop Hero Photo #${imgIdx + 1}`,
                              targetLabel: `Hero Photo #${imgIdx + 1}`,
                              aspectRatio: 1,
                              recommendedSizeText: '800 × 800 px (Square 1:1 ratio)',
                              onCropComplete: async (croppedUrl) => {
                                const current =
                                  editingHero.switchImages || [
                                    editingHero.switchImageUrl || 'hero-fan-regulator',
                                  ];
                                const updated = [...current];
                                updated[imgIdx] = croppedUrl;
                                const nextHero = {
                                  ...editingHero,
                                  switchImageUrl: updated[0],
                                  switchImages: updated,
                                };
                                setEditingHero(nextHero);
                                await onUpdateHeroContent(nextHero);
                                onShowToast(`Hero Photo #${imgIdx + 1} cropped & saved!`);
                              },
                            })
                          }
                          className="p-1 text-amber-400 hover:text-white bg-slate-900 rounded"
                          title="Crop Image"
                        >
                          <Crop className="w-3 h-3" />
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload New Hero Photo */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow flex items-center gap-2 min-h-[40px]">
              <Upload className="w-4 h-4" />
              <span>
                {uploadingMap['Hero Photo']
                  ? 'Uploading & Saving...'
                  : '+ Upload New Hero Switch Photo'}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingMap['Hero Photo'] === true}
                onChange={(e) =>
                  onFileUpload(
                    e,
                    async (url) => {
                      const current = editingHero.switchImages || [
                        editingHero.switchImageUrl || 'hero-fan-regulator',
                      ];
                      const updated = [...current, url];
                      const nextHero = {
                        ...editingHero,
                        switchImageUrl: updated[0],
                        switchImages: updated,
                      };
                      setEditingHero(nextHero);
                      await onUpdateHeroContent(nextHero);
                      onShowToast('New Hero Switch Photo added to Auto-Slider!');
                    },
                    'Hero Photo',
                    'Hero Photo',
                    {
                      aspectRatio: 1,
                      title: 'Crop Hero Switch Photo',
                      recommendedSizeText: '800 × 800 px (Square 1:1 ratio)',
                    }
                  )
                }
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Hero Headlines & Text */}
        <div className="grid grid-cols-1 gap-3 pt-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">Hero Headline Title</label>
            <input
              type="text"
              value={editingHero.headline}
              onChange={(e) => setEditingHero({ ...editingHero, headline: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">Hero Subtitle Description</label>
            <textarea
              rows={2}
              value={editingHero.subtitle}
              onChange={(e) => setEditingHero({ ...editingHero, subtitle: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#E0183D] hover:bg-[#c01233] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow transition min-h-[40px]"
        >
          <Save className="w-4 h-4" />
          <span>Save Hero Banner Settings</span>
        </button>
      </form>
    </div>
  );
};

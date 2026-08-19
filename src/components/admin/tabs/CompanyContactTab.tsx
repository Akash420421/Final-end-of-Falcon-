import React, { useState } from 'react';
import {
  Building2,
  Save,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Upload,
  Crop,
  CreditCard,
  Quote,
  Sparkles,
} from 'lucide-react';
import { CompanyDetails } from '../../../types';

interface CompanyContactTabProps {
  companyDetails: CompanyDetails;
  uploadingMap: Record<string, boolean>;
  onUpdateCompanyDetails: (details: Partial<CompanyDetails>) => Promise<void>;
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

export const CompanyContactTab: React.FC<CompanyContactTabProps> = ({
  companyDetails,
  uploadingMap,
  onUpdateCompanyDetails,
  onFileUpload,
  onOpenCropper,
  onShowToast,
}) => {
  const [editingCompany, setEditingCompany] = useState<CompanyDetails>(companyDetails);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateCompanyDetails(editingCompany);
      onShowToast('Company & Contact info updated across website!');
    } catch (err: any) {
      alert('Error updating company details: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full max-w-full overflow-hidden">
      {/* SECTION 1: Website Main Header Color Theme */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div>
          <label className="text-xs font-extrabold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            Website Main Header Color Theme
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Choose background color for the top navigation header on desktop & mobile.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {[
            { id: 'white', label: 'Clean White', bg: 'bg-white text-slate-900 border-slate-300' },
            { id: 'dark', label: 'Dark Black', bg: 'bg-[#101124] text-white border-slate-700' },
            { id: 'navy', label: 'Royal Navy', bg: 'bg-slate-900 text-white border-slate-700' },
            { id: 'red', label: 'Crimson Red', bg: 'bg-[#E0183D] text-white border-red-500' },
            { id: 'slate', label: 'Slate Gray', bg: 'bg-slate-800 text-white border-slate-600' },
          ].map((themeOpt) => {
            const isSelected = (editingCompany.headerTheme || 'white') === themeOpt.id;
            return (
              <button
                key={themeOpt.id}
                type="button"
                onClick={async () => {
                  const updatedCompany = { ...editingCompany, headerTheme: themeOpt.id };
                  setEditingCompany(updatedCompany);
                  try {
                    await onUpdateCompanyDetails(updatedCompany);
                    onShowToast(`Header color changed to ${themeOpt.label}!`);
                  } catch (err: any) {
                    console.error('Failed to update header theme:', err);
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 shadow-sm min-h-[44px] ${
                  isSelected
                    ? 'ring-2 ring-red-500 border-white font-extrabold bg-slate-800 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                <div
                  className={`w-full h-6 rounded-lg ${themeOpt.bg} border flex items-center justify-center text-[10px] font-black`}
                >
                  Header
                </div>
                <span className="text-[10px] text-center">{themeOpt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Business & Legal Identity */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="pb-2 border-b border-slate-800">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#E0183D]" />
            Business & Legal Identity
          </h3>
          <p className="text-[11px] text-slate-400">
            Official trade and manufacturer names displayed in headers, footers, and invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">Brand Name</label>
            <input
              type="text"
              value={editingCompany.brandName}
              onChange={(e) => setEditingCompany({ ...editingCompany, brandName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">Company Legal Name</label>
            <input
              type="text"
              value={editingCompany.companyName}
              onChange={(e) => setEditingCompany({ ...editingCompany, companyName: e.target.value })}
              placeholder="e.g. Verma Enterprises"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">Founder / Proprietor Name</label>
            <input
              type="text"
              value={editingCompany.founder}
              onChange={(e) => setEditingCompany({ ...editingCompany, founder: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">Founded Year</label>
            <input
              type="number"
              value={editingCompany.foundedYear}
              onChange={(e) =>
                setEditingCompany({ ...editingCompany, foundedYear: parseInt(e.target.value) || 2010 })
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Founder Vision & Quote */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Quote className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-extrabold text-white">Founder&apos;s Vision & Statement</h3>
        </div>
        <p className="text-[11px] text-slate-400">
          Displayed with quotation marks in the About Falcon section.
        </p>

        <textarea
          rows={3}
          value={editingCompany.tagline}
          onChange={(e) => setEditingCompany({ ...editingCompany, tagline: e.target.value })}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
        />
      </div>

      {/* SECTION 4: Factory Visiting Card / Certificate Photo */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#E0183D]" />
              Factory Visiting Card / Business Certificate Photo
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upload your official visiting card. Displayed in the Contact Us & Footer sections.
            </p>
          </div>

          {editingCompany.visitingCardUrl && (
            <button
              type="button"
              onClick={async () => {
                const updated = { ...editingCompany, visitingCardUrl: '' };
                setEditingCompany(updated);
                await onUpdateCompanyDetails(updated);
                onShowToast('Visiting Card reset to digital render!');
              }}
              className="text-[10px] font-bold text-red-400 hover:underline self-start sm:self-auto"
            >
              Reset to Digital Card
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="w-44 h-28 bg-[#101124] rounded-xl border border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
            {editingCompany.visitingCardUrl ? (
              <img
                src={editingCompany.visitingCardUrl}
                alt="Visiting Card"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-[9px] font-bold text-slate-500 text-center">
                Digital Business Card Active
              </span>
            )}
          </div>

          <div className="space-y-2 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow flex items-center gap-2 min-h-[40px]">
                <Upload className="w-4 h-4" />
                <span>
                  {uploadingMap['Visiting Card']
                    ? 'Uploading...'
                    : 'Upload Visiting Card Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingMap['Visiting Card'] === true}
                  onChange={(e) =>
                    onFileUpload(
                      e,
                      async (url) => {
                        const updated = { ...editingCompany, visitingCardUrl: url };
                        setEditingCompany(updated);
                        await onUpdateCompanyDetails(updated);
                      },
                      'Visiting Card',
                      'Visiting Card',
                      {
                        aspectRatio: 1.75,
                        title: 'Crop Visiting Card Photo',
                        recommendedSizeText: 'Standard Business Card Ratio (3.5 × 2.0 inches / ~1050 × 600 px)',
                      }
                    )
                  }
                  className="hidden"
                />
              </label>

              {editingCompany.visitingCardUrl && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenCropper({
                      imageSrc: editingCompany.visitingCardUrl!,
                      title: 'Crop Visiting Card Photo',
                      targetLabel: 'Visiting Card',
                      aspectRatio: 1.75,
                      recommendedSizeText: 'Standard Card Ratio (1.75:1)',
                      onCropComplete: async (croppedUrl) => {
                        const updated = { ...editingCompany, visitingCardUrl: croppedUrl };
                        setEditingCompany(updated);
                        await onUpdateCompanyDetails(updated);
                        onShowToast('Visiting Card cropped & saved!');
                      },
                    })
                  }
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1.5 min-h-[40px]"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Crop Card</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: Contact Numbers & Communication */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="pb-2 border-b border-slate-800">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            Contact Numbers & Channels
          </h3>
          <p className="text-[11px] text-slate-400">
            Customers click these numbers to initiate instant phone calls and WhatsApp chats.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              Primary Phone Number (Calling)
            </label>
            <input
              type="text"
              value={editingCompany.phone}
              onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              WhatsApp Number (Direct Chat)
            </label>
            <input
              type="text"
              value={editingCompany.whatsapp}
              onChange={(e) => setEditingCompany({ ...editingCompany, whatsapp: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              Secondary / Alternate Phone (Optional)
            </label>
            <input
              type="text"
              value={editingCompany.secondaryPhone || ''}
              onChange={(e) =>
                setEditingCompany({ ...editingCompany, secondaryPhone: e.target.value })
              }
              placeholder="e.g. +91 98765 43211"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              Official Email Address
            </label>
            <input
              type="email"
              value={editingCompany.email}
              onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: Physical Factory Address & Google Maps */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="pb-2 border-b border-slate-800">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            Factory & Office Physical Location
          </h3>
          <p className="text-[11px] text-slate-400">
            Address displayed in footer and Contact page. Provide Google Maps links for customer navigation.
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400">
              Physical Factory & Works Address
            </label>
            <textarea
              rows={2}
              value={editingCompany.address}
              onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-400">
                Google Maps Embed URL (iFrame src)
              </label>
              <input
                type="text"
                value={editingCompany.googleMapsEmbedUrl || ''}
                onChange={(e) =>
                  setEditingCompany({ ...editingCompany, googleMapsEmbedUrl: e.target.value })
                }
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-400">
                Google Maps Direct Navigation Link
              </label>
              <input
                type="text"
                value={editingCompany.googleMapsDirectionsUrl || ''}
                onChange={(e) =>
                  setEditingCompany({ ...editingCompany, googleMapsDirectionsUrl: e.target.value })
                }
                placeholder="https://maps.app.goo.gl/..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 7: Production Hours & GSTIN */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Production & Factory Hours
            </label>
            <input
              type="text"
              value={editingCompany.timing || ''}
              onChange={(e) => setEditingCompany({ ...editingCompany, timing: e.target.value })}
              placeholder="e.g. Mon - Sat: 9:00 AM - 8:00 PM"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Factory GSTIN / Tax Identification
            </label>
            <input
              type="text"
              value={editingCompany.gstin}
              onChange={(e) => setEditingCompany({ ...editingCompany, gstin: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 8: Save Action Button */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white font-black text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition min-h-[44px] active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save All Company Details'}</span>
        </button>
      </div>
    </form>
  );
};

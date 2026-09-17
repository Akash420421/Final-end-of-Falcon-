import React, { useState, useEffect } from 'react';
import { Award, Save, ShieldCheck, Factory, Zap, Truck, RotateCcw } from 'lucide-react';
import { WhyChooseItem } from '../../../types';
import { whyChooseUsData as defaultWhyChooseUsData } from '../../../data/falconData';

interface WhyUsTabProps {
  whyUsFeatures: WhyChooseItem[];
  onUpdateWhyUsFeatures: (features: WhyChooseItem[]) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const WhyUsTab: React.FC<WhyUsTabProps> = ({
  whyUsFeatures,
  onUpdateWhyUsFeatures,
  onShowToast,
}) => {
  const getInitialFeatures = () => {
    if (whyUsFeatures && whyUsFeatures.length > 0) {
      return whyUsFeatures;
    }
    return defaultWhyChooseUsData;
  };

  const [features, setFeatures] = useState<WhyChooseItem[]>(getInitialFeatures);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (whyUsFeatures && whyUsFeatures.length > 0) {
      setFeatures(whyUsFeatures);
    } else {
      setFeatures(defaultWhyChooseUsData);
    }
  }, [whyUsFeatures]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateWhyUsFeatures(features);
      onShowToast('Why Partner With Us points saved successfully!');
    } catch (err: any) {
      alert('Error updating Why Us features: ' + (err?.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFeatures(defaultWhyChooseUsData);
    onShowToast('Reset to default 4 pillars! Click "Save All 4 Pillars" to persist changes.');
  };

  const icons = [
    { name: 'Factory', icon: <Factory className="w-4 h-4 text-[#E0183D]" /> },
    { name: 'ShieldCheck', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
    { name: 'Zap', icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { name: 'Truck', icon: <Truck className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-[#E0183D]" />
            Why Choose & Partner With Us
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            4 Core Manufacturing Pillars and Trust Factors displayed on the Homepage and dedicated Why Us page.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition min-h-[40px]"
            title="Reset to 4 default factory pillars"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow transition min-h-[40px] disabled:opacity-50 shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All 4 Pillars'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(features.length > 0 ? features : defaultWhyChooseUsData).map((feat, idx) => (
          <div
            key={feat.id || idx}
            className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-black text-white flex items-center gap-2">
                {icons[idx]?.icon || <Award className="w-4 h-4 text-[#E0183D]" />}
                Pillar #{idx + 1}
              </span>
              <span className="text-[10px] bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded border border-slate-800">
                Card {idx + 1}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Title</label>
              <input
                type="text"
                value={feat.title}
                onChange={(e) => {
                  const updated = [...(features.length > 0 ? features : defaultWhyChooseUsData)];
                  updated[idx] = { ...updated[idx], title: e.target.value };
                  setFeatures(updated);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
              <textarea
                rows={3}
                value={feat.description}
                onChange={(e) => {
                  const updated = [...(features.length > 0 ? features : defaultWhyChooseUsData)];
                  updated[idx] = { ...updated[idx], description: e.target.value };
                  setFeatures(updated);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
              />
            </div>
          </div>
        ))}
      </div>
    </form>
  );
};

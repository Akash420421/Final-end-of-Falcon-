import React from 'react';
import { ShieldCheck, Truck, Percent } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useFalconStore } from '../context/StoreContext';
import { openWhatsAppChat } from '../utils/whatsappHelper';

export const BulkDealerCTA: React.FC = () => {
  const { companyDetails } = useFalconStore();

  const handleWhatsAppClick = () => {
    const company = companyDetails?.companyName || 'Verma Enterprises';
    const message = `Hello ${company}, I am interested in special pricing for bulk orders.`;
    const rawPhone = companyDetails?.whatsapp || companyDetails?.phone || '+91 97175 49515';
    openWhatsAppChat(rawPhone, message);
  };

  return (
    <section className="px-4 py-3 lg:py-8 lg:px-8 max-w-md lg:max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-[#101124] via-[#111326] to-[#1A1C38] text-white rounded-2xl lg:rounded-3xl p-4 lg:p-10 shadow-xl border border-red-500/20 relative overflow-hidden">
        {/* Subtle Red Accent Flare */}
        <div className="absolute top-0 right-0 w-32 lg:w-96 h-32 lg:h-96 bg-[#E0183D]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
          {/* Left Column: Information & Perks */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-1.5 mb-1.5 lg:mb-3">
              <span className="bg-[#E0183D] text-white text-[9px] lg:text-[11px] font-extrabold px-2 lg:px-3 py-0.5 lg:py-1 rounded uppercase tracking-wider">
                B2B & DEALER CATALOG
              </span>
            </div>

            <h3 className="text-[17px] lg:text-[28px] xl:text-[32px] font-extrabold text-white leading-snug mb-1 lg:mb-3">
              Special Prices for Bulk Orders
            </h3>

            <p className="text-[11px] lg:text-[15px] text-slate-300 mb-3.5 lg:mb-6 leading-relaxed max-w-2xl">
              Direct factory distribution pricing for electrical contractors, wholesalers & hardware retail dealers across India.
            </p>

            {/* Quick Dealer Perks */}
            <div className="grid grid-cols-3 gap-1.5 lg:gap-6 mb-4 lg:mb-0 text-center border-y border-white/10 py-2 lg:py-4">
              <div className="flex flex-col items-center">
                <Percent className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-[#E0183D] mb-0.5 lg:mb-1.5" />
                <span className="text-[9px] lg:text-[13px] font-semibold text-slate-200">Tiered Margins</span>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-[#E0183D] mb-0.5 lg:mb-1.5" />
                <span className="text-[9px] lg:text-[13px] font-semibold text-slate-200">Pan-India Dispatch</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-[#E0183D] mb-0.5 lg:mb-1.5" />
                <span className="text-[9px] lg:text-[13px] font-semibold text-slate-200">BIS Certified</span>
              </div>
            </div>
          </div>

          {/* Right Column: CTA Action */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
            <button
              onClick={handleWhatsAppClick}
              className="w-full lg:w-auto lg:px-8 lg:py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[13px] lg:text-[16px] py-2.5 rounded-xl lg:rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 lg:gap-3 transition active:scale-98"
            >
              <FaWhatsapp size={20} className="lg:scale-125" />
              <span>Get Wholesale Quotation</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

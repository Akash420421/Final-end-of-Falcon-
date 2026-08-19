import React from 'react';
import { MapPin, Phone, Mail, Clock, FileText, Send } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';
import { FactoryMapCard } from './FactoryMapCard';

interface ContactSectionProps {
  onOpenPhoneModal: () => void;
  onOpenWhatsApp?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  onOpenPhoneModal,
}) => {
  const { companyDetails } = useFalconStore();

  return (
    <section id="contact-section" className="py-6 lg:py-10 px-4 sm:px-6 lg:px-8 max-w-5xl xl:max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* Contact Information Card */}
        <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/90 shadow-sm p-5 lg:p-6 space-y-3.5 lg:col-span-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] lg:text-[11px] font-extrabold tracking-widest text-[#E0183D] uppercase mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>CONTACT US</span>
            </div>

            <h2 className="text-[18px] lg:text-[24px] font-black text-[#171827] leading-tight">
              Get In Touch
            </h2>
            <p className="text-[11px] lg:text-[13px] text-slate-600 leading-relaxed mt-1">
              Request a quote, inquire about bulk orders, or discuss custom manufacturing requirements with our engineering team.
            </p>
          </div>

          {/* Contact Details List */}
          <div className="space-y-2.5 pt-1">
            {/* Address */}
            <div className="flex items-start gap-3 p-2.5 lg:p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="p-1.5 lg:p-2 rounded-lg bg-red-50 text-[#E0183D] shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] lg:text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Factory & Office Address
                </span>
                <p className="text-[11px] lg:text-[13px] font-semibold text-slate-800 leading-snug mt-0.5">
                  {companyDetails.address}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div
              onClick={onOpenPhoneModal}
              className="flex items-center justify-between p-2.5 lg:p-3 bg-slate-50 hover:bg-red-50/50 rounded-xl border border-slate-200/80 cursor-pointer transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 lg:p-2 rounded-lg bg-red-50 text-[#E0183D] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] lg:text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Phone Number
                  </span>
                  <p className="text-[11px] lg:text-[13px] font-bold text-[#171827] group-hover:text-[#E0183D] transition">
                    {companyDetails.phone}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#E0183D] bg-red-100/80 px-2.5 py-1 rounded-md">
                CALL
              </span>
            </div>

            {/* Email */}
            <a
              href={`mailto:${companyDetails.email}`}
              className="flex items-center justify-between p-2.5 lg:p-3 bg-slate-50 hover:bg-red-50/50 rounded-xl border border-slate-200/80 transition group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-1.5 lg:p-2 rounded-lg bg-red-50 text-[#E0183D] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] lg:text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    Email Sales
                  </span>
                  <p className="text-[11px] lg:text-[13px] font-bold text-[#171827] group-hover:text-[#E0183D] truncate">
                    {companyDetails.email}
                  </p>
                </div>
              </div>
              <Send className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E0183D] shrink-0" />
            </a>

            {/* Business Hours */}
            <div className="flex items-center gap-3 p-2.5 lg:p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="p-1.5 lg:p-2 rounded-lg bg-red-50 text-[#E0183D] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] lg:text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Business Hours
                </span>
                <p className="text-[11px] lg:text-[13px] font-semibold text-slate-800 mt-0.5">
                  {companyDetails.businessHours}
                </p>
              </div>
            </div>

            {/* GSTIN Badge */}
            <div className="flex items-center justify-between p-2.5 lg:p-3 bg-[#101124] text-white rounded-xl">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E0183D]" />
                <span className="text-[10px] lg:text-[12px] font-bold">GST Registration</span>
              </div>
              <span className="text-[10px] lg:text-[12px] font-mono font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                {companyDetails.gstin}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Google Map Container */}
        <div className="lg:col-span-6 flex flex-col">
          <FactoryMapCard className="w-full h-full" heightClass="h-[240px] sm:h-[280px] lg:h-full min-h-[300px]" />
        </div>
      </div>
    </section>
  );
};

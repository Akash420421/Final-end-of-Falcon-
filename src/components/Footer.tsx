import React from 'react';
import { MapPin, Phone, Mail, FileText } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa6';
import { useFalconStore } from '../context/StoreContext';

interface FooterProps {
  onOpenWhatsApp: () => void;
  onOpenPhoneModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWhatsApp, onOpenPhoneModal }) => {
  const { companyDetails, logoImageUrl } = useFalconStore();

  return (
    <footer className="bg-[#101124] text-white pt-8 lg:pt-14 pb-6 lg:pb-10 px-4 lg:px-8 border-t border-white/10">
      <div className="max-w-md lg:max-w-7xl mx-auto flex flex-col gap-5 lg:gap-8">
        
        {/* Main Content Layout: Stack on mobile, multi-column grid on desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:gap-10">
          {/* Brand Info */}
          <div className="flex flex-col items-start lg:col-span-6">
            <div className="mb-2 lg:mb-3">
              <span className="text-[18px] lg:text-[24px] font-black tracking-wider text-white">
                {String(companyDetails?.brandName || 'Falcon Electrics').toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] lg:text-[14px] text-slate-300 leading-relaxed max-w-lg">
              {companyDetails?.companyName || 'Verma Enterprises'} — Leading manufacturer of high quality electrical switches, regulators, and modular accessories built for safety, performance & durability.
            </p>
          </div>

          {/* Contact Details */}
          <div className="bg-white/5 rounded-xl lg:rounded-2xl p-3.5 lg:p-6 border border-white/10 flex flex-col gap-2.5 lg:gap-3 text-[11px] lg:text-[13px] text-slate-300 lg:col-span-6">
            <h4 className="text-[11px] lg:text-[13px] font-bold text-white uppercase tracking-wider text-[#E0183D]">
              Factory & Sales Office
            </h4>

            <div className="flex items-start gap-2 lg:gap-3">
              <MapPin className="w-4 h-4 text-[#E0183D] shrink-0 mt-0.5" />
              <span>{companyDetails.address}</span>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:text-white" onClick={onOpenPhoneModal}>
              <Phone className="w-4 h-4 text-[#E0183D] shrink-0" />
              <span className="font-medium">{companyDetails.phone}</span>
            </div>

            <div className="flex items-center gap-2 lg:gap-3">
              <Mail className="w-4 h-4 text-[#E0183D] shrink-0" />
              <a href={`mailto:${companyDetails.email}`} className="hover:text-white font-medium">{companyDetails.email}</a>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 text-slate-400 pt-1 border-t border-white/10 text-[10px] lg:text-[12px]">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>GSTIN: {companyDetails.gstin}</span>
            </div>
          </div>
        </div>

        {/* Official Social Links with Real Brand Logos */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 lg:pt-6">
          <span className="text-[11px] lg:text-[14px] text-slate-300 font-bold">Connect With Us:</span>
          <div className="flex items-center gap-2.5 lg:gap-4">
            {/* WhatsApp */}
            <button
              onClick={onOpenWhatsApp}
              className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition shadow-md shadow-[#25D366]/20 active:scale-95"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={20} className="lg:scale-110" />
            </button>

            {/* Facebook */}
            <a
              href={companyDetails.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition shadow-md shadow-[#1877F2]/20 active:scale-95"
              aria-label="Facebook"
            >
              <FaFacebookF size={16} className="lg:scale-110" />
            </a>

            {/* Instagram */}
            <a
              href={companyDetails.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition shadow-md active:scale-95"
              aria-label="Instagram"
            >
              <FaInstagram size={17} className="lg:scale-110" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-[10px] lg:text-[13px] text-slate-500 pt-2 lg:pt-4 border-t border-white/5">
          © {new Date().getFullYear()} {companyDetails.companyName} ({companyDetails.brandName}). All Rights Reserved.
        </div>

      </div>
    </footer>
  );
};

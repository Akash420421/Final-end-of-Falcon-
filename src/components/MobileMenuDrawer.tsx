import React from 'react';
import { X, FileText, ChevronRight, Home, Info, Grid, Mail, Award, ShieldCheck, BookOpen } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { NavigationTab } from '../types';
import { useFalconStore } from '../context/StoreContext';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  activeTab: NavigationTab;
  onClose: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenWhatsApp: () => void;
  onOpenAdminPanel: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  activeTab,
  onClose,
  onSelectTab,
  onOpenWhatsApp,
  onOpenAdminPanel,
}) => {
  const { companyDetails, logoImageUrl, isAdminLoggedIn } = useFalconStore();

  if (!isOpen) return null;

  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'HOME', label: 'Home Page', icon: <Home className="w-4 h-4 text-[#E0183D]" /> },
    { id: 'ABOUT', label: 'About Falcon Electrics', icon: <Info className="w-4 h-4 text-[#E0183D]" /> },
    { id: 'PRODUCTS', label: 'Explore Products Range', icon: <Grid className="w-4 h-4 text-[#E0183D]" /> },
    { id: 'CATALOGUE', label: 'View Product Catalogue', icon: <BookOpen className="w-4 h-4 text-[#E0183D]" /> },
    { id: 'WHY_US', label: 'Why Partner With Us', icon: <Award className="w-4 h-4 text-[#E0183D]" /> },
    { id: 'CONTACT', label: 'Contact Us & Factory Location', icon: <Mail className="w-4 h-4 text-[#E0183D]" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-[#101124] text-white h-full p-5 shadow-2xl flex flex-col justify-between z-10 border-r border-white/10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center">
              <span className="text-[17px] font-black tracking-wider text-white">
                {companyDetails.brandName || 'FALCON ELECTRICS'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5 active:scale-95 transition"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {/* Admin Access Link (Only visible when authenticated) */}
            {isAdminLoggedIn && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminPanel();
                }}
                className="w-full text-left px-3 py-3 rounded-xl flex items-center justify-between text-[13px] font-bold bg-[#E0183D]/20 text-red-300 border border-[#E0183D]/40 hover:bg-[#E0183D]/30 transition mb-2"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#E0183D]" />
                  <span>Admin Control Panel</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400 opacity-80" />
              </button>
            )}

            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-3 rounded-xl flex items-center justify-between text-[13px] font-semibold transition ${
                    isActive
                      ? 'bg-[#E0183D] text-white'
                      : 'hover:bg-white/5 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Contact Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenWhatsApp();
            }}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
          >
            <FaWhatsapp size={18} />
            <span>WhatsApp Sales Line</span>
          </button>

          <div className="text-[10px] text-slate-400 text-center pt-2">
            GSTIN: {companyDetails.gstin}
          </div>
        </div>

      </div>
    </div>
  );
};

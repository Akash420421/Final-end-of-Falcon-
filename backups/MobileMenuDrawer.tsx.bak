import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Home, Info, Grid, Mail, Award, ShieldCheck, BookOpen } from 'lucide-react';
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
  const { companyDetails, isAdminLoggedIn } = useFalconStore();

  const menuItems: { id: NavigationTab; label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'HOME', label: 'Home Page', href: '/', icon: Home },
    { id: 'ABOUT', label: 'About Falcon Electrics', href: '/about', icon: Info },
    { id: 'PRODUCTS', label: 'Explore Products Range', href: '/products', icon: Grid },
    { id: 'CATALOGUE', label: 'View Product Catalogue', href: '/catalogue', icon: BookOpen },
    { id: 'WHY_US', label: 'Why Partner With Us', href: '/why-us', icon: Award },
    { id: 'CONTACT', label: 'Contact Us & Factory Location', href: '/contact', icon: Mail },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex pointer-events-auto" aria-modal="true" role="dialog">
          {/* Backdrop with refined cubic-bezier GPU fade transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'opacity', transform: 'translate3d(0, 0, 0)' }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel with 120fps GPU translate3d hardware acceleration */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
            className="relative w-4/5 max-w-xs bg-[#101124] text-white h-full p-5 shadow-2xl flex flex-col justify-between z-10 border-r border-white/10"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center">
                  <span className="text-[17px] font-black tracking-wider text-white">
                    {companyDetails.brandName || 'FALCON ELECTRICS'}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5 transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                {/* Admin Access Link (Only visible when authenticated) */}
                {isAdminLoggedIn && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onClose();
                      onOpenAdminPanel();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-[13px] font-bold bg-[#E0183D]/15 text-red-200 border border-[#E0183D]/40 hover:bg-[#E0183D]/25 transition-colors mb-2 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E0183D]/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#E0183D]" />
                      </div>
                      <span>Admin Control Panel</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-400 opacity-80 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                )}

                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <motion.a
                      key={item.id}
                      href={item.href}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`relative w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-[13px] font-semibold transition-colors group no-underline cursor-pointer ${
                        isActive
                          ? 'text-white font-bold'
                          : 'hover:bg-white/5 text-slate-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mobileActiveDrawerTabIndicator"
                          className="absolute inset-0 bg-[#E0183D] rounded-xl shadow-md -z-0"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                          style={{ willChange: 'transform' }}
                        />
                      )}
                      <div className="relative z-10 flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-white/5 text-[#E0183D] group-hover:bg-white/10'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#E0183D]'}`} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`relative z-10 w-4 h-4 transition-all ${
                          isActive ? 'text-white opacity-90' : 'opacity-50 text-slate-400 group-hover:translate-x-0.5 group-hover:opacity-80'
                        }`}
                      />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Bottom Contact Actions */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onOpenWhatsApp();
                }}
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors active:scale-98"
              >
                <FaWhatsapp size={18} />
                <span>WhatsApp Sales Line</span>
              </motion.button>

              <div className="text-[10px] text-slate-400 text-center pt-2">
                <span>GSTIN: {companyDetails.gstin}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

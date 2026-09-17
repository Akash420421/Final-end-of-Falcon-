import React from 'react';
import { ChevronDown } from 'lucide-react';
import { NavigationTab } from '../types';

interface NavigationRowProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenProductsDropdown?: () => void;
}

export const NavigationRow: React.FC<NavigationRowProps> = ({
  activeTab,
  onSelectTab,
  onOpenProductsDropdown,
}) => {
  const tabs: { id: NavigationTab; label: string; href: string; hasDropdown?: boolean }[] = [
    { id: 'HOME', label: 'Home', href: '/' },
    { id: 'ABOUT', label: 'About', href: '/about' },
    { id: 'PRODUCTS', label: 'Products', href: '/products', hasDropdown: true },
    { id: 'CONTACT', label: 'Contact', href: '/contact' },
    { id: 'WHY_US', label: 'Why Choose Us', href: '/why-us' },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="bg-[#101124] border-b border-white/10 px-2 pt-0.5 pb-0 w-full shadow-md lg:hidden overflow-x-auto no-scrollbar scroll-smooth">
      <div className="flex items-center justify-between min-w-max sm:min-w-0 sm:justify-around max-w-lg mx-auto gap-1 sm:gap-2 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <a
              key={tab.id}
              href={tab.href}
              onClick={(e) => {
                e.preventDefault();
                if (tab.hasDropdown && onOpenProductsDropdown) {
                  onOpenProductsDropdown();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`relative py-2.5 px-2 xs:px-2.5 text-[12px] xs:text-[13px] font-bold transition-colors flex items-center justify-center gap-0.5 whitespace-nowrap active:opacity-80 shrink-0 no-underline cursor-pointer ${
                isActive
                  ? 'text-[#E0183D]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.hasDropdown && <ChevronDown className="w-3 h-3 opacity-80 stroke-[2.5]" />}

              {/* Active Red Bottom Indicator Line */}
              {isActive && (
                <div className="absolute bottom-0 left-1 right-1 h-[2.5px] bg-[#E0183D] rounded-t-full shadow-[0_-2px_8px_rgba(224,24,61,0.6)]" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
};

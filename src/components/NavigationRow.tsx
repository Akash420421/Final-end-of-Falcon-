import React from 'react';
import { ChevronDown } from 'lucide-react';
import { NavigationTab } from '../types';

interface NavigationRowProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenProductsDropdown: () => void;
}

export const NavigationRow: React.FC<NavigationRowProps> = ({
  activeTab,
  onSelectTab,
  onOpenProductsDropdown,
}) => {
  const tabs: { id: NavigationTab; label: string; hasDropdown?: boolean }[] = [
    { id: 'HOME', label: 'Home' },
    { id: 'ABOUT', label: 'About' },
    { id: 'PRODUCTS', label: 'Products', hasDropdown: true },
    { id: 'WHY_US', label: 'Why Choose Us' },
    { id: 'CONTACT', label: 'Contact' },
  ];

  return (
    <nav className="bg-[#101124] border-b border-white/10 px-4 pt-1 pb-0 w-full shadow-md lg:hidden">
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.hasDropdown) {
                  onOpenProductsDropdown();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`relative py-2.5 lg:py-3 px-3 lg:px-4 text-[13px] lg:text-[14px] font-semibold transition-colors flex items-center gap-1 lg:gap-1.5 whitespace-nowrap active:opacity-80 hover:text-white ${
                isActive
                  ? 'text-[#E0183D]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.hasDropdown && <ChevronDown className="w-3.5 h-3.5 lg:w-4 lg:h-4 opacity-80 stroke-[2.5]" />}

              {/* Active Red Bottom Indicator Line */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] lg:h-[3px] bg-[#E0183D] rounded-t-full shadow-[0_-2px_8px_rgba(224,24,61,0.6)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

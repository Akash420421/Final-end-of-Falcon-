import React from 'react';
import {
  BookOpen,
  Image as ImageIcon,
  Building2,
  Package,
  Layers,
  Award,
  KeyRound,
  Database,
} from 'lucide-react';

export type AdminTabType =
  | 'CATALOGUE'
  | 'LOGOS'
  | 'COMPANY'
  | 'PRODUCTS'
  | 'CATEGORIES'
  | 'WHY_US'
  | 'SECURITY'
  | 'DATABASE';

interface AdminTabsNavProps {
  activeTab: AdminTabType;
  onSelectTab: (tab: AdminTabType) => void;
  catalogueCount: number;
  productsCount: number;
  categoriesCount: number;
  dbDiagnosticTested: boolean;
  dbTablesExist: boolean;
}

export const AdminTabsNav: React.FC<AdminTabsNavProps> = ({
  activeTab,
  onSelectTab,
  catalogueCount,
  productsCount,
  categoriesCount,
  dbDiagnosticTested,
  dbTablesExist,
}) => {
  const tabs: {
    id: AdminTabType;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      id: 'CATALOGUE',
      label: 'Product Catalogue',
      icon: <BookOpen className="w-3.5 h-3.5 text-amber-400" />,
      badge: `${catalogueCount} Pages`,
    },
    {
      id: 'LOGOS',
      label: 'Logos & Branding',
      icon: <ImageIcon className="w-3.5 h-3.5 text-[#E0183D]" />,
    },
    {
      id: 'COMPANY',
      label: 'Company & Contact',
      icon: <Building2 className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      id: 'PRODUCTS',
      label: 'Products Range',
      icon: <Package className="w-3.5 h-3.5 text-emerald-400" />,
      badge: productsCount,
    },
    {
      id: 'CATEGORIES',
      label: 'Categories',
      icon: <Layers className="w-3.5 h-3.5 text-purple-400" />,
      badge: categoriesCount,
    },
    {
      id: 'WHY_US',
      label: 'Why Partner With Us',
      icon: <Award className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'SECURITY',
      label: 'Admin Security',
      icon: <KeyRound className="w-3.5 h-3.5 text-rose-400" />,
    },
    {
      id: 'DATABASE',
      label: 'Cloud Sync & DB',
      icon: <Database className="w-3.5 h-3.5 text-cyan-400" />,
    },
  ];

  return (
    <div className="bg-slate-900/95 backdrop-blur-md px-3 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 sticky top-[57px] sm:top-[65px] z-30 shadow-md">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[38px] ${
              isActive
                ? 'bg-[#E0183D] text-white shadow-md ring-2 ring-[#E0183D]/50'
                : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {tab.badge}
              </span>
            )}
            {tab.id === 'DATABASE' && dbDiagnosticTested && (
              <span
                className={`w-2 h-2 rounded-full ${
                  dbTablesExist ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

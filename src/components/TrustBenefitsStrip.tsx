import React from 'react';
import { ShieldCheck, CheckCircle2, LayoutGrid, Headphones } from 'lucide-react';

export const TrustBenefitsStrip: React.FC = () => {
  const benefits = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#E0183D] shrink-0" />,
      title: 'Premium Quality',
      desc: 'Best materials',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-[#E0183D] shrink-0" />,
      title: 'Safe & Durable',
      desc: 'Tested for safety',
    },
    {
      icon: <LayoutGrid className="w-5 h-5 text-[#E0183D] shrink-0" />,
      title: 'Wide Range',
      desc: 'All your needs',
    },
    {
      icon: <Headphones className="w-5 h-5 text-[#E0183D] shrink-0" />,
      title: 'Fast Support',
      desc: 'We are here',
    },
  ];

  return (
    <div className="px-4 py-2 lg:py-6 lg:px-8 max-w-md lg:max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/90 shadow-sm lg:shadow-md p-3.5 lg:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {benefits.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 lg:gap-3.5">
            <div className="p-2 lg:p-3 rounded-xl lg:rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] lg:text-[15px] xl:text-[16px] font-bold text-[#171827] leading-tight">
                {item.title}
              </span>
              <span className="text-[10px] lg:text-[12px] xl:text-[13px] text-slate-500">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

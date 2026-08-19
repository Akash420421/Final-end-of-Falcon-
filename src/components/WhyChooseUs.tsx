import React from 'react';
import { Factory, ShieldCheck, Truck, BadgePercent, Wrench, Users, CheckCircle2 } from 'lucide-react';
import { useFalconStore } from '../context/StoreContext';

export const WhyChooseUs: React.FC = () => {
  const { companyDetails, whyChooseUs } = useFalconStore();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Factory':
        return <Factory className="w-5 h-5 text-[#E0183D]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#E0183D]" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-[#E0183D]" />;
      case 'BadgePercent':
        return <BadgePercent className="w-5 h-5 text-[#E0183D]" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-[#E0183D]" />;
      case 'Users':
        return <Users className="w-5 h-5 text-[#E0183D]" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#E0183D]" />;
    }
  };

  return (
    <section id="why-choose-us-section" className="py-6 lg:py-12 px-4 lg:px-8 max-w-md lg:max-w-7xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200/90 shadow-sm lg:shadow-md p-5 lg:p-10">
        <div className="flex items-center gap-1.5 text-[10px] lg:text-[12px] font-extrabold tracking-widest text-[#E0183D] uppercase mb-1 lg:mb-2">
          <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span>WHY CHOOSE US</span>
        </div>

        <h2 className="text-[19px] lg:text-[30px] xl:text-[34px] font-extrabold text-[#171827] leading-snug mb-2 lg:mb-3">
          Why Partner With {companyDetails?.brandName || 'Falcon Electrics'}
        </h2>

        <p className="text-[12px] lg:text-[15px] text-slate-600 leading-relaxed mb-4 lg:mb-8 max-w-2xl">
          From raw material sourcing to final product dispatch, every process is handled under one roof with stringent ISO quality benchmarks.
        </p>

        {/* 6 Core Feature Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
          {(whyChooseUs || []).map((item) => (
            <div
              key={item.id}
              className="p-3.5 lg:p-5 rounded-xl lg:rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-red-200 lg:hover:shadow-md transition flex items-start gap-3 lg:gap-4 group"
            >
              <div className="p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-white shadow-sm border border-slate-200/90 group-hover:bg-red-50 transition shrink-0">
                {getIcon(item.icon)}
              </div>

              <div>
                <h3 className="text-[13px] lg:text-[16px] font-bold text-[#171827] mb-0.5 lg:mb-1.5 group-hover:text-[#E0183D] transition">
                  {item.title}
                </h3>
                <p className="text-[11px] lg:text-[13px] text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

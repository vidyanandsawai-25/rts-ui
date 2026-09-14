'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface WingIntelligenceHeaderProps {
  totalWings?: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ApartmentWingHeader: React.FC<WingIntelligenceHeaderProps> = ({ totalWings, isExpanded, onToggle }) => {
  const t = useTranslations('ptisRedesign.wingIntelligence');

  return (
    <div className="flex justify-between items-center">
      <div 
        className="flex items-center gap-1 cursor-pointer select-none group" 
        onClick={onToggle}
      >
        <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wide">
          {t('wingIntelligence') || 'WING INTELLIGENCE'}
        </h2>
        <span className="text-[11px] text-slate-500 font-bold">
          {t('clickAnyWingToLoadComparison') || '(Click any wing to load comparison)'}
        </span>
        <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
          {isExpanded ? <ChevronDown size={16} strokeWidth={3} /> : <ChevronRight size={16} strokeWidth={3} />}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {isExpanded ? (
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
            <div className="flex items-center gap-1"><span className="text-[#10b981] font-black">{t('grades.aPlus') || 'A+'}</span> : {t('grades.excellent') || 'Excellent'} (90%+)</div>
            <div className="flex items-center gap-1"><span className="text-[#34d399] font-black">{t('grades.a') || 'A'}</span> : {t('grades.good') || 'Good'} (75-90%)</div>
            <div className="flex items-center gap-1"><span className="text-[#fbbf24] font-black">{t('grades.b') || 'B'}</span> : {t('grades.average') || 'Average'} (50-75%)</div>
            <div className="flex items-center gap-1"><span className="text-[#f97316] font-black">{t('grades.c') || 'C'}</span> : {t('grades.poor') || 'Poor'} (&lt;50%)</div>
          </div>
        ) : (
          <button 
            onClick={onToggle}
            className="flex items-center gap-2 border border-blue-200 bg-blue-50 text-blue-500 text-[10px] font-bold px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
          >
            <span>{t('clickToExpand', { count: totalWings || 0 }) || `Click to Expand (${totalWings} Wings)`}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ApartmentWingHeader;

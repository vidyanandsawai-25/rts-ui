'use client';
import React from 'react';
import { FileText, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StatBadgeProps, WingCardHeaderProps } from '@/types/property-tax/apartment';

const StatBadge: React.FC<StatBadgeProps> = ({ label, value, highlight }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-[8px] px-2 py-1 min-w-[3.5rem] shadow-sm">
      <span className="text-[13px] font-black text-[#132c66] leading-none mb-0.5">{value}</span>
      <span className={`text-[7px] font-extrabold uppercase tracking-wide ${highlight ? 'bg-emerald-500 text-white px-1 py-[1px] rounded-sm mt-0.5' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
};

export const ApartmentWingCardHeader: React.FC<WingCardHeaderProps> = ({
  letter,
  name,
  rating,
  blockName,
  stats,
  colorClass,
  onAmcClick,
  onEdit,
}) => {
  const t = useTranslations('ptisRedesign.wingIntelligence');

  return (
    <div className="bg-[#0b28aa] rounded-t-xl px-3 py-1.5 flex justify-between items-center text-white border-b-2 border-slate-200">
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-white text-lg shadow-inner shrink-0 ${colorClass}`}>
          {letter}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 
              className="font-extrabold text-[14px] leading-tight line-clamp-2 whitespace-normal break-words"
              title={name}
            >
              {name.length > 50 ? `${name.substring(0, 50)}...` : name}
            </h3>
            <div className="bg-[#fcd34d] text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm shrink-0">
              <span className="text-amber-600 tracking-tighter">{'★'}</span> {rating}
            </div>
            <div 
              className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/80 p-1.5 rounded-full cursor-pointer ml-1 transition-colors shrink-0"
              onClick={onEdit}
            >
              <Pencil size={10} className="text-blue-100" />
            </div>
          </div>
          <span className="text-xs font-bold text-blue-200 mt-0.5 truncate shrink-0" title={blockName}>{blockName}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5">
        <StatBadge label={t('floors') || 'FLOORS'} value={`${stats.floors}`}/>
        <StatBadge label={t('props') || 'PROPS'} value={stats.props} />
        <StatBadge label={t('areaSqFt') || 'AREA FT²'} value={stats.area.toLocaleString()} />
        <StatBadge label={t('selected') || 'SELECTED'} value={`${stats.collectedPct}%`} highlight />
        
        <div className="relative ml-2 cursor-pointer" onClick={onAmcClick}>
          <div className="bg-white/95 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
            <FileText size={18} strokeWidth={2} className="text-blue-600" />
          </div>
          <div className="absolute -bottom-1.5 -right-2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-[2px] rounded-full border-2 border-[#1440aa]">
            {t('amc') || 'AMC'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentWingCardHeader;

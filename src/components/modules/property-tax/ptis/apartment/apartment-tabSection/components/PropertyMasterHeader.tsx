'use client';

import React, { useState } from 'react';
import { Copy, Check, Pencil, Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PropertyMasterHeaderProps {
  propertyNo: string;
  upicId: string;
  societyName: string;
  onEdit?: () => void;
}

export const PropertyMasterHeader: React.FC<PropertyMasterHeaderProps> = ({
  propertyNo,
  upicId,
  societyName,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('appartmentQC');

  const handleCopyUpic = () => {
    if (!upicId || upicId === '-') return;
    navigator.clipboard.writeText(upicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-x-3 gap-y-0.5 border-b border-slate-100 pb-1 min-w-0">
      <div className="flex items-center gap-x-4 gap-y-1 text-xs sm:text-[13px] min-w-0 overflow-hidden flex-wrap">
        {/* PROPERTY NO */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-slate-400 font-bold text-xs">#</span>
          <span className="text-slate-600 font-bold text-xs">{t('header.propertyNo') || 'PROPERTY NO.:'}</span>
          <span className="font-black text-[#ef4444] text-[13px] tracking-tight">{propertyNo}</span>
        </div>

        {/* UPIC ID */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-blue-500 font-bold text-xs">#</span>
          <span className="text-slate-600 font-bold text-xs">{t('header.upicId') || 'UPIC ID:'}</span>
          <span className="font-black text-[#ef4444] text-[13px] tracking-tight">{upicId}</span>
          {upicId !== '-' && (
            <button
              type="button"
              onClick={handleCopyUpic}
              className="text-blue-500 hover:text-blue-700 transition-colors p-0.5 ml-0.5 cursor-pointer"
              title={t('header.copyUpic') || 'Copy UPIC'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* SOCIETY NAME */}
        <div className="flex items-center gap-1 min-w-0 max-w-[260px] sm:max-w-[360px] lg:max-w-[480px]">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-600 font-bold text-xs shrink-0">{t('header.societyName') || 'SOCIETY NAME:'}</span>
          <span className="font-black text-[#ef4444] text-[13px] tracking-tight truncate" title={societyName}>
            {societyName}
          </span>
        </div>
      </div>

      {/* Edit Action Button */}
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition-all shrink-0 cursor-pointer text-[11px] font-bold shadow-2xs active:scale-95"
        title={t('header.editSociety') || 'Edit Society Details'}
      >
        <Pencil className="w-3 h-3 text-blue-600" />
        <span>{t('header.editSociety') || 'Edit Society'}</span>
      </button>
    </div>
  );
};


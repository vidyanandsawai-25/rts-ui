/* eslint-disable i18next/no-literal-string */
'use client';

import React from 'react';
import { FileText, X } from 'lucide-react';

interface TaxRulesModalHeaderProps {
  onClose: () => void;
  apartmentName: string;
  wingName: string;
  unitNo: string;
  use: string;
  owner: string;
  baseValue: number;
}

export const TaxRulesModalHeader: React.FC<TaxRulesModalHeaderProps> = ({
  onClose,
  apartmentName,
  wingName,
  unitNo,
  use,
  owner,
  baseValue,
}) => {
  return (
    <div className="bg-[#181836] text-white px-6 py-4.5 border-b border-[#24214e] shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#24214e] border border-[#332f6b] flex items-center justify-center text-indigo-300 shadow-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide uppercase text-white leading-tight">
              TAX RULES & DISCOUNTS
            </h2>
            <p className="text-xs text-indigo-200/90 font-medium mt-0.5">
              {apartmentName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-[#24214e] hover:bg-[#332f6b] text-zinc-300 hover:text-white transition-all cursor-pointer border border-[#332f6b] flex items-center justify-center shadow-xs"
          title="Close modal"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Badges exactly matching screenshots */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[10px] font-bold">
        <div className="px-2.5 py-1 rounded bg-[#24214e] border border-[#332f6b] text-zinc-100 uppercase tracking-tight">
          APARTMENT: {apartmentName}
        </div>

        <div className="px-2.5 py-1 rounded bg-[#24214e] border border-[#332f6b] text-zinc-100 uppercase tracking-tight">
          WING: {wingName}
        </div>

        <div className="px-2.5 py-1 rounded bg-[#24214e] border border-[#332f6b] text-zinc-100 uppercase tracking-tight">
          UNIT: {unitNo}
        </div>

        <div className="px-2.5 py-1 rounded bg-[#24214e] border border-[#332f6b] text-zinc-100 uppercase tracking-tight">
          USE: {use}
        </div>

        <div className="px-2.5 py-1 rounded bg-[#24214e] border border-[#332f6b] text-zinc-100 uppercase tracking-tight">
          OWNER: {owner}
        </div>

        <div className="px-2.5 py-1 rounded bg-[#24214e] border border-[#332f6b] text-zinc-100 uppercase tracking-tight font-mono">
          BASE TAX: ₹{baseValue.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

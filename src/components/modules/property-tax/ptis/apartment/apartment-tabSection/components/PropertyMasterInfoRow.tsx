'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PropertyMasterInfoRowProps {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  minWidth?: string;
  valueClassName?: string;
  isMultiline?: boolean;
}

export const PropertyMasterInfoRow: React.FC<PropertyMasterInfoRowProps> = ({
  icon: Icon,
  label,
  value,
  minWidth = 'min-w-[125px]',
  valueClassName = 'font-bold text-[#1d4ed8] text-left truncate min-w-0',
  isMultiline = false,
}) => {
  const displayValue = value || '-';

  if (isMultiline) {
    return (
      <div className="flex items-start gap-1.5 min-w-0">
        <div className={`flex items-center gap-1 text-slate-600 font-semibold shrink-0 ${minWidth} h-[18px]`}>
          <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{label}</span>
        </div>
        <span
          className="font-bold text-[#1d4ed8] text-left text-[12px] leading-[18px] break-words flex-1 min-w-0"
          title={displayValue}
        >
          {displayValue}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className={`flex items-center gap-1 text-slate-600 font-semibold shrink-0 ${minWidth}`}>
        <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>{label}</span>
      </div>
      <span className={valueClassName} title={displayValue}>
        {displayValue}
      </span>
    </div>
  );
};

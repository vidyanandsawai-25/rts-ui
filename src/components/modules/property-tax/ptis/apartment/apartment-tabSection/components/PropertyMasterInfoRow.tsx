'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Tooltip } from '@/components/common/Tooltip';

interface PropertyMasterInfoRowProps {
  icon: LucideIcon;
  label: React.ReactNode;
  value?: React.ReactNode;
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
  const displayValue = value != null && value !== '' ? value : '-';
  const isString = typeof displayValue === 'string';
  const hasLongText = isString && displayValue !== '-' && displayValue.length > 20;

  if (isMultiline) {
    return (
      <div className="flex items-start gap-1.5 min-w-0">
        <div className={`flex items-start gap-1 text-slate-600 font-semibold shrink-0 ${minWidth} pt-[1px]`}>
          <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-[2px]" />
          <div className="flex flex-col leading-tight text-left min-w-0">{label}</div>
        </div>
        <div className="flex-1 min-w-0">
          {hasLongText ? (
            <Tooltip
              content={<div className="max-w-xs sm:max-w-md whitespace-normal break-words text-xs font-semibold leading-relaxed">{displayValue}</div>}
              placement="top"
            >
              <div
                className="font-bold text-[#1d4ed8] text-left text-[12px] leading-[18px] break-words cursor-pointer hover:underline line-clamp-2"
                title={displayValue}
              >
                {displayValue}
              </div>
            </Tooltip>
          ) : (
            <div
              className="font-bold text-[#1d4ed8] text-left text-[12px] leading-[18px] break-words"
              title={isString ? displayValue : undefined}
            >
              {displayValue}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1.5 min-w-0">
      <div className={`flex items-start gap-1 text-slate-600 font-semibold shrink-0 ${minWidth}`}>
        <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-[2px]" />
        <div className="flex flex-col leading-tight text-left min-w-0">{label}</div>
      </div>
      <div className="flex-1 min-w-0">
        {hasLongText ? (
          <Tooltip
            content={<div className="max-w-xs sm:max-w-md whitespace-normal break-words text-xs font-semibold leading-relaxed">{displayValue}</div>}
            placement="top"
          >
            <div
              className={`${valueClassName} leading-tight mt-[1px] cursor-pointer hover:underline`}
              title={displayValue}
            >
              {displayValue}
            </div>
          </Tooltip>
        ) : (
          <div className={`${valueClassName} leading-tight mt-[1px]`} title={isString ? displayValue : undefined}>
            {displayValue}
          </div>
        )}
      </div>
    </div>
  );
};


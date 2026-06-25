'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import FieldShell from '@/components/common/FieldShell';
import { ValueDisplay } from './components/ValueDisplay';
import type { DiscountData, PropertySocialDetailItem } from '@/types/ptis.types';
import { AlertCircle } from 'lucide-react';

export interface DiscountDataTabProps {
  initialData?: DiscountData;
  onDataChange?: (data: DiscountData) => void;
  readOnly?: boolean;
}

const DiscountDataTab: React.FC<DiscountDataTabProps> = ({ initialData }) => {
  const t = useTranslations('ptis');
  const items = (initialData?.items || []).filter((item) => item.isActive !== false);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm font-medium">{t('noDataAvailable') || 'No data available'}</p>
      </div>
    );
  }

  const isSimpleToggle = (item: PropertySocialDetailItem) => {
    return (
      item.dateValue === null &&
      item.intValue === null &&
      item.decimalValue === null &&
      item.textValue === null
    );
  };

  const getValueLabel = (item: PropertySocialDetailItem) => {
    if (item.dateValue !== null) return t('fields.dateLabel') || 'Date';
    if (item.intValue !== null) return t('fields.value') || 'Value';
    if (item.decimalValue !== null) return t('fields.value') || 'Value';
    if (item.textValue !== null) return t('fields.value') || 'Value';
    if (item.bitValue !== null || isSimpleToggle(item)) return t('fields.status') || 'Status';
    return t('fields.value') || 'Value';
  };

  const getValueDisplay = (item: PropertySocialDetailItem) => {
    if (item.dateValue !== null) {
      try {
        const date = new Date(item.dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch (_) {
        // Fallback to raw string
      }
      return item.dateValue;
    }
    if (item.intValue !== null) return String(item.intValue);
    if (item.decimalValue !== null) return String(item.decimalValue);
    if (item.textValue !== null) return item.textValue;
    if (item.bitValue !== null)
      return item.bitValue ? t('fields.yes') || 'Yes' : t('fields.no') || 'No';
    if (isSimpleToggle(item))
      return item.isActive ? t('fields.yes') || 'Yes' : t('fields.no') || 'No';
    return '-';
  };

  const renderCard = (item: PropertySocialDetailItem) => {
    const valueLabel = getValueLabel(item);
    const valueDisplay = getValueDisplay(item);

    return (
      <FieldShell
        key={item.id}
        className="relative transition-all hover:shadow-md min-w-0"
        label={item.socialAttributeName}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-xs text-blue-800 shrink-0 select-none">{valueLabel}</span>
          <div className="w-[40%] min-w-0">
            <ValueDisplay value={valueDisplay} />
          </div>
        </div>
      </FieldShell>
    );
  };

  return (
    <div className="max-h-[122px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mt-1 mb-1 ml-1">
        {items.map(renderCard)}
      </div>
    </div>
  );
};

export default DiscountDataTab;

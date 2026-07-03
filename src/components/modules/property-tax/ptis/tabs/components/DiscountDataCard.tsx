import React from 'react';
import { useTranslations } from 'next-intl';
import { ToggleSwitch } from '@/components/common';
import FieldShell from '@/components/common/FieldShell';
import { ValueDisplay } from './ValueDisplay';
import type { PropertySocialDetailItem } from '@/types/ptis.types';
import { Loader2, Eye } from 'lucide-react';

export interface DiscountDataCardProps {
  item: PropertySocialDetailItem;
  activeSubTab: 'discount' | 'social';
  activeViewingGuid: string | null;
  onViewDocument: (item: PropertySocialDetailItem) => void;
}

const isSimpleToggle = (item: PropertySocialDetailItem) => {
  return (
    item.dateValue === null &&
    item.intValue === null &&
    item.decimalValue === null &&
    item.textValue === null
  );
};

export const DiscountDataCard: React.FC<DiscountDataCardProps> = ({
  item,
  activeSubTab,
  activeViewingGuid,
  onViewDocument,
}) => {
  const t = useTranslations('ptis');

  const getValueDisplay = (it: PropertySocialDetailItem) => {
    if (it.dateValue !== null) {
      try {
        const date = new Date(it.dateValue);
        if (!isNaN(date.getTime())) return date.toLocaleDateString();
      } catch (_) {}
      return it.dateValue;
    }
    if (it.intValue !== null) return String(it.intValue);
    if (it.decimalValue !== null) return String(it.decimalValue);
    if (it.textValue !== null) return it.textValue;
    if (it.bitValue !== null) return it.bitValue ? t('fields.yes') || 'Yes' : t('fields.no') || 'No';
    if (isSimpleToggle(it)) return it.isActive ? t('fields.yes') || 'Yes' : t('fields.no') || 'No';
    return '-';
  };

  const valueDisplay = getValueDisplay(item);
  const isToggle = isSimpleToggle(item);

  const renderActionButtons = () => (
    <>
      <div className="flex items-center" data-testid="discount-toggle">
        <ToggleSwitch checked={true} onChange={() => {}} disabled={true} showPopup={false} />
      </div>
      {item.documentGuid && (
        <button
          type="button"
          disabled={activeViewingGuid !== null}
          onClick={(e) => {
            e.stopPropagation();
            onViewDocument(item);
          }}
          className="p-1 rounded hover:bg-blue-200 text-blue-800 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent disabled:opacity-50 h-6 w-6"
          title={t('actions.viewDocument') || 'View Document'}
        >
          {activeViewingGuid === item.documentGuid ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </>
  );

  return (
    <FieldShell
      className="relative transition-all hover:shadow-md min-w-0 h-full flex flex-col justify-center"
      label={
        activeSubTab === 'social' ? null : (
          <div className="flex items-center gap-1.5 min-w-0 w-full pr-14">
            <span className="truncate font-semibold text-sm" title={item.socialAttributeName}>
              {item.socialAttributeName}
            </span>
            {!isToggle && valueDisplay && (
              <span className="font-extrabold text-blue-950 text-sm ml-1 shrink-0">
                {valueDisplay}
              </span>
            )}
          </div>
        )
      }
    >
      {activeSubTab === 'social' ? (
        <div className="flex items-center justify-between gap-1 w-full h-full min-w-0 px-1">
          <span className="text-sm text-blue-800 font-medium truncate flex-1" title={item.socialAttributeName}>
            {item.socialAttributeName}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {!isToggle && (
              <div className="w-16 shrink-0 mr-1">
                <ValueDisplay value={valueDisplay} className="h-5 text-xs px-1 border-blue-200 w-full bg-white" />
              </div>
            )}
            {renderActionButtons()}
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col justify-end">
          <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
            {renderActionButtons()}
          </div>
          <div className="flex items-center justify-center gap-3 mt-2 min-w-0 w-full">
            {activeSubTab === 'discount' && (
              <>
                <div className="flex items-center gap-1 min-w-0 w-auto">
                  <span className="text-xs text-blue-800 truncate min-w-0 select-none font-medium">
                    {t('fields.percentage') || 'Percentage'}
                  </span>
                  <div className="w-12 shrink-0">
                    <ValueDisplay
                      role="presentation"
                      value={item.percentage !== null && item.percentage !== undefined ? `${item.percentage}%` : ''}
                      className="h-5 text-xs px-1 font-bold text-slate-700 border-slate-300 w-full"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 min-w-0 w-auto shrink">
                  <span className="text-xs text-blue-800 shrink truncate min-w-0 select-none font-medium">
                    {t('fields.amount') || 'Amount'}
                  </span>
                  <div className="w-18 shrink-0">
                    <ValueDisplay
                      role="presentation"
                      value={item.amount !== null && item.amount !== undefined ? String(item.amount) : ''}
                      className="h-5 text-xs px-1 font-bold text-slate-700 border-slate-300 w-full"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </FieldShell>
  );
};

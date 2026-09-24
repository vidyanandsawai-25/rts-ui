'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/common/ActionButton';
import {
  MapPin,
  Layers,
  Receipt,
  History,
  Loader2,
} from 'lucide-react';

export interface IndividualOldToolbarProps {
  effectiveShowMap: boolean;
  effectiveShowFloor: boolean;
  effectiveShowTax: boolean;
  isLoadingMapped?: boolean;
  isLoadingFloors?: boolean;
  isLoadingTaxes?: boolean;
  onToggleMapDetails: () => void;
  onToggleFloorDetails: () => void;
  onToggleOldTax: () => void;
}

export const IndividualOldToolbar: React.FC<IndividualOldToolbarProps> = ({
  effectiveShowMap,
  effectiveShowFloor,
  effectiveShowTax,
  isLoadingMapped = false,
  isLoadingFloors = false,
  isLoadingTaxes = false,
  onToggleMapDetails,
  onToggleFloorDetails,
  onToggleOldTax,
}) => {
  const t = useTranslations('ptis');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 px-0.5">
      <div className="flex items-center gap-1.5 text-slate-500">
        <History className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          {t('historicalRecords') || 'Historical Records & Breakdowns'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="xs"
          variant={effectiveShowMap ? 'primary' : 'secondary'}
          icon={isLoadingMapped ? Loader2 : MapPin}
          onClick={onToggleMapDetails}
          className={
            effectiveShowMap
              ? 'bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300'
          }
        >
          {effectiveShowMap ? t('actions.hideMapDetails') : t('actions.showMapDetails')}
        </Button>

        <Button
          size="xs"
          variant={effectiveShowFloor ? 'primary' : 'secondary'}
          icon={isLoadingFloors ? Loader2 : Layers}
          onClick={onToggleFloorDetails}
          className={
            effectiveShowFloor
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300'
          }
        >
          {effectiveShowFloor ? t('actions.hideFloorDetails') : t('actions.showFloorDetails')}
        </Button>

        <Button
          size="xs"
          variant={effectiveShowTax ? 'primary' : 'secondary'}
          icon={isLoadingTaxes ? Loader2 : Receipt}
          onClick={onToggleOldTax}
          className={
            effectiveShowTax
              ? 'bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300'
          }
        >
          {effectiveShowTax ? t('actions.hideOldTax') : t('actions.showOldTax')}
        </Button>
      </div>
    </div>
  );
};

export default IndividualOldToolbar;

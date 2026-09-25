'use client';

import React, { memo, useMemo } from 'react';
import {
  MapPin,
  Landmark,
  Crosshair,
  FileSpreadsheet,
  Grid,
  Hash,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import { PropertyMasterInfoRow } from '@/components/modules/property-tax/ptis/apartment/apartment-tabSection/components/PropertyMasterInfoRow';
import { formatAadharNumber } from '@/lib/utils/format';

export interface IndividualMasterPropertyColumnProps {
  data?: IndividualPropertyMasterData;
}

export const IndividualMasterPropertyColumn: React.FC<IndividualMasterPropertyColumnProps> = memo(({ data }) => {
  const t = useTranslations('individual');

  const aadharValue = useMemo(() => {
    if (data?.aadharNo) {
      return formatAadharNumber(data.aadharNo);
    }
    if (data?.aadharWithTitle && data.aadharWithTitle !== '-') {
      const cleaned = data.aadharWithTitle.includes('/')
        ? data.aadharWithTitle.split('/')[0].trim()
        : data.aadharWithTitle.trim();
      if (/\d/.test(cleaned)) {
        return formatAadharNumber(cleaned);
      }
    }
    return '-';
  }, [data?.aadharNo, data?.aadharWithTitle]);

  return (
    <div className="flex flex-col gap-1 md:border-r md:border-slate-100 md:pr-2.5 min-w-0 overflow-hidden">
      <PropertyMasterInfoRow
        icon={MapPin}
        label={t('grid.division') || 'Division'}
        value={data?.division || '-'}
        minWidth="min-w-[110px]"
      />
      <PropertyMasterInfoRow
        icon={Landmark}
        label={t('grid.moujaName') || 'Mouja Name'}
        value={data?.moujaName || '-'}
        minWidth="min-w-[110px]"
      />
      <PropertyMasterInfoRow
        icon={Crosshair}
        label={t('grid.surveyNo') || 'Survey No.'}
        value={data?.surveyNo || '-'}
        minWidth="min-w-[110px]"
      />
      <PropertyMasterInfoRow
        icon={FileSpreadsheet}
        label={t('grid.taxZone') || 'Tax Zone'}
        value={data?.taxZoneAndName || data?.taxZone || '-'}
        minWidth="min-w-[110px]"
      />
      <PropertyMasterInfoRow
        icon={Grid}
        label={t('grid.plotNo') || 'Plot No.'}
        value={data?.plotNo || '-'}
        minWidth="min-w-[110px]"
      />
      <PropertyMasterInfoRow
        icon={Hash}
        label={t('grid.aadhar') || t('grid.aadharTitle') || 'Aadhar'}
        value={aadharValue}
        minWidth="min-w-[110px]"
      />
    </div>
  );
});

IndividualMasterPropertyColumn.displayName = 'IndividualMasterPropertyColumn';

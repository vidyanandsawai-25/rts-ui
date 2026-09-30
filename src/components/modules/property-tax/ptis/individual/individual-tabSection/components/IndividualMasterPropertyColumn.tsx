'use client';

import React, { memo, useMemo } from 'react';
import { MapPin, Compass, Landmark, Crosshair, FileSpreadsheet, Grid } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import { PropertyMasterInfoRow } from '@/components/modules/property-tax/ptis/apartment/apartment-tabSection/components/PropertyMasterInfoRow';

export interface IndividualMasterPropertyColumnProps {
  data?: IndividualPropertyMasterData;
}

export const IndividualMasterPropertyColumn: React.FC<IndividualMasterPropertyColumnProps> = memo(
  ({ data }) => {
    const t = useTranslations('individual');

    const taxZoneDisplay = useMemo(() => {
      if (data?.taxZoneAndName && data.taxZoneAndName !== '-') {
        return data.taxZoneAndName;
      }
      if (data?.taxZone && data.taxZone !== '-') {
        return data.taxZone;
      }
      if (data?.taxZoneNo || data?.rateSectionName) {
        const parts = [
          data.taxZoneNo ? `Zone ${data.taxZoneNo}` : '',
          data.rateSectionName ? data.rateSectionName : '',
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(' - ') : '-';
      }
      return '-';
    }, [data?.taxZoneAndName, data?.taxZone, data?.taxZoneNo, data?.rateSectionName]);

    const plotOrUnitDisplay = useMemo(() => {
      if (data?.flatOrShopNo && data?.plotNo && data.plotNo !== '-') {
        return `${data.plotNo} (Unit: ${data.flatOrShopNo})`;
      }
      return data?.plotNo || data?.flatOrShopNo || '-';
    }, [data?.plotNo, data?.flatOrShopNo]);

    const subZoneDisplay: string = useMemo(() => {
      const sz = data?.subZoneNo || data?.subZone;
      return typeof sz === 'string' && sz ? sz : '-';
    }, [data?.subZoneNo, data?.subZone]);

    return (
      <div className="flex flex-col gap-1 md:border-r md:border-slate-100 md:pr-2.5 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow
          icon={MapPin}
          label={t('grid.division') || 'Division'}
          value={data?.division || '-'}
          minWidth="min-w-[115px]"
        />
        <PropertyMasterInfoRow
          icon={Compass}
          label={t('grid.subZoneNo') || 'Sub Zone No.'}
          value={subZoneDisplay}
          minWidth="min-w-[115px]"
        />
        <PropertyMasterInfoRow
          icon={Landmark}
          label={t('grid.moujaName') || 'Mouja Name'}
          value={data?.moujaName || '-'}
          minWidth="min-w-[115px]"
        />
        <PropertyMasterInfoRow
          icon={Crosshair}
          label={t('grid.surveyNo') || 'Survey No.'}
          value={data?.surveyNo || '-'}
          minWidth="min-w-[115px]"
        />
        <PropertyMasterInfoRow
          icon={FileSpreadsheet}
          label={t('grid.taxZone') || 'Tax Zone'}
          value={taxZoneDisplay}
          minWidth="min-w-[115px]"
        />
        <PropertyMasterInfoRow
          icon={Grid}
          label={t('grid.plotNo') || 'Plot No.'}
          value={plotOrUnitDisplay}
          minWidth="min-w-[115px]"
        />
      </div>
    );
  }
);

IndividualMasterPropertyColumn.displayName = 'IndividualMasterPropertyColumn';

'use client';

import React, { memo, useMemo } from 'react';
import { Phone, AtSign, Home, Paperclip, Maximize2, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import { PropertyMasterInfoRow } from '@/components/modules/property-tax/ptis/apartment/apartment-tabSection/components/PropertyMasterInfoRow';

export interface IndividualMasterContactColumnProps {
  data?: IndividualPropertyMasterData;
}

export const IndividualMasterContactColumn: React.FC<IndividualMasterContactColumnProps> = memo(
  ({ data }) => {
    const t = useTranslations('individual');

    const addressNode = useMemo(() => {
      const enAddr = data?.addressEnglish;
      const regAddr = data?.addressRegional;
      if (enAddr && regAddr && enAddr !== regAddr) {
        return (
          <div className="flex flex-col min-w-0" title={`${enAddr} | ${regAddr}`}>
            <span className="text-[12px] leading-[15px] text-[#1d4ed8] font-bold truncate pt-[0.5px]">{enAddr}</span>
            <span className="text-[10px] leading-[13px] text-slate-500 font-medium truncate pt-[0.5px]">{regAddr}</span>
          </div>
        );
      }
      return data?.address || data?.societyAddress || '-';
    }, [data?.addressEnglish, data?.addressRegional, data?.address, data?.societyAddress]);

    const carpetAreaNode = useMemo(() => {
      const current = data?.carpetAreaFtMtr || '-';
      const old = data?.oldCarpetAreaFtMtr;
      if (old && old !== '-' && old !== current) {
        return (
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span>{current}</span>
            <span
              className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1 py-0 rounded border border-amber-200 shrink-0 leading-tight"
              title={t('grid.oldAssessment', { value: old })}
            >
              {t('grid.oldBadge', { value: old })}
            </span>
          </div>
        );
      }
      return current;
    }, [data?.carpetAreaFtMtr, data?.oldCarpetAreaFtMtr, t]);

    const builtUpAreaNode = useMemo(() => {
      const current = data?.builtUpAreaFtMtr || '-';
      const old = data?.oldBuiltUpAreaFtMtr;
      if (old && old !== '-' && old !== current) {
        return (
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span>{current}</span>
            <span
              className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1 py-0 rounded border border-amber-200 shrink-0 leading-tight"
              title={t('grid.oldAssessment', { value: old })}
            >
              {t('grid.oldBadge', { value: old })}
            </span>
          </div>
        );
      }
      return current;
    }, [data?.builtUpAreaFtMtr, data?.oldBuiltUpAreaFtMtr, t]);

    const altMobileDisplay =
      data?.alternateMobileNo && data.alternateMobileNo !== '-'
        ? data.alternateMobileNo
        : data?.altMobileNo && data.altMobileNo !== '-'
          ? data.altMobileNo
          : '-';

    return (
      <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow
          icon={Phone}
          label={t('grid.mobileNo') || 'Mobile No.'}
          value={data?.mobileNo || '-'}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow
          icon={Phone}
          label={t('grid.altMobileNo') || 'Alt Mobile No.'}
          value={altMobileDisplay}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow
          icon={AtSign}
          label={t('grid.emailId') || 'Email ID'}
          value={data?.emailId || '-'}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow
          icon={Home}
          label={t('grid.address') || 'Address'}
          value={addressNode}
          minWidth="min-w-[130px]"
          isMultiline
        />
        <PropertyMasterInfoRow
          icon={Paperclip}
          label={t('grid.plotAreaFtMtr') || 'Plot Area (sqft/sq mtr)'}
          value={data?.plotAreaFtMtr || '-'}
          minWidth="min-w-[155px]"
        />
        <PropertyMasterInfoRow
          icon={Maximize2}
          label={t('grid.carpetAreaFtMtr') || 'Carpet Area (sqft/sq mtr)'}
          value={carpetAreaNode}
          minWidth="min-w-[155px]"
        />
        <PropertyMasterInfoRow
          icon={Layers}
          label={t('grid.builtUpAreaFtMtr') || 'Built-Up Area (sqft/sq mtr)'}
          value={builtUpAreaNode}
          minWidth="min-w-[155px]"
        />
      </div>
    );
  }
);

IndividualMasterContactColumn.displayName = 'IndividualMasterContactColumn';

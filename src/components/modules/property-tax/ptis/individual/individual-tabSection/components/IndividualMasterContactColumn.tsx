'use client';

import React, { memo, useMemo } from 'react';
import { Phone, AtSign, Home, Paperclip, Maximize2, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import { PropertyMasterInfoRow } from '@/components/modules/property-tax/ptis/apartment/apartment-tabSection/components/PropertyMasterInfoRow';

export interface IndividualMasterContactColumnProps {
  data?: IndividualPropertyMasterData;
}

function sanitizeAreaString(val?: string | null): string {
  if (!val || val === '-') return '-';
  return val.replace(/(\d+\.\d{3,})/g, (match) => {
    const num = parseFloat(match);
    return isNaN(num) ? match : num.toFixed(2);
  });
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
      const current = sanitizeAreaString(data?.carpetAreaFtMtr);
      const old = sanitizeAreaString(data?.oldCarpetAreaFtMtr);
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
      const current = sanitizeAreaString(data?.builtUpAreaFtMtr);
      const old = sanitizeAreaString(data?.oldBuiltUpAreaFtMtr);
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
          minWidth="min-w-[65px] lg:min-w-[70px] xl:min-w-[80px] 2xl:min-w-[105px]"
        />
        <PropertyMasterInfoRow
          icon={Phone}
          label={t('grid.altMobileNo') || 'Alt Mobile No.'}
          value={altMobileDisplay}
          minWidth="min-w-[65px] lg:min-w-[70px] xl:min-w-[80px] 2xl:min-w-[105px]"
        />
        <PropertyMasterInfoRow
          icon={AtSign}
          label={t('grid.emailId') || 'Email ID'}
          value={data?.emailId || '-'}
          minWidth="min-w-[65px] lg:min-w-[70px] xl:min-w-[80px] 2xl:min-w-[105px]"
        />
        <PropertyMasterInfoRow
          icon={Home}
          label={t('grid.address') || 'Address'}
          value={addressNode}
          minWidth="min-w-[65px] lg:min-w-[70px] xl:min-w-[80px] 2xl:min-w-[105px]"
          isMultiline
        />
        <PropertyMasterInfoRow
          icon={Paperclip}
          label={t('grid.plotAreaFtMtr') || 'Plot Area (sqft/sq mtr)'}
          value={sanitizeAreaString(data?.plotAreaFtMtr)}
          minWidth="min-w-[85px] lg:min-w-[95px] xl:min-w-[110px] 2xl:min-w-[140px]"
        />
        <PropertyMasterInfoRow
          icon={Maximize2}
          label={t('grid.carpetAreaFtMtr') || 'Carpet Area (sqft/sq mtr)'}
          value={carpetAreaNode}
          minWidth="min-w-[85px] lg:min-w-[95px] xl:min-w-[110px] 2xl:min-w-[140px]"
        />
        <PropertyMasterInfoRow
          icon={Layers}
          label={t('grid.builtUpAreaFtMtr') || 'Built-Up Area (sqft/sq mtr)'}
          value={builtUpAreaNode}
          minWidth="min-w-[85px] lg:min-w-[95px] xl:min-w-[110px] 2xl:min-w-[140px]"
        />
      </div>
    );
  }
);

IndividualMasterContactColumn.displayName = 'IndividualMasterContactColumn';

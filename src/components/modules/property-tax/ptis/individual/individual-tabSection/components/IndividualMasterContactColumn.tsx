'use client';

import React, { memo } from 'react';
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

    return (
      <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow
          icon={Phone}
          label={t('grid.mobileNo') || 'Mobile No.'}
          value={data?.mobileNo || '-'}
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
          value={data?.societyAddress || data?.address || '-'}
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
          value={data?.carpetAreaFtMtr || '-'}
          minWidth="min-w-[155px]"
        />
        <PropertyMasterInfoRow
          icon={Layers}
          label={t('grid.builtUpAreaFtMtr') || 'Built-Up Area (sqft/sq mtr)'}
          value={data?.builtUpAreaFtMtr || '-'}
          minWidth="min-w-[155px]"
        />
      </div>
    );
  }
);

IndividualMasterContactColumn.displayName = 'IndividualMasterContactColumn';

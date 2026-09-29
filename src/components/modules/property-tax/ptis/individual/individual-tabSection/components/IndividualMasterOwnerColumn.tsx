'use client';

import React, { memo } from 'react';
import { User, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import { PropertyMasterInfoRow } from '@/components/modules/property-tax/ptis/apartment/apartment-tabSection/components/PropertyMasterInfoRow';

export interface IndividualMasterOwnerColumnProps {
  data?: IndividualPropertyMasterData;
}

export const IndividualMasterOwnerColumn: React.FC<IndividualMasterOwnerColumnProps> = memo(({ data }) => {
  const t = useTranslations('individual');

  return (
    <div className="flex flex-col gap-1 md:border-r md:border-slate-100 md:pr-2.5 min-w-0 overflow-hidden">
      <PropertyMasterInfoRow
        icon={User}
        label={t('grid.owner') || 'Owner'}
        value={data?.owner || data?.ownerName || '-'}
        minWidth="min-w-[125px]"
      />
      <PropertyMasterInfoRow
        icon={User}
        label={t('grid.propertyHolder') || 'Property Holder'}
        value={data?.propertyHolder || data?.ownerName || '-'}
        minWidth="min-w-[125px]"
      />
      <PropertyMasterInfoRow
        icon={User}
        label={t('grid.holderRegional') || 'Holder (Regional)'}
        value={data?.ownerNameRegional || data?.holderRegional || '-'}
        minWidth="min-w-[125px]"
      />
      <PropertyMasterInfoRow
        icon={User}
        label={t('grid.occupierName') || 'Occupier Name'}
        value={data?.occupierName || '-'}
        minWidth="min-w-[125px]"
      />
      <PropertyMasterInfoRow
        icon={User}
        label={t('grid.occupierRegional') || 'Occupier (Regional)'}
        value={data?.occupierNameRegional || data?.occupierRegional || '-'}
        minWidth="min-w-[125px]"
      />
      <PropertyMasterInfoRow
        icon={Tag}
        label={t('grid.ownerCategory') || 'Owner Category'}
        value={data?.ownerCategory || '-'}
        minWidth="min-w-[125px]"
      />
      <PropertyMasterInfoRow
        icon={Tag}
        label={t('grid.propertyCategory') || 'Property Category'}
        value={(data?.category || data?.propertyCategory || '-') as string}
        minWidth="min-w-[125px]"
      />
    </div>
  );
});

IndividualMasterOwnerColumn.displayName = 'IndividualMasterOwnerColumn';

'use client';

import React, { memo } from 'react';
import {
  User,
  Tag,
  MapPin,
  Landmark,
  Crosshair,
  FileSpreadsheet,
  Grid,
  Hash,
  Phone,
  AtSign,
  Home,
  Paperclip,
  Maximize2,
  Layers,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import { PropertyMasterInfoRow } from '@/components/modules/property-tax/ptis/apartment/apartment-tabSection/components/PropertyMasterInfoRow';

interface IndividualMasterDetailsGridProps {
  data?: IndividualPropertyMasterData;
}

/**
 * Pure presentational 3-column grid for Individual Property Master details.
 * Consumes pre-normalized domain values directly from SSOT without duplicate fallback logic.
 */
export const IndividualMasterDetailsGrid: React.FC<IndividualMasterDetailsGridProps> = memo(({ data }) => {
  const t = useTranslations('individual');

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.3fr] xl:grid-cols-[1.1fr_1.1fr_1.4fr] gap-x-3 lg:gap-x-4 gap-y-1 text-[12px] pt-0.5 min-w-0">
      {/* COLUMN 1: Owner & Holder Details */}
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
          value={data?.holderRegional || '-'}
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
          value={data?.occupierRegional || '-'}
          minWidth="min-w-[125px]"
        />
        <PropertyMasterInfoRow
          icon={Tag}
          label={t('grid.ownerCategory') || 'Owner Category'}
          value={data?.ownerCategory || '-'}
          minWidth="min-w-[125px]"
        />
      </div>

      {/* COLUMN 2: Property & Zone Identifiers */}
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
          label={t('grid.aadharTitle') || 'Aadhar / Title'}
          value={data?.aadharWithTitle || data?.aadharNo || '-'}
          minWidth="min-w-[110px]"
        />
      </div>

      {/* COLUMN 3: Contact & Area Dimensions */}
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
          label={t('grid.societyAddress') || 'Society Address'}
          value={data?.societyAddress || data?.address || '-'}
          minWidth="min-w-[130px]"
          isMultiline
        />
        <PropertyMasterInfoRow
          icon={Paperclip}
          label={t('grid.plotAreaFtMtr') || 'Plot Area (Ft/Mtr)'}
          value={data?.plotAreaFtMtr || '-'}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow
          icon={Maximize2}
          label={t('grid.carpetAreaFtMtr') || 'Carpet Area (Ft/Mtr)'}
          value={data?.carpetAreaFtMtr || '-'}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow
          icon={Layers}
          label={t('grid.builtUpAreaFtMtr') || 'Built-Up Area (Ft/Mtr)'}
          value={data?.builtUpAreaFtMtr || '-'}
          minWidth="min-w-[130px]"
        />
      </div>
    </div>
  );
});

IndividualMasterDetailsGrid.displayName = 'IndividualMasterDetailsGrid';

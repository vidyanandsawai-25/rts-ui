'use client';

import React from 'react';
import {
  MapPin,
  Landmark,
  Tag,
  FileSpreadsheet,
  Crosshair,
  Grid,
  User,
  Building2,
  Mail,
  Phone,
  Home,
  Ruler,
  Maximize2,
  History,
  Layers,
  Clock,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PropertyMasterData } from '@/types/property-tax/apartment';
import { PropertyMasterInfoRow } from './PropertyMasterInfoRow';

interface PropertyMasterDetailsGridProps {
  data?: PropertyMasterData;
}

export const PropertyMasterDetailsGrid: React.FC<PropertyMasterDetailsGridProps> = ({ data }) => {
  const t = useTranslations('appartmentQC');

  return (
    <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.25fr_1.9fr] xl:grid-cols-[0.8fr_1.2fr_2.0fr] gap-x-3.5 lg:gap-x-5 gap-y-1 text-[12px] pt-0.5 min-w-0">
      {/* SECTION 1: General & Location Info */}
      <div className="flex flex-col gap-1 md:border-r md:border-slate-100 md:pr-3 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow icon={MapPin} label={t('grid.division') || 'Division:'} value={data?.division} minWidth="min-w-[125px]" />
        <PropertyMasterInfoRow icon={Landmark} label={t('grid.wardNo') || 'Ward No.:'} value={data?.wardNo} minWidth="min-w-[125px]" />
        <PropertyMasterInfoRow icon={Tag} label={t('grid.category') || 'Category:'} value={data?.category} minWidth="min-w-[125px]" />
        <PropertyMasterInfoRow
          icon={FileSpreadsheet}
          label={t('grid.taxZoneAndName') || 'Tax Zone & Name:'}
          value={data?.taxZoneAndName || data?.taxZone}
          minWidth="min-w-[125px]"
        />
        <PropertyMasterInfoRow icon={Crosshair} label={t('grid.subZoneCsn') || 'Sub Zone & CSN:'} value={data?.subZoneCsnNo} minWidth="min-w-[125px]" />
        <PropertyMasterInfoRow icon={Grid} label={t('grid.plotNo') || 'Plot No.:'} value={data?.plotNo} minWidth="min-w-[125px]" />
      </div>

      {/* SECTION 2: Ownership & Management */}
      <div className="flex flex-col gap-1 md:border-r md:border-slate-100 md:pr-3 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow
          icon={User}
          label={t('grid.landOwnerName') || 'Land Owner Name:'}
          value={data?.landOwnerName || data?.owner}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow icon={Building2} label={t('grid.builderName') || 'Builder Name:'} value={data?.builderName} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow icon={Mail} label={t('grid.societyEmail') || 'Society Email:'} value={data?.societyEmail} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow icon={User} label={t('grid.secretaryName') || 'Secretary Name:'} value={data?.secretaryName} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow
          icon={Phone}
          label={t('grid.secretaryMobile') || 'Secretary Mobile:'}
          value={data?.secretaryMobileNo}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow icon={Mail} label={t('grid.secretaryEmail') || 'Secretary Email:'} value={data?.secretaryEmail} minWidth="min-w-[130px]" />
      </div>

      {/* SECTION 3: Society Address & Property Metrics */}
      <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow
          icon={Home}
          label={t('grid.address') || 'Address:'}
          value={data?.societyAddress || data?.address}
          minWidth="min-w-[130px]"
          isMultiline
        />
        <PropertyMasterInfoRow icon={Ruler} label={t('grid.plotArea') || 'Plot Area:'} value={data?.plotArea} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow
          icon={Maximize2}
          label={t('grid.carpetBuiltUp') || 'Carpet / Built-up:'}
          value={data?.carpetBuiltUpArea}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow
          icon={History}
          label={t('grid.oldCarpetBuiltUp') || 'Old Carpet/Built-up:'}
          value={data?.oldCarpetBuiltUp || data?.carpetBuiltUpArea}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow icon={Layers} label={t('grid.totalFloors') || 'Total Floors:'} value={data?.totalFloors} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow
          icon={Clock}
          label={t('grid.totalProperties') || 'Total Properties:'}
          value={data?.totalPropertiesResCommAmen}
          minWidth="min-w-[130px]"
        />
      </div>
    </div>
  );
};


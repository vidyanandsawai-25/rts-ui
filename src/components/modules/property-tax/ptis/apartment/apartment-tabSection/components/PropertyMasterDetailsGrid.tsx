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
  const rawResCommAmen = t('grid.resCommAmen');
  const resCommAmenLabel = (rawResCommAmen && !rawResCommAmen.includes('appartmentQC') && !rawResCommAmen.includes('resCommAmen'))
    ? rawResCommAmen
    : '(Res/Comm/Amen)';

  return (
    <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.25fr_1.9fr] xl:grid-cols-[0.8fr_1.2fr_2.0fr] gap-x-3.5 lg:gap-x-5 h-full flex-1 text-[12px] pt-1 min-w-0">
      {/* SECTION 1: General & Location Info */}
      <div className="flex flex-col justify-between md:border-r md:border-slate-100 md:pr-3 min-w-0 overflow-hidden gap-y-1.5">
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
      <div className="flex flex-col justify-between md:border-r md:border-slate-100 md:pr-3 min-w-0 overflow-hidden gap-y-1.5">
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
      <div className="flex flex-col justify-between min-w-0 overflow-hidden gap-y-1.5">
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
          value={
            (data?.carpetAreaFtMtr || data?.builtUpAreaFtMtr) ? (
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 leading-tight text-left">
                {data?.carpetAreaFtMtr && (
                  <div className="inline-flex items-center whitespace-nowrap">
                    <span className="text-slate-600 font-semibold mr-1">{t('grid.carpet') || 'Carpet:'}</span>
                    <span className="font-bold text-[#1d4ed8]">{data.carpetAreaFtMtr}</span>
                  </div>
                )}
                {data?.carpetAreaFtMtr && data?.builtUpAreaFtMtr && (
                  <span className="text-slate-300 font-normal">|</span>
                )}
                {data?.builtUpAreaFtMtr && (
                  <div className="inline-flex items-center whitespace-nowrap">
                    <span className="text-slate-600 font-semibold mr-1">{t('grid.builtUp') || 'Built-up:'}</span>
                    <span className="font-bold text-[#1d4ed8]">{data.builtUpAreaFtMtr}</span>
                  </div>
                )}
              </div>
            ) : (
              data?.carpetBuiltUpArea
            )
          }
          minWidth="min-w-[130px]"
          isMultiline
        />
        <PropertyMasterInfoRow
          icon={History}
          label={t('grid.oldCarpetBuiltUp') || 'Old Carpet/Built-up:'}
          value={data?.oldCarpetBuiltUp}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow icon={Layers} label={t('grid.totalFloors') || 'Total Floors:'} value={data?.totalFloors} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow
          icon={Clock}
          label={
            <div className="flex flex-col leading-tight text-left">
              <span>{t('grid.totalProperties')?.replace(/:$/, '') || 'Total Properties'}</span>
              <span className="text-[10px] text-slate-600 font-semibold">{resCommAmenLabel}</span>
            </div>
          }
          value={data?.totalPropertiesResCommAmen}
          minWidth="min-w-[130px]"
        />
      </div>
    </div>
  );
};


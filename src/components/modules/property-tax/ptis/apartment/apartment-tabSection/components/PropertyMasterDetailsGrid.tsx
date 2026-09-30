'use client';

import React from 'react';
import {
  MapPin,
  Tag,
  FileSpreadsheet,
  Crosshair,
  Grid,
  User,
  Building2,
  Mail,
  Phone,
  Home,
  Maximize2,
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

  const renderAreaRow = (currentVal?: string, oldVal?: string, fallbackVal?: string) => {
    const hasCurrent = Boolean(currentVal && currentVal !== '-' && currentVal.trim() !== '');
    const hasOld = Boolean(oldVal && oldVal !== '-' && oldVal.trim() !== '');

    if (!hasCurrent && !hasOld) {
      return (fallbackVal && fallbackVal !== '-' && fallbackVal.trim() !== '') ? fallbackVal : '-';
    }

    return (
      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 leading-tight text-left">
        <div className="inline-flex items-center whitespace-nowrap">
          <span className={hasCurrent ? "font-bold text-[#1d4ed8]" : "font-semibold text-slate-400"}>
            {hasCurrent ? currentVal : '-'}
          </span>
        </div>
        <span className="text-slate-300 font-normal">|</span>
        <div className="inline-flex items-center whitespace-nowrap">
          <span className="text-slate-600 font-semibold mr-1">{t('grid.old') || 'Old:'}</span>
          <span className={hasOld ? "font-bold text-[#1d4ed8]" : "font-semibold text-slate-400"}>
            {hasOld ? oldVal : '-'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr_1.45fr] lg:grid-cols-[0.95fr_1.15fr_1.55fr] xl:grid-cols-[0.9fr_1.2fr_1.7fr] gap-x-2.5 lg:gap-x-3.5 xl:gap-x-4.5 h-full flex-1 text-[11px] sm:text-[11.5px] xl:text-[12px] pt-0.5 xl:pt-1 min-w-0">
      {/* SECTION 1: General & Location Info */}
      <div className="flex flex-col justify-between md:border-r md:border-slate-100 md:pr-2.5 lg:md:pr-3 min-w-0 overflow-hidden gap-y-1 xl:gap-y-1.5">
        <PropertyMasterInfoRow icon={MapPin} label={t('grid.division') || 'Division:'} value={data?.division} minWidth="min-w-[90px] lg:min-w-[100px] xl:min-w-[115px]" />
        <PropertyMasterInfoRow icon={Tag} label={t('grid.category') || 'Category:'} value={data?.category} minWidth="min-w-[90px] lg:min-w-[100px] xl:min-w-[115px]" />
        <PropertyMasterInfoRow
          icon={FileSpreadsheet}
          label={t('grid.taxZoneAndName') || 'Tax Zone & Name:'}
          value={data?.taxZoneAndName || data?.taxZone}
          minWidth="min-w-[90px] lg:min-w-[100px] xl:min-w-[115px]"
        />
        <PropertyMasterInfoRow icon={Crosshair} label={t('grid.subZoneCsn') || 'Sub Zone & CSN:'} value={data?.subZoneCsnNo} minWidth="min-w-[90px] lg:min-w-[100px] xl:min-w-[115px]" />
        <PropertyMasterInfoRow icon={Grid} label={t('grid.plotNo') || 'Plot No.:'} value={data?.plotNo} minWidth="min-w-[90px] lg:min-w-[100px] xl:min-w-[115px]" />
        <PropertyMasterInfoRow
          icon={User}
          label={t('grid.landOwnerName') || 'Land Owner Name:'}
          value={data?.landOwnerName || data?.owner}
          minWidth="min-w-[100px] lg:min-w-[110px] xl:min-w-[125px]"
        />
      </div>

      {/* SECTION 2: Ownership & Management */}
      <div className="flex flex-col justify-between md:border-r md:border-slate-100 md:pr-2.5 lg:md:pr-3 min-w-0 overflow-hidden gap-y-1 xl:gap-y-1.5">
        <PropertyMasterInfoRow icon={Building2} label={t('grid.builderName') || 'Builder Name:'} value={data?.builderName} minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]" />
        <PropertyMasterInfoRow icon={Mail} label={t('grid.societyEmail') || 'Society Email:'} value={data?.societyEmail} minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]" />
        <PropertyMasterInfoRow icon={User} label={t('grid.secretaryName') || 'Secretary Name:'} value={data?.secretaryName} minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]" />
        <PropertyMasterInfoRow
          icon={Phone}
          label={t('grid.secretaryMobile') || 'Secretary Mobile:'}
          value={data?.secretaryMobileNo}
          minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]"
        />
        <PropertyMasterInfoRow icon={Mail} label={t('grid.secretaryEmail') || 'Secretary Email:'} value={data?.secretaryEmail} minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]" />
        <PropertyMasterInfoRow icon={User} label={t('grid.managerNameEnglish') || 'Manager Name (Eng):'} value={data?.managerNameEnglish || data?.managerName} minWidth="min-w-[105px] lg:min-w-[115px] xl:min-w-[125px]" />
      </div>

      {/* SECTION 3: Society Address & Property Metrics */}
      <div className="flex flex-col justify-between min-w-0 overflow-hidden gap-y-1 xl:gap-y-1.5">
        <PropertyMasterInfoRow
          icon={Home}
          label={t('grid.address') || 'Address:'}
          value={data?.societyAddress || data?.address}
          minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]"
          isMultiline
        />
        <PropertyMasterInfoRow
          icon={Maximize2}
          label={t('grid.carpetArea') || 'Carpet Area:'}
          value={renderAreaRow(data?.carpetAreaFtMtr, data?.oldCarpetAreaFtMtr, data?.carpetBuiltUpArea)}
          minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]"
          isMultiline
        />
        <PropertyMasterInfoRow
          icon={Building2}
          label={t('grid.builtUpArea') || 'Built-up Area:'}
          value={renderAreaRow(data?.builtUpAreaFtMtr, data?.oldBuiltUpAreaFtMtr, data?.oldCarpetBuiltUp)}
          minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]"
          isMultiline
        />
        <PropertyMasterInfoRow icon={Layers} label={t('grid.totalFloors') || 'Total Floors:'} value={data?.totalFloors} minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]" />
        <PropertyMasterInfoRow
          icon={Clock}
          label={
            <div className="flex flex-col leading-tight text-left">
              <span>{t('grid.totalProperties')?.replace(/:$/, '') || 'Total Properties'}</span>
              <span className="text-[10px] text-slate-600 font-semibold">{resCommAmenLabel}</span>
            </div>
          }
          value={data?.totalPropertiesResCommAmen}
          minWidth="min-w-[95px] lg:min-w-[105px] xl:min-w-[120px]"
        />
      </div>
    </div>
  );
};


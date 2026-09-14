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
import type { PropertyMasterData } from '@/types/property-tax/apartment';
import { PropertyMasterInfoRow } from './PropertyMasterInfoRow';

interface PropertyMasterDetailsGridProps {
  data?: PropertyMasterData;
}

export const PropertyMasterDetailsGrid: React.FC<PropertyMasterDetailsGridProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[0.85fr_1.25fr_1.9fr] xl:grid-cols-[0.8fr_1.2fr_2.0fr] gap-x-3.5 lg:gap-x-5 gap-y-1 text-[12px] pt-0.5 min-w-0">
      {/* SECTION 1: General & Location Info */}
      <div className="flex flex-col gap-1 md:border-r md:border-slate-100 md:pr-3 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow icon={MapPin} label="Division:" value={data?.division} minWidth="min-w-[125px]" />
        <PropertyMasterInfoRow icon={Landmark} label="Ward No.:" value={data?.wardNo} minWidth="min-w-[125px]" />
        <PropertyMasterInfoRow icon={Tag} label="Category:" value={data?.category} minWidth="min-w-[125px]" />
        <PropertyMasterInfoRow
          icon={FileSpreadsheet}
          label="Tax Zone & Name:"
          value={data?.taxZoneAndName || data?.taxZone}
          minWidth="min-w-[125px]"
        />
        <PropertyMasterInfoRow icon={Crosshair} label="Sub Zone & CSN:" value={data?.subZoneCsnNo} minWidth="min-w-[125px]" />
        <PropertyMasterInfoRow icon={Grid} label="Plot No.:" value={data?.plotNo} minWidth="min-w-[125px]" />
      </div>

      {/* SECTION 2: Ownership & Management */}
      <div className="flex flex-col gap-1 md:border-r md:border-slate-100 md:pr-3 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow
          icon={User}
          label="Land Owner Name:"
          value={data?.landOwnerName || data?.owner}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow icon={Building2} label="Builder Name:" value={data?.builderName} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow icon={Mail} label="Society Email:" value={data?.societyEmail} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow icon={User} label="Secretary Name:" value={data?.secretaryName} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow
          icon={Phone}
          label="Secretary Mobile:"
          value={data?.secretaryMobileNo}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow icon={Mail} label="Secretary Email:" value={data?.secretaryEmail} minWidth="min-w-[130px]" />
      </div>

      {/* SECTION 3: Society Address & Property Metrics */}
      <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
        <PropertyMasterInfoRow
          icon={Home}
          label="Address:"
          value={data?.societyAddress || data?.address}
          minWidth="min-w-[130px]"
          isMultiline
        />
        <PropertyMasterInfoRow icon={Ruler} label="Plot Area:" value={data?.plotArea} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow
          icon={Maximize2}
          label="Carpet / Built-up:"
          value={data?.carpetBuiltUpArea}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow
          icon={History}
          label="Old Carpet/Built-up:"
          value={data?.oldCarpetBuiltUp || data?.carpetBuiltUpArea}
          minWidth="min-w-[130px]"
        />
        <PropertyMasterInfoRow icon={Layers} label="Total Floors:" value={data?.totalFloors} minWidth="min-w-[130px]" />
        <PropertyMasterInfoRow
          icon={Clock}
          label="Total Properties:"
          value={data?.totalPropertiesResCommAmen}
          minWidth="min-w-[130px]"
        />
      </div>
    </div>
  );
};

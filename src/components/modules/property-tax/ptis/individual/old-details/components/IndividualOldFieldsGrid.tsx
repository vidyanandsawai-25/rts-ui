'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import FieldShell from '@/components/common/FieldShell';
import { ValueBox } from './IndividualOldValueBox';
import type { OldDetailsData } from '@/types/ptis.types';
import {
  MapPin,
  Hash,
  FileText,
  Layers,
  Maximize2,
  Building2,
  IndianRupee,
  Receipt,
} from 'lucide-react';

export interface IndividualOldFieldsGridProps {
  currentDetails?: OldDetailsData | null;
}

export const IndividualOldFieldsGrid: React.FC<IndividualOldFieldsGridProps> = ({
  currentDetails,
}) => {
  const t = useTranslations('ptis');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0.5">
      {/* Row 1: Identification & Location */}
      <FieldShell
        id="oldZoneName"
        label={t('fields.oldZoneName')}
        icon={MapPin}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldZoneName || ''} />
      </FieldShell>

      <FieldShell
        id="oldWardNo"
        label={t('fields.oldWardNo')}
        icon={Hash}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldWardNo || ''} />
      </FieldShell>

      <FieldShell
        id="oldPropertyNo"
        label={t('fields.oldPropertyNo')}
        icon={FileText}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldPropertyNo || ''} />
      </FieldShell>

      <FieldShell
        id="oldPartitionNo"
        label={t('fields.oldPartitionNo')}
        icon={Layers}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldPartitionNo || ''} />
      </FieldShell>

      <FieldShell
        id="oldEGovNo"
        label={t('fields.oldEGovNo')}
        icon={FileText}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldEGovernanceNo || ''} />
      </FieldShell>

      <FieldShell
        id="oldPlotNo"
        label={t('fields.oldPlotNo')}
        icon={MapPin}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldPlotNo || ''} />
      </FieldShell>

      {/* Row 2: Dimensions & Valuations */}
      <FieldShell
        id="oldPlotArea"
        label={t('fields.oldPlotAreaWithUnit')}
        icon={Maximize2}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldPlotArea || ''} />
      </FieldShell>

      <FieldShell
        id="oldConstructionArea"
        label={t('fields.oldConstructionAreaWithUnit')}
        icon={Building2}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldConstructionArea || ''} />
      </FieldShell>

      <FieldShell
        id="oldALV"
        label={t('fields.oldALV')}
        icon={IndianRupee}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldALV || ''} />
      </FieldShell>

      <FieldShell
        id="oldRV"
        label={t('fields.oldRV')}
        icon={IndianRupee}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldRV || ''} />
      </FieldShell>

      <FieldShell
        id="oldPropTax"
        label={t('fields.oldPropTax')}
        icon={Receipt}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldPropertyTax || ''} />
      </FieldShell>

      <FieldShell
        id="oldTotalTax"
        label={t('fields.oldTotalTax')}
        icon={Receipt}
        className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 2xl:col-span-2"
      >
        <ValueBox value={currentDetails?.oldTotalTax || ''} />
      </FieldShell>
    </div>
  );
};

export default IndividualOldFieldsGrid;

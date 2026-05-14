'use client';

import React from 'react';
import { RateableValueResponse } from '@/types/rateableValue.types';
import { CapitalValueResponse } from '@/types/capitalValue.types';
import { OldDetailsData } from '@/types/ptis.types';
import { useTranslations } from 'next-intl';
import { PTIS_UI_CLASSES } from '@/components/modules/property-tax/ptis/constants';

interface Props {
  propertyId?: number;
  initialRateableData: RateableValueResponse | null;
  initialCapitalData: CapitalValueResponse | null;
  initialOldDetails: OldDetailsData;
  rateableError?: string;
  capitalError?: string;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
  rateableSection?: React.ReactNode;
  capitalSection?: React.ReactNode;
}

/**
 * Renders the expandable floor details section for Dual Method view.
 * Receives Server Components as props to avoid client-side translation errors.
 */
export const DualMethodFloorDetails: React.FC<Props> = ({
  propertyId,
  initialRateableData,
  initialCapitalData,
  initialOldDetails,
  rateableError,
  capitalError,
  searchParams,
  locale,
  rateableSection,
  capitalSection,
}) => {
  const t = useTranslations('ptis.modules.DualMethod');
  
  return (
    <div className="space-y-3 mt-2">
      <div className={PTIS_UI_CLASSES.sectionCard}>
        <div className="bg-blue-100 p-3">
          <h3 className={PTIS_UI_CLASSES.sectionHeader + ' text-blue-900'}>
            <span className="w-1.5 h-1.5 bg-blue-900 rounded-full" />
            {t('rateableMethod')}
          </h3>
        </div>
        {rateableSection}
      </div>

      <div className={PTIS_UI_CLASSES.sectionCard}>
        <div className="bg-pink-100 p-3">
          <h3 className={PTIS_UI_CLASSES.sectionHeader + ' text-pink-900'}>
            <span className="w-1.5 h-1.5 bg-pink-900 rounded-full" />
            {t('capitalMethod')}
          </h3>
        </div>
        {capitalSection}
      </div>
    </div>
  );
};

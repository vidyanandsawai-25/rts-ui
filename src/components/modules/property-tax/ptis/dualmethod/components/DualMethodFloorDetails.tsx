'use client';

import React from 'react';
import { RateableTaxDetailsSection } from '@/components/modules/property-tax/ptis/rateable';
import { CapitalTaxDetailsSection } from '@/components/modules/property-tax/ptis/capital';
import { RateableValueResponse } from '@/types/rateableValue.types';
import { CapitalValueResponse } from '@/types/capitalValue.types';
import { OldDetailsData } from '@/types/ptis.types';
import { useTranslations } from 'next-intl';
import { PTIS_UI_CLASSES } from '@/components/modules/property-tax/ptis/constants';

interface Props {
  propertyId?: number;
  initialRateableData: RateableValueResponse | null;
  initialCapitalData: CapitalValueResponse | null;
  hasFetchedRateableData?: boolean;
  hasFetchedCapitalData?: boolean;
  initialOldDetails: OldDetailsData;
  rateableError?: string;
  capitalError?: string;
  searchParams: Record<string, string | string[] | undefined>;
  locale: string;
}

/**
 * Renders the expandable floor details section for Dual Method view.
 * Uses Server Components for nested details.
 */
export const DualMethodFloorDetails: React.FC<Props> = ({
  propertyId,
  initialRateableData,
  initialCapitalData,
  hasFetchedRateableData = false,
  hasFetchedCapitalData = false,
  initialOldDetails,
  rateableError,
  capitalError,
  searchParams,
  locale,
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
        <RateableTaxDetailsSection
          locale={locale}
          propertyId={propertyId}
          rateableData={initialRateableData}
          error={rateableError}
          showInlineError={false}
          oldDetails={initialOldDetails}
          searchParams={searchParams}
        />
      </div>

      <div className={PTIS_UI_CLASSES.sectionCard}>
        <div className="bg-pink-100 p-3">
          <h3 className={PTIS_UI_CLASSES.sectionHeader + ' text-pink-900'}>
            <span className="w-1.5 h-1.5 bg-pink-900 rounded-full" />
            {t('capitalMethod')}
          </h3>
        </div>
        <CapitalTaxDetailsSection
          locale={locale}
          propertyId={propertyId}
          capitalData={initialCapitalData}
          error={capitalError}
          showInlineError={false}
          oldDetails={initialOldDetails}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
};

import React from 'react';

import ApartmentTabsSection from './ApartmentTabsSection';
import type { OldDetailsData } from '@/types/ptis-core.types';


interface ApartmentTaxDetailsSectionProps {
  locale: string;
  propertyId?: number;
  initialOldDetails: OldDetailsData;
  searchParams: Record<string, string | string[] | undefined>;
}

const ApartmentTaxDetailsSection: React.FC<ApartmentTaxDetailsSectionProps> = (props) => {
  return <ApartmentTabsSection {...props} />;
};

export default ApartmentTaxDetailsSection;

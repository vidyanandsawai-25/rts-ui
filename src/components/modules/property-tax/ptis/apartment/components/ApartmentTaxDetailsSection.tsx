import React from 'react';
import ApartmentTabsSection from './ApartmentTabsSection';

interface ApartmentTaxDetailsSectionProps {
  locale: string;
  propertyId?: number;
  initialOldDetails: any;
  searchParams: Record<string, string | string[] | undefined>;
}

const ApartmentTaxDetailsSection: React.FC<ApartmentTaxDetailsSectionProps> = (props) => {
  return <ApartmentTabsSection {...props} />;
};

export default ApartmentTaxDetailsSection;

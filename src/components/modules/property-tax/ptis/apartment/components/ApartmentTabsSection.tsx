"use client";

import React from 'react';

import InnerTabs from './InnerTabs';


import { useTranslations } from 'next-intl';
import { ApartmentQCDetail, ApartmentQCTab } from '@/types/apartmentQC.types';
import { fetchApartmentQCDetailsAction } from '@/app/[locale]/property-tax/ptis/actions';

// Import category-specific components
import { AmenitiesRateable, AmenitiesCapital, AmenitiesDual } from '../amenities';
import { CommercialRateable, CommercialCapital, CommercialDual } from '../commercial';
import { ResidentialRateable, ResidentialCapital, ResidentialDual } from '../residential';

type InnerTabType = 'amenities' | 'commercial' | 'residential';

interface ApartmentTabsSectionProps {
  locale: string;
  propertyId?: number;
  initialOldDetails?: unknown;
  searchParams?: Record<string, string | string[] | undefined>;
}

const ApartmentTabsSection: React.FC<ApartmentTabsSectionProps> = ({
  propertyId
}) => {
  const t = useTranslations('ptis.apartmentTabs');

  // Inner tabs: Amenities, Commercial, Residential
  const [activeInnerTab, setActiveInnerTab] = React.useState<InnerTabType>('amenities');
  // Outer tabs: Rateable, Capital, Dual
  const [activeQCTab, setActiveQCTab] = React.useState<ApartmentQCTab>('rateable');
  
  // Data state for each category
  const [amenitiesData, setAmenitiesData] = React.useState<ApartmentQCDetail[]>([]);
  const [commercialData, setCommercialData] = React.useState<ApartmentQCDetail[]>([]);
  const [residentialData, setResidentialData] = React.useState<ApartmentQCDetail[]>([]);
  
  const [loading, setLoading] = React.useState(propertyId !== undefined);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch apartment QC details on mount
  React.useEffect(() => {
    if (propertyId === undefined) {
      return;
    }
    
    let isMounted = true;
    
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchApartmentQCDetailsAction(propertyId);
        if (!isMounted) return;
        
        if (result.success && result.data) {
          const items = result.data.items || [];
          // TODO: When API provides category-specific data, filter items by category here.
          // Currently assigning same items to all tabs; each state kept separate for future filtering.
          setAmenitiesData(items);
          setCommercialData(items);
          setResidentialData(items);
        } else {
          setError(result.error || t('error'));
        }
      } catch (_err) {
        if (!isMounted) return;
        setError(t('error'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [propertyId, t]);

  // Render the appropriate component based on active tabs
  const renderContent = () => {
    const props = { loading, error };

    if (activeInnerTab === 'amenities') {
      if (activeQCTab === 'rateable') {
        return <AmenitiesRateable data={amenitiesData} {...props} />;
      } else if (activeQCTab === 'capital') {
        return <AmenitiesCapital data={amenitiesData} {...props} />;
      } else {
        return <AmenitiesDual data={amenitiesData} {...props} />;
      }
    } else if (activeInnerTab === 'commercial') {
      if (activeQCTab === 'rateable') {
        return <CommercialRateable data={commercialData} {...props} />;
      } else if (activeQCTab === 'capital') {
        return <CommercialCapital data={commercialData} {...props} />;
      } else {
        return <CommercialDual data={commercialData} {...props} />;
      }
    } else {
      // residential
      if (activeQCTab === 'rateable') {
        return <ResidentialRateable data={residentialData} {...props} />;
      } else if (activeQCTab === 'capital') {
        return <ResidentialCapital data={residentialData} {...props} />;
      } else {
        return <ResidentialDual data={residentialData} {...props} />;
      }
    }
  };



  return (
    <section className="w-full">
      {/* Inner Tabs (Amenities, Commercial, Residential) + QC Tabs (Rateable, Capital, Dual) */}
      <div className="flex items-center justify-between gap-4 mb-0">
        {/* Left side: Inner tabs */}
        <div className="flex-1">
          <InnerTabs activeInnerTab={activeInnerTab} setActiveInnerTab={setActiveInnerTab} />
        </div>
        
        {/* Right side: QC tabs (Rateable, Capital, Dual) */}
        <div className="flex gap-2" aria-label="QC method">
          {[
            { value: 'rateable' as ApartmentQCTab, label: t('rateable') },
            { value: 'capital' as ApartmentQCTab, label: t('capital') },
            { value: 'dual' as ApartmentQCTab, label: t('dual') },
          ].map((tab) => {
            const isActive = activeQCTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveQCTab(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-[#f6fcfd] text-foreground border border-[#d9eef1]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {renderContent()}
    </section>
  );
};

export default ApartmentTabsSection;
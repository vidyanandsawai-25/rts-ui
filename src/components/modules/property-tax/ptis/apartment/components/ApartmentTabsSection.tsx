import { MdOtherHouses, MdStoreMallDirectory, MdHome } from 'react-icons/md';
import { Tabs, TabPanel } from '@/components/common/Tabs';
import React from 'react';
import { useTranslations } from 'next-intl';

interface ApartmentTabsSectionProps {
  locale: string;
  propertyId?: number;
  initialOldDetails: any;
  searchParams: Record<string, string | string[] | undefined>;
}


const ApartmentTabsSection: React.FC<ApartmentTabsSectionProps> = () => {
  const t = useTranslations('ptis.apartmentTabs');
  const [activeTab, setActiveTab] = React.useState<string | number>('amenities');
  return (
    <div className="pt-2">
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          {
            value: 'amenities',
            label: (
              <span className="flex items-center gap-1">
                <MdOtherHouses className="text-lg" /> {t('amenities')}
              </span>
            ),
            content: <div>{t('amenitiesContent')}</div>,
          },
          {
            value: 'commercial',
            label: (
              <span className="flex items-center gap-1">
                <MdStoreMallDirectory className="text-lg" /> {t('commercial')}
              </span>
            ),
            content: <div>{t('commercialContent')}</div>,
          },
          {
            value: 'residential',
            label: (
              <span className="flex items-center gap-1">
                <MdHome className="text-lg" /> {t('residential')}
              </span>
            ),
            content: <div>{t('residentialContent')}</div>,
          },
        ]}
        tabListClassName="bg-[#f6fcfd] p-1 rounded-full flex gap-2"
      />
    </div>
  );
};

export default ApartmentTabsSection;

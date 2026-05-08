import React from 'react';
import { MdOtherHouses, MdStoreMallDirectory, MdHome } from 'react-icons/md';
import { useTranslations } from 'next-intl';

type InnerTabType = 'amenities' | 'commercial' | 'residential';

interface InnerTabsProps {
  activeInnerTab: InnerTabType;
  setActiveInnerTab: (tab: InnerTabType) => void;
}

const InnerTabs: React.FC<InnerTabsProps> = ({ activeInnerTab, setActiveInnerTab }) => {
  const t = useTranslations('ptis.apartmentTabs');
  const tabs = [
    {
      value: 'amenities' as InnerTabType,
      label: (
        <span className="flex items-center gap-2">
          <MdOtherHouses className="text-lg" />
          <span>{t('amenities')}</span>
        </span>
      ),
    },
    {
      value: 'commercial' as InnerTabType,
      label: (
        <span className="flex items-center gap-2">
          <MdStoreMallDirectory className="text-lg" />
          <span>{t('commercial')}</span>
        </span>
      ),
    },
    {
      value: 'residential' as InnerTabType,
      label: (
        <span className="flex items-center gap-2">
          <MdHome className="text-lg" />
          <span>{t('residential')}</span>
        </span>
      ),
    },
  ];

  return (
    <div
      className="rounded-2xl bg-[#f6fcfd] p-1 shadow-sm border border-[#d9eef1] flex gap-2"
      aria-label="Apartment QC category"
    >
      {tabs.map((tab) => {
        const isActive = activeInnerTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setActiveInnerTab(tab.value)}
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
  );
};

export default InnerTabs;

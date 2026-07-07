'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button, DocumentViewerModal } from '@/components/common';
import { DiscountDataCard } from './components/DiscountDataCard';
import type { DiscountData, PropertySocialDetailItem } from '@/types/ptis.types';
import { AlertCircle, Loader2, ChevronsDown, ChevronsUp } from 'lucide-react';
import { fetchSocialDetailsOnlyAction } from '@/app/[locale]/property-tax/ptis/ptis-detail-actions';
import { getDocumentBlobUrl } from '@/lib/utils/document-client-utils';
import { toast } from 'sonner';

export interface DiscountDataTabProps {
  propertyId?: number;
  initialData?: DiscountData;
  initialSocialData?: DiscountData;
  onDataChange?: (data: DiscountData) => void;
  readOnly?: boolean;
}

const hasValue = (i: PropertySocialDetailItem) => i.bitValue === true || i.intValue !== null || i.decimalValue !== null || i.textValue !== null || i.dateValue !== null;

const DiscountDataTab: React.FC<DiscountDataTabProps> = ({
  propertyId,
  initialData,
  initialSocialData,
}) => {
  const t = useTranslations('ptis');
  const [activeSubTab, setActiveSubTab] = useState<'discount' | 'social'>('discount');
  const locale = useLocale();
  const [socialItems, setSocialItems] = useState<PropertySocialDetailItem[]>(() =>
    (initialSocialData?.items || []).filter(hasValue)
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);
  const [activeViewingGuid, setActiveViewingGuid] = useState<string | null>(null);
  const [viewerData, setViewerData] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
    label?: string;
  } | null>(null);

  const closeViewer = React.useCallback(() => {
    if (viewerData?.url) URL.revokeObjectURL(viewerData.url);
    setViewerData(null);
  }, [viewerData]);

  React.useEffect(() => () => { if (viewerData?.url) URL.revokeObjectURL(viewerData.url); }, [viewerData]);

  const discountItems = (initialData?.items || []).filter(hasValue);

  const activeItems = activeSubTab === 'discount' ? discountItems : socialItems;

  const prevPropertyIdRef = React.useRef<number | undefined>(propertyId);
  React.useEffect(() => {
    if (prevPropertyIdRef.current !== propertyId) { setActiveSubTab('discount'); setSocialItems([]); prevPropertyIdRef.current = propertyId; }
  }, [propertyId]);

  const handleSubTabChange = async (tab: 'discount' | 'social') => {
    setActiveSubTab(tab);
    setIsExpanded(false);
    if (tab === 'social') {
      if (!propertyId) {
        return;
      }
      setIsLoadingSocial(true);
      try {
        const result = await fetchSocialDetailsOnlyAction(propertyId);
        if (result.success && result.data?.items) {
          setSocialItems(result.data.items.filter(hasValue));
        } else {
          toast.error(result.error || 'Failed to fetch social details');
        }
      } catch (error) {
        console.error('Failed to fetch social details:', error);
        toast.error('An error occurred while fetching social details');
      } finally {
        setIsLoadingSocial(false);
      }
    }
  };

  const handleViewDocument = async (item: PropertySocialDetailItem) => {
    setActiveViewingGuid(item.documentGuid!);
    try {
      const res = await getDocumentBlobUrl(item.documentGuid!, locale);
      setViewerData({
        isOpen: true,
        url: res.url,
        name: 'Document',
        label: item.socialAttributeName,
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to view document');
    } finally {
      setActiveViewingGuid(null);
    }
  };

  const collapsedMaxHeight = activeSubTab === 'social' ? 'max-h-[80px]' : 'max-h-[68px]';
  const fallbackHeight = activeSubTab === 'social' ? 'h-[80px]' : 'h-[68px]';
  const showExpandButton =
    activeSubTab === 'social' ? activeItems.length > 10 : activeItems.length > 5;

  return (
    <>
      <div className="flex gap-4 items-stretch w-full bg-slate-50/50 rounded-xl border border-slate-100 p-1">
        {/* Cards Panel */}
        <div
          className={`flex-1 transition-all duration-300 pr-1 ${
            isExpanded
              ? 'h-fit max-h-[1000px] overflow-hidden'
              : `h-fit ${collapsedMaxHeight} overflow-hidden`
          }`}
        >
          {isLoadingSocial ? (
            <div className={`flex flex-col items-center justify-center ${fallbackHeight}`}>
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Loading social data...</p>
            </div>
          ) : activeItems.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center text-slate-500 bg-white rounded-lg border border-dashed border-slate-200 ${fallbackHeight}`}
            >
              <AlertCircle className="h-6 w-6 text-slate-400" />
              <p className="text-xs font-semibold text-slate-400">
                {t('noDataAvailable') || 'No data available for this section'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {activeItems.map((item) => (
                <DiscountDataCard
                  key={item.socialAttributeId}
                  item={item}
                  activeSubTab={activeSubTab}
                  activeViewingGuid={activeViewingGuid}
                  onViewDocument={handleViewDocument}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Panel with Arrow and Toggle Buttons */}
        <div className="flex items-start pt-1.5 pb-2 gap-2 shrink-0 pr-1 pl-3 border-l border-slate-200">
          {/* Expand/Collapse Button (Vertically Centered) */}
          {showExpandButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center p-1.5 text-black hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
              title={isExpanded ? 'View only first row' : 'View all records'}
            >
              {isExpanded ? (
                <ChevronsUp className="h-5 w-5" />
              ) : (
                <ChevronsDown className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Vertical Navigation Toggle Buttons */}
          <div className="flex flex-col gap-1.5 justify-center">
            <Button
              onClick={() => handleSubTabChange('discount')}
              size="xs"
              variant={activeSubTab === 'discount' ? 'primary' : 'secondary'}
              className="min-w-[110px] font-bold select-none active:scale-95 shadow-sm"
            >
              {t('tabs.discount') || 'Discount Data'}
            </Button>
            <Button
              onClick={() => handleSubTabChange('social')}
              size="xs"
              variant={activeSubTab === 'social' ? 'primary' : 'secondary'}
              className="min-w-[110px] font-bold select-none active:scale-95 shadow-sm"
            >
              {t('tabs.social') || 'Social Data'}
            </Button>
          </div>
        </div>
      </div>
      {viewerData && (
        <DocumentViewerModal
          isOpen={viewerData.isOpen}
          onClose={closeViewer}
          fileUrl={viewerData.url}
          fileName={viewerData.name}
          label={viewerData.label}
        />
      )}
    </>
  );
};

export default DiscountDataTab;

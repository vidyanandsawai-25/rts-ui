'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button, DocumentViewerModal, ToggleSwitch } from '@/components/common';
import FieldShell from '@/components/common/FieldShell';
import { ValueDisplay } from './components/ValueDisplay';
import type { DiscountData, PropertySocialDetailItem } from '@/types/ptis.types';
import { AlertCircle, Loader2, Eye, ChevronsDown, ChevronsUp } from 'lucide-react';
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

const hasValue = (item: PropertySocialDetailItem) => {
  return (
    item.bitValue === true ||
    item.intValue !== null ||
    item.decimalValue !== null ||
    item.textValue !== null ||
    item.dateValue !== null
  );
};

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
    if (viewerData?.url) {
      URL.revokeObjectURL(viewerData.url);
    }
    setViewerData(null);
  }, [viewerData]);

  React.useEffect(() => {
    return () => {
      if (viewerData?.url) {
        URL.revokeObjectURL(viewerData.url);
      }
    };
  }, [viewerData]);

  const discountItems = (initialData?.items || []).filter(hasValue);

  const activeItems = activeSubTab === 'discount' ? discountItems : socialItems;

  // Reset sub-tab and social items only when propertyId actually changes
  const prevPropertyIdRef = React.useRef<number | undefined>(propertyId);
  React.useEffect(() => {
    if (prevPropertyIdRef.current !== propertyId) {
      setActiveSubTab('discount');
      setSocialItems([]);
      prevPropertyIdRef.current = propertyId;
    }
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

  const isSimpleToggle = (item: PropertySocialDetailItem) => {
    return (
      item.dateValue === null &&
      item.intValue === null &&
      item.decimalValue === null &&
      item.textValue === null
    );
  };



  const getValueDisplay = (item: PropertySocialDetailItem) => {
    if (item.dateValue !== null) {
      try {
        const date = new Date(item.dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch (_) {
        // Fallback to raw string
      }
      return item.dateValue;
    }
    if (item.intValue !== null) return String(item.intValue);
    if (item.decimalValue !== null) return String(item.decimalValue);
    if (item.textValue !== null) return item.textValue;
    if (item.bitValue !== null)
      return item.bitValue ? t('fields.yes') || 'Yes' : t('fields.no') || 'No';
    if (isSimpleToggle(item))
      return item.isActive ? t('fields.yes') || 'Yes' : t('fields.no') || 'No';
    return '-';
  };

  const renderCard = (item: PropertySocialDetailItem) => {
    const valueDisplay = getValueDisplay(item);
    const isToggle = isSimpleToggle(item);

    const renderActionButtons = () => (
      <>
        <div className="flex items-center" data-testid="discount-toggle">
          <ToggleSwitch checked={true} onChange={() => {}} disabled={true} showPopup={false} />
        </div>
        {item.documentGuid && (
          <button
            type="button"
            disabled={activeViewingGuid !== null}
            onClick={async (e) => {
              e.stopPropagation();
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
            }}
            className="p-1 rounded hover:bg-blue-200 text-blue-800 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent disabled:opacity-50 h-6 w-6"
            title={t('actions.viewDocument') || 'View Document'}
          >
            {activeViewingGuid === item.documentGuid ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </>
    );

    return (
      <FieldShell
        key={item.socialAttributeId}
        className="relative transition-all hover:shadow-md min-w-0 h-full flex flex-col justify-center"
        label={
          activeSubTab === 'social' ? null : (
            <div className="flex items-center gap-1.5 min-w-0 w-full pr-14">
              <span className="truncate font-semibold text-sm" title={item.socialAttributeName}>
                {item.socialAttributeName}
              </span>
              {!isToggle && valueDisplay && (
                <span className="font-extrabold text-blue-950 text-sm ml-1 shrink-0">
                  {valueDisplay}
                </span>
              )}
            </div>
          )
        }
      >
        {activeSubTab === 'social' ? (
          <div className="flex items-center justify-between gap-1 w-full h-full min-w-0 px-1">
            <span
              className="text-sm text-blue-800 font-medium truncate flex-1"
              title={item.socialAttributeName}
            >
              {item.socialAttributeName}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {!isToggle && (
                <div className="w-16 shrink-0 mr-1">
                  <ValueDisplay
                    value={valueDisplay}
                    className="h-5 text-xs px-1 border-blue-200 w-full bg-white"
                  />
                </div>
              )}
              {renderActionButtons()}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-end">
            {/* Top right absolute container */}
            <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
              {renderActionButtons()}
            </div>

            <div className="flex items-center justify-center gap-3 mt-2 min-w-0 w-full">
              {/* Percentage and Amount (only if subTab is discount) */}
              {activeSubTab === 'discount' && (
                <>
                  {/* Percentage */}
                  <div className="flex items-center gap-1 min-w-0 w-auto">
                    <span className="text-xs text-blue-800 truncate min-w-0 select-none font-medium">
                      {t('fields.percentage') || 'Percentage'}
                    </span>
                    <div className="w-12 shrink-0">
                      <ValueDisplay
                        role="presentation"
                        value={
                          item.percentage !== null && item.percentage !== undefined
                            ? `${item.percentage}%`
                            : ''
                        }
                        className="h-5 text-xs px-1 font-bold text-slate-700 border-slate-300 w-full"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1 min-w-0 w-auto shrink">
                    <span className="text-xs text-blue-800 shrink truncate min-w-0 select-none font-medium">
                      {t('fields.amount') || 'Amount'}
                    </span>
                    <div className="w-18 shrink-0">
                      <ValueDisplay
                        role="presentation"
                        value={
                          item.amount !== null && item.amount !== undefined
                            ? String(item.amount)
                            : ''
                        }
                        className="h-5 text-xs px-1 font-bold text-slate-700 border-slate-300 w-full"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </FieldShell>
    );
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
              {activeItems.map(renderCard)}
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

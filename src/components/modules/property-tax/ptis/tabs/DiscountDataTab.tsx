'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Percent,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  Loader2,
  AlertCircle,
  Building2,
  Home,
  Store,
  Layers,
} from 'lucide-react';
import { DocumentViewerModal, Button } from '@/components/common';
import { cn } from '@/lib/utils/cn';
import { defaultLocale } from '@/i18n/config';
import { toast } from 'sonner';
import { getDocumentBlobUrl } from '@/lib/utils/document-client-utils';
import { isConfigured, getItemLevel } from '@/lib/utils/ptis/social-details';
import type { DiscountData, PropertySocialDetailItem } from '@/types/ptis.types';

export { getItemLevel };

export interface DiscountDataTabProps {
  propertyId?: number;
  initialData?: DiscountData;
  initialSocialData?: DiscountData;
  onDataChange?: (data: DiscountData) => void;
  readOnly?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  wardId?: string | number | null;
  wardNo?: string | null;
  propertyNo?: string | null;
  societyDetailId?: number | null;
  wingDetailsId?: number | null;
  wingName?: string | null;
  selectedFloor?: string | null;
  showHeader?: boolean;
  className?: string;
  isApartmentScreen?: boolean;
}

const DiscountDataTab: React.FC<DiscountDataTabProps> = ({
  propertyId,
  initialData,
  initialSocialData,
  isExpanded: propIsExpanded,
  onToggleExpand,
  wardId,
  wardNo,
  propertyNo,
  societyDetailId,
  wingDetailsId,
  wingName,
  showHeader = true,
  className,
  isApartmentScreen: propIsApartmentScreen,
}) => {
  const t = useTranslations('ptis');
  const tPanels = useTranslations('ptisRedesign.panels');
  const tTable = useTranslations('ptisRedesign.discountTable');
  const tRedesign = useTranslations('ptisRedesign');
  const locale = useLocale() || defaultLocale;
  const router = useRouter();

  const isApartmentScreen =
    propIsApartmentScreen !== undefined
      ? propIsApartmentScreen
      : Boolean(societyDetailId && Number(societyDetailId) > 0);

  const [userSelectedSubTab, setUserSelectedSubTab] = useState<'discount' | 'social'>('discount');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [internalExpanded, setInternalExpanded] = useState<boolean>(true);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : internalExpanded;
  const toggleExpand = useCallback(() => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [onToggleExpand]);

  const localDiscountData = initialData;
  const localSocialData = initialSocialData;

  const discountConfiguredItems = useMemo(
    () => (localDiscountData?.items || []).filter(isConfigured),
    [localDiscountData?.items]
  );

  const socialConfiguredItems = useMemo(
    () => (localSocialData?.items || []).filter(isConfigured),
    [localSocialData?.items]
  );

  const activeSubTab = useMemo(() => {
    if (userSelectedSubTab) return userSelectedSubTab;
    return 'discount';
  }, [userSelectedSubTab]);

  const [activeViewingKey, setActiveViewingKey] = useState<string | null>(null);
  const [viewerData, setViewerData] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
    label?: string;
    contentType?: string;
  } | null>(null);

  const currentRawItems = useMemo(() => {
    if (activeSubTab === 'social') return localSocialData?.items || [];
    return localDiscountData?.items || [];
  }, [activeSubTab, localDiscountData?.items, localSocialData?.items]);

  const configuredItems = useMemo(
    () => currentRawItems.filter(isConfigured),
    [currentRawItems]
  );

  const levelCounts = useMemo(() => {
    let apartment = 0;
    let wing = 0;
    let unit = 0;
    for (const item of configuredItems) {
      const lvl = getItemLevel(item);
      if (lvl === 'Apartment') apartment++;
      else if (lvl === 'Wing') wing++;
      else if (lvl === 'Unit') unit++;
    }
    return {
      all: configuredItems.length,
      apartment,
      wing,
      unit,
    };
  }, [configuredItems]);

  const displayedItems = useMemo(() => {
    return configuredItems.filter((item) => {
      if (isApartmentScreen && selectedLevel && selectedLevel.toLowerCase() !== 'all') {
        const itemLvl = getItemLevel(item);
        if (itemLvl.toLowerCase() !== selectedLevel.toLowerCase()) return false;
      }
      return true;
    });
  }, [configuredItems, isApartmentScreen, selectedLevel]);

  const handleSubTabChange = useCallback(
    (tab: 'discount' | 'social') => {
      setUserSelectedSubTab(tab);
      if (!isExpanded) {
        toggleExpand();
      }
    },
    [isExpanded, toggleExpand]
  );

  const handleLevelSelect = useCallback((levelKey: string) => {
    setSelectedLevel(levelKey);
  }, []);

  const handleEditInQDE = useCallback(
    (item?: PropertySocialDetailItem) => {
      const targetPropId = propertyId || '0';
      const q = new URLSearchParams();
      if (wardNo) q.set('wardNo', String(wardNo));
      if (wardId) q.set('wardId', String(wardId));
      if (propertyNo) q.set('propertyNo', String(propertyNo));
      if (societyDetailId) {
        q.set('societyId', String(societyDetailId));
        q.set('societyDetailId', String(societyDetailId));
      }

      const itemLevel = item ? getItemLevel(item) : (selectedLevel || 'Apartment');
      const targetWingId = item?.wingDetailId || wingDetailsId;
      const targetWingName = item?.wingName || wingName;
      const targetUnitPropId = itemLevel === 'Unit' ? (item?.propertyId || propertyId || undefined) : undefined;

      const effectiveLevel = itemLevel.toLowerCase() === 'all' ? 'apartment' : itemLevel.toLowerCase();
      if (effectiveLevel) q.set('level', effectiveLevel);
      if (targetWingId) q.set('wingDetailId', String(targetWingId));
      if (targetWingName) q.set('wingName', String(targetWingName));
      if (targetUnitPropId && Number(targetUnitPropId) > 0) q.set('unitPropertyId', String(targetUnitPropId));
      q.set('returnTab', 'discount');

      if (activeSubTab === 'social') {
        q.set('view', 'social');
      } else {
        q.set('view', 'discount');
      }
      router.push(`/${locale}/property-tax/ptis/QuickDataEntry/${targetPropId}/Discount?${q.toString()}`);
    },
    [propertyId, wardNo, wardId, propertyNo, societyDetailId, wingDetailsId, wingName, activeSubTab, router, locale, selectedLevel]
  );

  const closeViewer = useCallback(() => {
    if (viewerData?.url) URL.revokeObjectURL(viewerData.url);
    setViewerData(null);
  }, [viewerData]);

  useEffect(() => {
    return () => {
      if (viewerData?.url) URL.revokeObjectURL(viewerData.url);
    };
  }, [viewerData]);

  const handleViewDocument = useCallback(
    async (item: PropertySocialDetailItem, rowKey: string) => {
      if (!item.documentGuid) return;
      setActiveViewingKey(rowKey);
      try {
        const res = await getDocumentBlobUrl(item.documentGuid, locale);
        setViewerData({
          isOpen: true,
          url: res.url,
          name: item.socialAttributeName || 'Document',
          label: item.socialAttributeName,
          contentType: res.contentType,
        });
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to view document');
      } finally {
        setActiveViewingKey(null);
      }
    },
    [locale]
  );

  const renderLevelBadge = (item: PropertySocialDetailItem) => {
    const lvl = getItemLevel(item);
    if (lvl === 'Apartment') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Building2 className="w-2.5 h-2.5 text-slate-500 shrink-0" />
          <span>{tRedesign?.('buildingPermission.levels.apartment') || 'Apartment Level'}</span>
        </span>
      );
    }
    if (lvl === 'Wing') {
      const rawWing = (item.applicableToLabel || item.wingName || '').trim();
      const wingText = rawWing
        ? /wing/i.test(rawWing)
          ? rawWing
          : `Wing ${rawWing}`
        : tRedesign?.('buildingPermission.levels.wing') || 'Wing Level';

      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <Home className="w-2.5 h-2.5 text-purple-500 shrink-0" />
          <span>{wingText}</span>
        </span>
      );
    }
    if (lvl === 'Unit') {
      const rawNo = item.partitionNo || item.unitNo;
      const cleanNo = rawNo ? String(rawNo).replace(/^(unit|partition(\s*no\.?)?)\s*/i, '').trim() : '';
      let partitionLabel = 'Partition No.';
      try {
        const trans = t('partitionNo') || t('fields.partitionNo');
        if (trans && !trans.includes('ptis.') && !trans.toLowerCase().includes('partitionno')) {
          partitionLabel = trans;
        }
      } catch {
        partitionLabel = 'Partition No.';
      }
      const formattedLabel = partitionLabel.endsWith('.') ? partitionLabel : `${partitionLabel}.`;
      const unitText = cleanNo
        ? `${formattedLabel} ${cleanNo}`
        : tRedesign?.('buildingPermission.levels.unit') || 'Unit Level';

      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Store className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
          <span>{unitText}</span>
        </span>
      );
    }
    return null;
  };


  const renderValueDisplay = (item: PropertySocialDetailItem) => {
    const hasInt = item.intValue !== null && item.intValue !== undefined;
    const hasDecimal = item.decimalValue !== null && item.decimalValue !== undefined;
    const hasDate = item.dateValue !== null && item.dateValue !== undefined && item.dateValue.trim() !== '';
    const hasText = item.textValue !== null && item.textValue !== undefined && item.textValue.trim() !== '' && item.textValue.trim().toLowerCase() !== 'string';
    const isTextYes = hasText && (item.textValue?.trim().toLowerCase() === 'yes' || item.textValue?.trim().toLowerCase() === 'true');
    const appliedLabel = t('fields.applied') || t('applied') || 'Applied';
    const noLabel = t('fields.no') || 'No';

    return (
      <div className="flex items-center gap-3 flex-wrap">
        {hasInt && <span className="font-bold text-slate-800">{item.intValue}</span>}
        {hasDecimal && !hasInt && <span className="font-bold text-slate-800">{item.decimalValue}</span>}
        {hasDate && (
          <span className="font-medium text-slate-700">
            {(() => {
              try {
                const d = new Date(item.dateValue!);
                if (!isNaN(d.getTime())) return d.toLocaleDateString();
              } catch (_) {}
              return item.dateValue;
            })()}
          </span>
        )}
        {hasText && (
          isTextYes ? (
            <span className="font-semibold text-emerald-700">{appliedLabel}</span>
          ) : (
            <span className="text-slate-800">{item.textValue}</span>
          )
        )}
        {!hasInt && !hasDecimal && !hasDate && !hasText && (
          item.bitValue !== null && item.bitValue !== undefined ? (
            <span className={cn('font-semibold', item.bitValue ? 'text-emerald-700' : 'text-slate-500')}>
              {item.bitValue ? appliedLabel : noLabel}
            </span>
          ) : item.isActive ? (
            <span className="font-semibold text-emerald-700">{appliedLabel}</span>
          ) : (
            <span className="text-slate-400">-</span>
          )
        )}
      </div>
    );
  };

  const subTabs = useMemo(
    () => [
      {
        id: 'discount' as const,
        label: t('tabs.discount') || 'Discount Data',
        count: discountConfiguredItems.length,
        icon: Percent,
      },
      {
        id: 'social' as const,
        label: t('tabs.social') || 'Social Data',
        count: socialConfiguredItems.length,
        icon: Building2,
      },
    ],
    [t, discountConfiguredItems.length, socialConfiguredItems.length]
  );

  const hasSocDetail = Boolean(societyDetailId && Number(societyDetailId) > 0);
  const hasWingDetail = Boolean(wingDetailsId && Number(wingDetailsId) > 0);

  const levelFilterItems = useMemo(() => {
    const items: Array<{
      key: 'All' | 'Apartment' | 'Wing' | 'Unit';
      label: string;
      count: number;
      icon: typeof Layers;
    }> = [
      {
        key: 'All',
        label: tRedesign?.('buildingPermission.levels.all') || t('tabs.all') || 'All',
        count: levelCounts.all,
        icon: Layers,
      },
    ];

    if (hasSocDetail || levelCounts.apartment > 0) {
      items.push({
        key: 'Apartment' as const,
        label: tRedesign?.('buildingPermission.levels.apartment') || 'Apartment Level',
        count: levelCounts.apartment,
        icon: Building2,
      });
    }

    if (hasWingDetail || levelCounts.wing > 0 || (hasSocDetail && isApartmentScreen)) {
      items.push({
        key: 'Wing' as const,
        label: tRedesign?.('buildingPermission.levels.wing') || 'Wing Level',
        count: levelCounts.wing,
        icon: Home,
      });
    }

    items.push({
      key: 'Unit' as const,
      label: tRedesign?.('buildingPermission.levels.unit') || 'Unit Level',
      count: levelCounts.unit,
      icon: Store,
    });

    return items;
  }, [tRedesign, t, levelCounts, hasSocDetail, hasWingDetail, isApartmentScreen]);

  return (
    <div className={cn('space-y-2', className)}>
      {/* 1. Section Header Row with 2 Sub-Tabs and Scope Filter / Edit Button */}
      {showHeader && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          {/* Left: Section Title with Expand/Collapse Trigger */}
          <div
            className="flex items-center gap-2 select-none cursor-pointer group"
            onClick={toggleExpand}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpand();
              }
            }}
            aria-expanded={isExpanded}
          >
            <Percent className="w-4 h-4 text-blue-700 shrink-0" />
            <h2 className="text-xs sm:text-[13px] font-black text-blue-950 uppercase tracking-wide select-none">
              {tPanels?.('discount') || 'DISCOUNT & SOCIAL DATA (Discounts & Concessions)'}
            </h2>
            <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
              {isExpanded ? (
                <ChevronDown size={15} strokeWidth={2.5} />
              ) : (
                <ChevronRight size={15} strokeWidth={2.5} />
              )}
            </div>
          </div>

          {/* Right Corner: The Sub-Tabs & Scope Level Filter / Edit Button */}
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* The Sub-Tabs Segmented Control */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {subTabs.map((tab) => {
                const isActive = activeSubTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    size="xs"
                    variant={isActive ? 'primary' : 'ghost'}
                    icon={tab.icon}
                    onClick={() => handleSubTabChange(tab.id)}
                    className={cn(
                      'font-bold cursor-pointer rounded-lg transition-all min-w-[125px] justify-center',
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                    )}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ml-1',
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Scope Filter Segmented Bar (for apartment screen, replacing the edit button) */}
            {isApartmentScreen ? (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {levelFilterItems.map((lvl) => {
                  const isActive = selectedLevel.toLowerCase() === lvl.key.toLowerCase();
                  return (
                    <Button
                      key={lvl.key}
                      size="xs"
                      variant={isActive ? 'primary' : 'ghost'}
                      icon={lvl.icon}
                      onClick={() => handleLevelSelect(lvl.key)}
                      className={cn(
                        'font-bold cursor-pointer rounded-lg transition-all',
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/50'
                      )}
                    >
                      {lvl.label} ({lvl.count})
                    </Button>
                  );
                })}
              </div>
            ) : (
              /* Quick Data Entry Edit Button (fallback for non-apartment screens) */
              <Button
                size="xs"
                variant="secondary"
                icon={Pencil}
                onClick={() => handleEditInQDE()}
                className="font-bold cursor-pointer rounded-lg transition-all border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                title={t('actions.edit') || 'Edit'}
              >
                {t('actions.edit') || 'Edit'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 2. Collapsible Table Grid Container */}
      {isExpanded && (
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200 space-y-2.5">
          {displayedItems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-slate-200 gap-2">
              <AlertCircle className="w-7 h-7 text-slate-400" />
              <p className="text-xs font-semibold text-slate-500">
                {t('noDataAvailable') || 'No data available for this section'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm">
                {tTable('noData')}
              </p>
            </div>
          ) : (
            /* Table Grid with IntValue, DecimalValue, TextValue, DateValue columns */
            <div className="w-full overflow-x-auto overflow-y-auto max-h-[320px] border border-slate-200/80 rounded-lg bg-white custom-scrollbar shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200/80 shadow-2xs">
                  <tr className="bg-slate-50">
                    <th className="py-2.5 px-3 font-bold text-xs text-slate-600 uppercase tracking-wider bg-slate-50">
                      {activeSubTab === 'social' ? (tTable('socialAttribute') || 'SOCIAL ATTRIBUTE') : (tTable('discountAttribute') || 'DISCOUNT ATTRIBUTE')}
                    </th>

                    <th className="py-2.5 px-3 font-bold text-xs text-slate-600 uppercase tracking-wider bg-slate-50">
                      {tTable('value') || 'VALUE'}
                    </th>
                    <th className="py-2.5 px-3 font-bold text-xs text-slate-600 uppercase tracking-wider bg-slate-50">
                      {tTable('remark') || 'REMARK'}
                    </th>
                    <th className="py-2.5 px-3 font-bold text-xs text-slate-600 uppercase tracking-wider bg-slate-50 text-center w-24">
                      {tTable('action') || 'ACTION'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {displayedItems.map((item, index) => {
                    const rowKey = String(
                      item.id
                        ? `id-${item.id}`
                        : `attr-${item.socialAttributeId}-prop-${item.propertyId}-wing-${item.wingDetailId || 0}-${index}`
                    );
                    const isViewingThis = activeViewingKey === rowKey;

                    return (
                      <tr
                        key={rowKey}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* 1) Attribute Name & Level Badge (without Code Badge) */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="font-bold text-xs text-slate-900"
                              title={item.socialAttributeName || item.socialAttributeCode || undefined}
                            >
                              {item.socialAttributeName || item.socialAttributeCode || `Attribute #${item.socialAttributeId}`}
                            </span>
                            {isApartmentScreen && renderLevelBadge(item)}
                          </div>
                        </td>



                        {/* 4) Value Column */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          {renderValueDisplay(item)}
                        </td>

                        {/* 5) Remark */}
                        <td className="py-2 px-3 max-w-[240px] truncate text-slate-600" title={item.remark || ''}>
                          {item.remark || '-'}
                        </td>

                        {/* 6) Action (Edit & View Icons) */}
                        <td className="py-2 px-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditInQDE(item);
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-md transition-all cursor-pointer"
                              title={t('actions.edit') || 'Edit'}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {item.documentGuid ? (
                              <button
                                type="button"
                                disabled={activeViewingKey !== null}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDocument(item, rowKey);
                                }}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-md transition-all cursor-pointer disabled:opacity-50"
                                title={tTable('viewFile') || 'View Document'}
                              >
                                {isViewingThis ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            ) : (
                              <span
                                className="p-1.5 text-slate-300 rounded-md cursor-not-allowed inline-block"
                                title={tTable('noDocument') || 'No Document'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewerData && (
        <DocumentViewerModal
          isOpen={viewerData.isOpen}
          onClose={closeViewer}
          fileUrl={viewerData.url}
          fileName={viewerData.name}
          label={viewerData.label}
        />
      )}
    </div>
  );
};

export default DiscountDataTab;

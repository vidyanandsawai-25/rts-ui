'use client';

import React, { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Loader2 } from 'lucide-react';
import { Button, Input, PTISSearchSelect, Tooltip } from '@/components/common';
import { Label } from '@/components/common/label';
import type { PTISSearchSelectOption } from '@/components/common';
import { normalizePartition } from '@/lib/utils/format';
import {
  buildPropertyOptionKey,
  buildPartitionOptionKey,
} from '@/hooks/ptis/tab/usePropertyOptions';
import type { PartitionOptionValue } from '@/hooks/ptis/tab/usePropertyOptions';
import type { TabHeaderInfoData } from '@/types/ptis.types';

export interface PropertySearchBarProps {
  wardNo: string;
  setWardNo: (val: string) => void;
  wardId: number | null;
  setWardId: (id: number | null, no: string) => void;
  propertyNo: string;
  setPropertyNo: (val: string) => void;
  partitionNo: string;
  setPartitionNo: (val: string) => void;
  propertyId: string | null;
  setPropertyId: (val: string | null) => void;

  wardOptions: PTISSearchSelectOption[];
  isFetchingWardOptions: boolean;
  onFetchWardList: () => void;

  propertyOptions: PTISSearchSelectOption[];
  propertyOptionValueMap: Map<string, string>;

  partitionOptions: PTISSearchSelectOption[];
  partitionValueMap: Map<string, PartitionOptionValue>;

  isSearching: boolean;
  onSearch: (data: {
    wardNo: string;
    propertyNo: string;
    partitionNo: string;
    wardId: number | null;
    propertyId: string | null;
  }) => void;

  upicId: string;
  ownerName: string;
  propertyDescription: string;
  tabHeaderInfo?: TabHeaderInfoData | null;
  onPropertySearchChange?: (search: string) => void;
  onPartitionSearchChange?: (search: string) => void;
  isSearchingProperties?: boolean;
}

export const PropertySearchBar: React.FC<PropertySearchBarProps> = ({
  wardNo,
  setWardNo,
  wardId,
  setWardId,
  propertyNo,
  setPropertyNo,
  partitionNo,
  setPartitionNo,
  propertyId,
  setPropertyId,
  wardOptions,
  isFetchingWardOptions,
  onFetchWardList,
  propertyOptions,
  propertyOptionValueMap,
  partitionOptions,
  partitionValueMap,
  isSearching,
  onSearch,
  upicId,
  ownerName,
  propertyDescription,
  tabHeaderInfo,
  onPropertySearchChange,
  onPartitionSearchChange,
  isSearchingProperties = false,
}) => {
  const t = useTranslations('ptis');

  const sanitizeWardNo = useCallback((val: string) => {
    return val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  }, []);

  const sanitizePropertyNo = useCallback((val: string) => {
    return val.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 10);
  }, []);

  const sanitizePartitionNo = useCallback((val: string) => {
    return val.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 10);
  }, []);

  const handleWardChange = useCallback(
    (_name: string | undefined, value: string) => {
      if (!value) {
        setWardNo('');
        setWardId(null, '');
        setPropertyNo('');
        setPartitionNo('');
        setPropertyId(null);
        return;
      }

      const selectedWard = wardOptions.find((w) => w.value === value);
      if (selectedWard) {
        const newWardId = parseInt(value, 10);
        // Special case: we pass both to trigger the immediate URL/RSC sync in the parent
        setWardId(newWardId, selectedWard.label);

        // Auto-focus propertyNo to prompt selection
        setTimeout(() => {
          const propertyInput = document.getElementById('propertyNo');
          if (propertyInput && !propertyInput.hasAttribute('disabled')) {
            propertyInput.focus();
            // Additionally click to ensure dropdown opens if focus isn't enough on some browsers
            propertyInput.click();
          }
        }, 100);
      }
    },
    [wardOptions, setWardNo, setWardId, setPropertyNo, setPartitionNo, setPropertyId]
  );

  const handlePropertyChange = useCallback(
    (_name: string | undefined, value: string) => {
      if (!value) {
        setPropertyNo('');
        setPartitionNo('');
        setPropertyId(null);
        return;
      }

      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object') {
          setPropertyNo(parsed.propertyNo);
          setPartitionNo(normalizePartition(parsed.partitionNo));
          setPropertyId(parsed.propertyId ? parsed.propertyId.toString() : null);
        } else {
          setPropertyNo(value);
          setPartitionNo('');
          setPropertyId(null);
        }
      } catch {
        setPropertyNo(value);
        setPartitionNo('');
        setPropertyId(null);
      }
    },
    [setPropertyNo, setPartitionNo, setPropertyId]
  );

  const handlePartitionChange = useCallback(
    (_name: string | undefined, value: string) => {
      if (!value) {
        setPartitionNo('');
        setPropertyId(null);
        return;
      }

      // value is now a composite key from partitionValueMap
      const data = partitionValueMap.get(value);
      if (data) {
        setPartitionNo(data.partitionNo);
        setPropertyId(data.propertyId?.toString() || null);
      } else {
        // Fallback for raw typing if applicable
        setPartitionNo(normalizePartition(value));
        setPropertyId(null);
      }
    },
    [partitionValueMap, setPartitionNo, setPropertyId]
  );

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!propertyId) return;
      let finalPropertyNo = propertyNo;
      let finalPartitionNo = partitionNo;
      if (propertyNo.includes('-') && !propertyId) {
        const parts = propertyNo.split('-');
        finalPropertyNo = parts[0];
        finalPartitionNo = parts.slice(1).join('-');
      }
      onSearch({
        wardNo,
        propertyNo: finalPropertyNo,
        partitionNo: finalPartitionNo,
        wardId,
        propertyId,
      });
    },
    [onSearch, wardNo, propertyNo, partitionNo, wardId, propertyId]
  );

  // Derive selection values for SearchSelect components to avoid inline calculations
  const wardValue = wardId?.toString() || '';

  const propertyOptionKey = useMemo(
    () => buildPropertyOptionKey(propertyNo, partitionNo),
    [propertyNo, partitionNo]
  );
  const propertySelectValue = propertyOptionValueMap.get(propertyOptionKey) ?? '';

  const partitionOptionKey = useMemo(
    () => buildPartitionOptionKey(propertyNo, partitionNo),
    [propertyNo, partitionNo]
  );
  const partitionSelectValue = partitionValueMap.has(partitionOptionKey) ? partitionOptionKey : '';

  // Format the Old No string, showing only '-' if there is no data
  const oldNoDisplay = useMemo(() => {
    if (!tabHeaderInfo) return '-';

    const ward = tabHeaderInfo.oldWardNo?.trim() || '';
    const prop = tabHeaderInfo.oldPropertyNo?.trim() || '';
    const part = tabHeaderInfo.oldPartitionNo?.trim() || '';

    const hasWard = ward && ward !== '-';
    const hasProp = prop && prop !== '-';
    const hasPart = part && part !== '-';

    if (!hasWard && !hasProp && !hasPart) {
      return '-';
    }

    return `${ward || '-'}|${prop || '-'}${part ? `|${part}` : ''}`;
  }, [tabHeaderInfo]);

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-2 py-1">
      <form
        onSubmit={handleFormSubmit}
        className="flex flex-col sm:flex-row sm:items-stretch gap-2 text-xs text-blue-700 font-bold"
        method="GET"
      >
        {/* Search Inputs (Left Section) */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Ward No */}
          <div className="flex items-center gap-1 relative">
            <Label
              htmlFor="wardNo"
              className="font-semibold text-blue-900 whitespace-nowrap text-xs lg:text-sm"
            >
              {t('search.wardNo')}:
            </Label>
            <div className="w-24 sm:w-28 lg:w-32 relative [&_ul]:top-full [&_ul]:!z-30">
              <PTISSearchSelect
                id="wardNo"
                options={wardOptions}
                value={wardValue}
                onChange={handleWardChange}
                forceSearchText={wardNo || undefined}
                sanitizeInput={sanitizeWardNo}
                className="h-7 text-xs lg:text-sm"
                isLoading={isFetchingWardOptions}
                loadingPlaceholder={t('search.loading')}
                noOptionsPlaceholder={t('search.noOptionsAvailable')}
                onInputFocus={onFetchWardList}
              />
              <Input type="hidden" name="wardNo" value={wardNo ?? ''} />
              <Input type="hidden" name="wardId" value={wardValue ?? ''} />
            </div>
          </div>

          {/* Property No */}
          <div className="flex items-center gap-1 relative">
            <Label
              htmlFor="propertyNo"
              className="font-semibold text-blue-900 whitespace-nowrap text-xs lg:text-sm"
            >
              {t('search.propertyNo')}:
            </Label>
            <div className="w-24 sm:w-28 lg:w-38 relative [&_ul]:top-full [&_ul]:!z-30">
              <PTISSearchSelect
                id="propertyNo"
                options={propertyOptions}
                value={propertySelectValue}
                onChange={handlePropertyChange}
                forceSearchText={propertyNo || undefined}
                sanitizeInput={sanitizePropertyNo}
                className="h-7 text-xs lg:text-sm"
                disabled={!wardId}
                isLoading={isSearchingProperties}
                loadingPlaceholder={t('search.loading')}
                noOptionsPlaceholder={t('search.noOptionsAvailable')}
                emptyMessage={t('search.typeToGetSuggestions')}
                noResultsMessage={t('search.error')}
                strictMode={false}
                onSearchChange={onPropertySearchChange}
                showOptionsOnlyOnType
              />
              <Input type="hidden" name="propertyNo" value={propertyNo ?? ''} />
            </div>
          </div>

          {/* Partition No */}
          <div className="flex items-center gap-1 relative">
            <Label
              htmlFor="partitionNo"
              className="font-semibold text-blue-900 whitespace-nowrap text-xs lg:text-sm"
            >
              {t('search.partitionNo')}:
            </Label>
            <div className="w-16 sm:w-25 relative [&_ul]:top-full [&_ul]:!z-30">
              <PTISSearchSelect
                id="partitionNo"
                options={partitionOptions}
                value={partitionSelectValue}
                onChange={handlePartitionChange}
                forceSearchText={partitionNo || undefined}
                sanitizeInput={sanitizePartitionNo}
                className="h-7 text-xs lg:text-sm"
                disabled={!wardId || !propertyNo}
                isLoading={isSearchingProperties}
                loadingPlaceholder={t('search.loading')}
                noOptionsPlaceholder={t('search.noOptionsAvailable')}
                strictMode={false}
                onSearchChange={onPartitionSearchChange}
              />
              <Input type="hidden" name="partitionNo" value={partitionNo ?? ''} />
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="h-7 w-7 bg-blue-900 hover:bg-blue-700"
            disabled={isSearching || !propertyId}
            aria-label={t('search.searchButton')}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block self-stretch w-px bg-slate-400 my-0.5" />

        {/* Summary Info (Right Section) */}
        {!tabHeaderInfo ? (
          <div className="flex flex-col gap-0.5 min-w-0 flex-grow justify-center">
            {/* First Row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              {/* Old No */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.oldNo')}:
                </span>
                <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[150px] lg:max-w-none">
                  -
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-400" />

              {/* Assessment status */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.assessmentStatus')}:
                </span>
                <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[120px] lg:max-w-none">
                  -
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-400" />

              {/* UPIC ID */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.upicId')}:
                </span>
                <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[100px] lg:max-w-none">
                  {upicId || '-'}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-400" />

              {/* Property Description */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.propertyDescription')}:
                </span>
                <span className="font-bold text-red-700 text-xs lg:text-sm truncate max-w-[80px] lg:max-w-none">
                  {propertyDescription || '-'}
                </span>
              </div>
            </div>

            {/* Second Row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              {/* Property Holder */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.propertyHolder')}:
                </span>
                <Tooltip content={ownerName || '-'}>
                  <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[250px] xl:max-w-[300px]">
                    {ownerName || '-'}
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 min-w-0 flex-grow justify-center">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
              {/* Old No */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.oldNo')}:
                </span>
                <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[150px] lg:max-w-none">
                  {oldNoDisplay}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-400" />

              {/* Assessment status */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.assessmentStatus')}:
                </span>
                <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[120px] lg:max-w-none">
                  {tabHeaderInfo?.statusName || '-'}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-400" />

              {/* UPIC ID */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.upicId')}:
                </span>
                <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[100px] lg:max-w-none">
                  {tabHeaderInfo?.upicId || upicId || '-'}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-400" />

              {/* Property Description */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.propertyDescription')}:
                </span>
                <span className="font-bold text-red-700 text-xs lg:text-sm truncate max-w-[80px] lg:max-w-none">
                  {tabHeaderInfo?.description || propertyDescription || '-'}
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-400" />

              {/* Property Holder */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
                  {t('fields.propertyHolder')}:
                </span>
                <Tooltip content={tabHeaderInfo?.ownerName || ownerName || '-'}>
                  <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-[250px] xl:max-w-[300px]">
                    {tabHeaderInfo?.ownerName || ownerName || '-'}
                  </span>
                </Tooltip>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

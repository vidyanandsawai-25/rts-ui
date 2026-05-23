'use client';

import React, { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Loader2 } from 'lucide-react';
import { Button, Input, SearchSelect } from '@/components/common';
import { Label } from '@/components/common/label';
import type { SearchSelectOption } from '@/components/common';
import { normalizePartition } from '@/lib/utils/format';
import {
  buildPropertyOptionKey,
  buildPartitionOptionKey,
} from '@/hooks/ptis/tab/usePropertyOptions';
import type { PartitionOptionValue } from '@/hooks/ptis/tab/usePropertyOptions';

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

  wardOptions: SearchSelectOption[];
  isFetchingWardOptions: boolean;
  onFetchWardList: () => void;

  propertyOptions: SearchSelectOption[];
  propertyOptionValueMap: Map<string, string>;

  partitionOptions: SearchSelectOption[];
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
}) => {
  const t = useTranslations('ptis');

  const sanitizeWardNo = useCallback((val: string) => {
    return val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  }, []);

  const sanitizePropertyNo = useCallback((val: string) => {
    return val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
  }, []);

  const sanitizePartitionNo = useCallback((val: string) => {
    return val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
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
        setPropertyNo(parsed.propertyNo);
        setPartitionNo(normalizePartition(parsed.partitionNo));
        setPropertyId(parsed.propertyId?.toString() || null);
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
      onSearch({ wardNo, propertyNo, partitionNo, wardId, propertyId });
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

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-2 py-2">
      <form
        onSubmit={handleFormSubmit}
        className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs text-blue-700 font-bold"
        method="GET"
      >
        {/* Ward No */}
        <div className="flex items-center gap-1 relative">
          <Label
            htmlFor="wardNo"
            className="font-semibold text-blue-900 whitespace-nowrap text-xs lg:text-sm"
          >
            {t('search.wardNo')}:
          </Label>
          <div className="w-24 sm:w-28 lg:w-32 relative [&_ul]:top-full [&_ul]:!z-30">
            <SearchSelect
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
            <Input type="hidden" name="wardNo" value={wardNo} />
            <Input type="hidden" name="wardId" value={wardValue} />
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
          <div className="w-24 sm:w-28 lg:w-32 relative [&_ul]:top-full [&_ul]:!z-30">
            <SearchSelect
              id="propertyNo"
              options={propertyOptions}
              value={propertySelectValue}
              onChange={handlePropertyChange}
              forceSearchText={propertyNo || undefined}
              sanitizeInput={sanitizePropertyNo}
              className="h-7 text-xs lg:text-sm"
              disabled={!wardId}
              isLoading={false}
              loadingPlaceholder={t('search.loading')}
              noOptionsPlaceholder={t('search.noOptionsAvailable')}
            />
            <Input type="hidden" name="propertyNo" value={propertyNo} />
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
          <div className="w-16 sm:w-20 relative [&_ul]:top-full [&_ul]:!z-30">
            <SearchSelect
              id="partitionNo"
              options={partitionOptions}
              value={partitionSelectValue}
              onChange={handlePartitionChange}
              forceSearchText={partitionNo || undefined}
              sanitizeInput={sanitizePartitionNo}
              className="h-7 text-xs lg:text-sm"
              disabled={!wardId || !propertyNo}
              isLoading={false}
              loadingPlaceholder={t('search.loading')}
              noOptionsPlaceholder={t('search.noOptionsAvailable')}
            />
            <Input type="hidden" name="partitionNo" value={partitionNo} />
          </div>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="h-7 w-7 bg-blue-900 hover:bg-blue-700"
          disabled={isSearching}
          aria-label={t('search.searchButton')}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>

        {/* Summary Info */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
              {t('fields.upicId')}:
            </span>
            <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[100px] lg:max-w-none">
              {upicId || '-'}
            </span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-slate-400" />
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
              {t('fields.propertyHolder')}:
            </span>
            <span className="font-bold text-slate-700 text-xs lg:text-sm truncate max-w-[100px] lg:max-w-none">
              {ownerName || '-'}
            </span>
          </div>
          <div className="hidden sm:block h-4 w-px bg-slate-400" />
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-medium text-blue-900 text-[11px] lg:text-[13px] whitespace-nowrap">
              {t('fields.propertyDescription')}:
            </span>
            <span className="font-bold text-red-700 text-xs lg:text-sm truncate max-w-[80px] lg:max-w-none">
              {propertyDescription || '-'}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSyncedSearchParams } from '@/hooks/ptis/tab/useSyncedSearchParams';
import { usePropertySearchState } from '@/hooks/ptis/tab/usePropertySearchState';
import { usePropertySearch } from '@/hooks/ptis/tab/usePropertySearch';
import { useWardOptions } from '@/hooks/ptis/tab/useWardOptions';
import { usePropertyOptions } from '@/hooks/ptis/tab/usePropertyOptions';
import { usePropertySuggestions } from '@/hooks/ptis/tab/usePropertySuggestions';
import { useDebounce } from '@/hooks/useDebounce';
import { normalizePartition } from '@/lib/utils/format';
import { SearchSelectOption } from '@/components/common';
import { PtisInitialData } from '@/types/ptis.types';
import type { PropertyMasterData } from '@/types/property-tax/apartment';

const EMPTY_ARRAY: never[] = [];

export function useApartmentPropertySearch(
  initialData: PtisInitialData,
  initialWardId: number | null,
  initialPropertyMasterData?: PropertyMasterData
) {
  const urlState = useSyncedSearchParams();

  const {
    draft,
    setWardNo,
    setPropertyNo,
    setPartitionNo,
    setPropertyId,
    setCategory,
    handleWardSelection,
  } = usePropertySearchState({ ...urlState, wardId: urlState.wardId || initialWardId });

  const { isSearching, handleSearchProperty, updateUrl } = usePropertySearch();
  const { wardOptions, isFetchingWardOptions, handleFetchWardList } = useWardOptions(initialData?.wardOptions || EMPTY_ARRAY);

  const [searchText, setSearchText] = useState('');
  const [partitionSearchText, setPartitionSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 150);
  const debouncedPartitionSearchText = useDebounce(partitionSearchText, 150);

  const { propertiesList, setPropertiesList, isSearchingProperties } = usePropertySuggestions(
    draft.wardId, debouncedSearchText, debouncedPartitionSearchText, draft.propertyId, initialData?.rawPropertyData || EMPTY_ARRAY
  );

  useEffect(() => {
    if (initialData?.rawPropertyData) setPropertiesList(initialData.rawPropertyData);
  }, [initialData?.rawPropertyData, setPropertiesList]);

  useEffect(() => {
    if (!draft.propertyNo) { if (draft.propertyId) setPropertyId(null); return; }
    const normProp = draft.propertyNo.trim().toLowerCase();
    const normPart = normalizePartition(draft.partitionNo).toLowerCase();
    if (draft.propertyId) {
      const cur = propertiesList.find((p) => p.propertyId === Number(draft.propertyId));
      if (!cur || cur.propertyNo.trim().toLowerCase() !== normProp || normalizePartition(cur.partitionNo).toLowerCase() !== normPart) setPropertyId(null);
      return;
    }
    const exact = propertiesList.find((p) => p.propertyNo.trim().toLowerCase() === normProp && normalizePartition(p.partitionNo).toLowerCase() === normPart);
    if (exact) {
      setPropertyId(exact.propertyId.toString());
      setCategory(exact.category, exact.categoryLabel);
    }
  }, [draft.propertyNo, draft.partitionNo, draft.propertyId, propertiesList, setPropertyId, setCategory]);

  const onWardChangeCommit = useCallback((id: number | null, no: string) => {
    handleWardSelection(id, no);
    setPropertiesList([]);
    setSearchText('');
    setPartitionSearchText('');
    updateUrl({ wardNo: no || null, wardId: id ? id.toString() : null, propertyNo: null, partitionNo: null, propertyId: null });
  }, [handleWardSelection, updateUrl, setPropertiesList]);

  const dynamicPropertyOptions = useMemo<SearchSelectOption[]>(() => propertiesList.map((p) => {
    const trimmed = (p.partitionNo ?? '').trim();
    const norm = trimmed === '0' ? '' : trimmed;
    return {
      label: `${p.propertyNo}${norm ? ` - ${norm}` : ''}`,
      value: JSON.stringify({
        propertyNo: p.propertyNo,
        partitionNo: norm,
        propertyId: p.propertyId,
        category: p.category,
        categoryLabel: p.categoryLabel,
      }),
    };
  }), [propertiesList]);

  const { propertyOptions, propertyOptionValueMap, partitionOptions, partitionValueMap } = usePropertyOptions(draft.propertyNo, dynamicPropertyOptions, propertiesList);

  const propertyId = urlState.propertyId
    ? Number(urlState.propertyId)
    : initialData?.tabHeaderInfo?.propertyId
    ? Number(initialData.tabHeaderInfo.propertyId)
    : initialPropertyMasterData?.propertyId
    ? Number(initialPropertyMasterData.propertyId)
    : null;

  return {
    urlState,
    draft,
    setWardNo,
    setPropertyNo,
    setPartitionNo,
    setPropertyId,
    setCategory,
    onWardChangeCommit,
    wardOptions,
    isFetchingWardOptions,
    handleFetchWardList,
    propertyOptions,
    propertyOptionValueMap,
    partitionOptions,
    partitionValueMap,
    isSearching,
    handleSearchProperty,
    setSearchText,
    setPartitionSearchText,
    isSearchingProperties,
    propertiesList,
    propertyId,
  };
}

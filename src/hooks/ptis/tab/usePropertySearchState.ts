import { useState, useCallback } from 'react';
import type { PropertySearchParams } from '@/types/ptis.types';

export interface PropertySearchState {
  wardNo: string;
  wardId: number | null;
  propertyNo: string;
  partitionNo: string;
  propertyId: string | null;
}

export function usePropertySearchState(urlState: PropertySearchState) {
  const [draft, setDraft] = useState<PropertySearchState>(urlState);
  const [prevUrlState, setPrevUrlState] = useState<PropertySearchState>(urlState);

  // React-recommended pattern for syncing state with props
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const currentUrlKey = JSON.stringify(urlState);
  const prevUrlKey = JSON.stringify(prevUrlState);
  if (currentUrlKey !== prevUrlKey) {
    setPrevUrlState(urlState);
    setDraft(urlState);
  }

  const setWardNo = useCallback((val: string) => {
    setDraft((prev) => ({ ...prev, wardNo: val }));
  }, []);

  const setWardId = useCallback((val: number | null) => {
    setDraft((prev) => ({ ...prev, wardId: val }));
  }, []);

  const setPropertyNo = useCallback((val: string) => {
    setDraft((prev) => ({ ...prev, propertyNo: val }));
  }, []);

  const setPartitionNo = useCallback((val: string) => {
    setDraft((prev) => ({ ...prev, partitionNo: val }));
  }, []);

  const setPropertyId = useCallback((val: string | null) => {
    setDraft((prev) => ({ ...prev, propertyId: val }));
  }, []);

  /**
   * Resets property-level fields when ward changes.
   */
  const handleWardSelection = useCallback((id: number | null, no: string) => {
    setDraft({
      wardId: id,
      wardNo: no,
      propertyNo: '',
      partitionNo: '',
      propertyId: null,
    });
  }, []);

  const getSearchParams = useCallback((): PropertySearchParams => {
    return {
      wardNo: draft.wardNo || undefined,
      wardId: draft.wardId || undefined,
      propertyNo: draft.propertyNo || undefined,
      partitionNo: draft.partitionNo || undefined,
      propertyId: draft.propertyId || undefined,
    };
  }, [draft]);

  return {
    draft,
    setWardNo,
    setWardId,
    setPropertyNo,
    setPartitionNo,
    setPropertyId,
    handleWardSelection,
    getSearchParams,
  };
}

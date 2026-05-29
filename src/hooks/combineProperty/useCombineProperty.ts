import { useMemo } from 'react';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { CombinePropertyItem } from '@/types/combine-property.types';
import { useCombinePropertyFilters } from './useCombinePropertyFilters';
import { useCombinePropertyState } from './useCombinePropertyState';
import { useCombinePropertySubmit } from './useCombinePropertySubmit';

export type SelectionMethod = 'range' | 'individual';

export interface UseCombinePropertyParams {
  basePropertyList: CombinePropertyItem[];
  subPropertyList: CombinePropertyItem[];
  selectedBasePropertyId?: string;
  selectedWardId?: string;
  selectedPropertyNo?: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function useCombinePropertyForm({
  basePropertyList,
  subPropertyList,
  selectedBasePropertyId,
  selectedWardId,
  selectedPropertyNo,
  t,
}: UseCombinePropertyParams) {
  const { confirm } = useConfirm();

  // 1. State Hook
  const state = useCombinePropertyState({ selectedBasePropertyId, t });

  // 2. Filters Hook
  const filters = useCombinePropertyFilters(
    basePropertyList,
    subPropertyList,
    t,
    state.clearState
  );

  const basePartitionNo = useMemo(() => {
    if (!selectedBasePropertyId) return '';
    const prop = basePropertyList.find(p => String(p.id) === selectedBasePropertyId);
    return prop?.fromProperty || '';
  }, [basePropertyList, selectedBasePropertyId]);

  // 3. Submit Hook
  const submit = useCombinePropertySubmit({
    selectedWardId,
    selectedPropertyNo,
    selectedBasePropertyId,
    basePartitionNo,
    submitPropertyNos: filters.searchParams.get('propertyNos') || undefined,
    partitionNo: filters.searchParams.get('partitionNo') || '',
    checkedProperties: state.checkedReviewData,
    selectedPropertyType: state.selectedPropertyType,
    remark: state.remark,
    t,
    setReviewData: state.setReviewData,
    setCheckedPropertyIds: state.setCheckedPropertyIds,
    setIsReviewing: state.setIsReviewing,
    setShowPropertyTypeDropdown: state.setShowPropertyTypeDropdown,
    setRemarkError: state.setRemarkError,
    handleClear: () => {
      state.clearState();
      filters.clearFilters();
    },
    router: filters.router,
    confirm
  });

  const canProceed =
    !!selectedBasePropertyId &&
    (filters.selectionMethod === 'range' 
      ? !!(filters.rangeFrom && filters.rangeTo) && !filters.isRangeInvalid 
      : filters.selectedProperties.length > 0);

  return {
    ...state,
    ...filters,
    ...submit,
    canProceed,
    setRemark: state.handleRemarkChange,
    handleClear: () => {
      state.clearState();
      filters.clearFilters();
    }
  };
}

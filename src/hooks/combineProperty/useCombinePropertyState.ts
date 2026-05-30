import { useState, useCallback, useMemo } from 'react';
import { PropertyCombineDetails } from '@/types/combine-property.types';
import { toast } from 'sonner';

export interface UseCombinePropertyStateParams {
  selectedBasePropertyId?: string;
  t?: (key: string, values?: Record<string, string | number>) => string;
}

export function useCombinePropertyState(params?: UseCombinePropertyStateParams) {
  const { selectedBasePropertyId, t } = params || {};
  const [reviewData, setReviewData] = useState<PropertyCombineDetails[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
  const [checkedPropertyIds, setCheckedPropertyIds] = useState<Set<number>>(new Set());

  const handleRemarkChange = (val: string) => {
    setRemark(val);
    if (val.trim()) setRemarkError(false);
  };

  const clearState = useCallback(() => {
    setReviewData([]);
    setIsReviewing(false);
    setRemark('');
    setRemarkError(false);
    setSelectedPropertyType('');
    setShowPropertyTypeDropdown(false);
    setCheckedPropertyIds(new Set());
  }, []);

  const togglePropertyCheck = useCallback((propertyId: number) => {
    if (selectedBasePropertyId && String(propertyId) === selectedBasePropertyId) {
      const isChecked = checkedPropertyIds.has(propertyId);
      if (isChecked) {
        toast.error(t ? t('cannotUncheckBaseProperty') : 'Cannot uncheck the primary property');
        return;
      }
    }
    setCheckedPropertyIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  }, [selectedBasePropertyId, checkedPropertyIds, t]);

  const toggleAllProperties = useCallback(() => {
    setCheckedPropertyIds((prev) => {
      const allChecked = reviewData.every((d) => prev.has(d.propertyId));
      if (allChecked && reviewData.length > 0) {
        if (selectedBasePropertyId) {
          toast.error(t ? t('cannotUncheckBaseProperty') : 'Cannot uncheck the primary property');
          return new Set([Number(selectedBasePropertyId)]);
        }
        return new Set();
      }
      return new Set([
        ...(selectedBasePropertyId ? [Number(selectedBasePropertyId)] : []),
        ...reviewData.map((d) => d.propertyId)
      ]);
    });
  }, [reviewData, selectedBasePropertyId, t]);

  const checkedReviewData = useMemo(
    () => reviewData.filter((r) => checkedPropertyIds.has(r.propertyId)),
    [reviewData, checkedPropertyIds]
  );
  
  const uniqueOwners = [...new Set(checkedReviewData.map((r) => r.ownerName).filter(Boolean))];
  const hasDifferentOwners = uniqueOwners.length > 1;
  const differentOwnerProps = checkedReviewData
    .filter((r, i) => i > 0 && r.ownerName !== checkedReviewData[0]?.ownerName)
    .map((r) => `Ward No.: ${r.wardNo} Property No.: ${r.propertyNo}`)
    .join(', ');

  return {
    reviewData,
    setReviewData,
    isReviewing,
    setIsReviewing,
    remark,
    remarkError,
    setRemarkError,
    handleRemarkChange,
    selectedPropertyType,
    setSelectedPropertyType,
    showPropertyTypeDropdown,
    setShowPropertyTypeDropdown,
    checkedPropertyIds,
    setCheckedPropertyIds,
    clearState,
    togglePropertyCheck,
    toggleAllProperties,
    checkedReviewData,
    hasDifferentOwners,
    differentOwnerProps,
    checkedCount: checkedPropertyIds.size,
  };
}

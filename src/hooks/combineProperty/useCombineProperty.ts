import { useCallback, useState, useTransition, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CombinePropertyItem, PropertyCombineDetails } from '@/types/combine-property.types';
import { createCombinePropertyAction, fetchPropertyCombineDetailsAction } from '@/app/[locale]/property-tax/ptis/combineproperty/action';
import { useConfirm } from '@/components/common/ConfirmProvider';

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();

  const [reviewData, setReviewData] = useState<PropertyCombineDetails[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remark, setRemark] = useState('');
  const [remarkError, setRemarkError] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);

  // Checkbox selection for review table rows
  const [checkedPropertyIds, setCheckedPropertyIds] = useState<Set<number>>(new Set());

  // Derive state directly from searchParams instead of syncing with useEffect
  const rangeFrom = searchParams.get('from') ?? '';
  const rangeTo = searchParams.get('to') ?? '';
  const selectedProperties = useMemo(
    () => searchParams.get('individual')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  );

  const selectionMethod = (searchParams.get('method') as SelectionMethod) ?? 'range';

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([k, v]) => {
        if (v === undefined || v === '') next.delete(k);
        else next.set(k, v);
      });
      return `${pathname}?${next.toString()}`;
    },
    [pathname, searchParams]
  );

  const calculatePartitionNo = useCallback(
    (method: SelectionMethod, from: string, to: string, individual: string[]) => {
      if (method === 'range' && from && to) {
        const fromIdx = subPropertyList.findIndex((i) => String(i.id) === from);
        const toIdx = subPropertyList.findIndex((i) => String(i.id) === to);
        if (fromIdx === -1 || toIdx === -1) return '';
        const start = Math.min(fromIdx, toIdx);
        const end = Math.max(fromIdx, toIdx);
        const slice = subPropertyList.slice(start, end + 1);
        return slice.map((i) => i.fromProperty).join(',');
      } else if (method === 'individual' && individual.length > 0) {
        const items = subPropertyList.filter((i) => individual.includes(String(i.id)));
        return items.map((i) => i.fromProperty).join(',');
      }
      return '';
    },
    [subPropertyList]
  );

  const handleBasePropertyChange = (_name: string, value: string) => {
    const selected = basePropertyList.find((item) => String(item.id) === value);
    if (!selected) return;
    setReviewData([]);
    setIsReviewing(false);
    router.push(
      buildUrl({
        basePropertyId: String(selected.id),
        wardId: String(selected.wardId),
        wardNo: selected.wardNo,
        propertyNo: selected.propertyNo,
        from: undefined,
        to: undefined,
        individual: undefined,
      })
    );
  };

  const handleMethodChange = (method: SelectionMethod) => {
    setReviewData([]);
    setIsReviewing(false);
    router.push(buildUrl({ method, from: undefined, to: undefined, individual: undefined }));
  };

  const handleRangeFromChange = (_name: string, value: string) => {
    // Clear review state when selection changes
    setReviewData([]);
    setIsReviewing(false);

    // Validate range: if "To" is already selected and comes before the new "From", show error
    if (rangeTo) {
      const fromIdx = subPropertyList.findIndex((i) => String(i.id) === value);
      const toIdx = subPropertyList.findIndex((i) => String(i.id) === rangeTo);
      if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) {
        toast.error(t('rangeInvalidError'));
      }
    }

    const pNo = calculatePartitionNo('range', value, rangeTo, []);
    router.replace(buildUrl({ from: value, partitionNo: pNo }), { scroll: false });
  };

  const handleRangeToChange = (_name: string, value: string) => {
    // Clear review state when selection changes
    setReviewData([]);
    setIsReviewing(false);

    // Validate range: "To" must not come before "From"
    if (rangeFrom) {
      const fromIdx = subPropertyList.findIndex((i) => String(i.id) === rangeFrom);
      const toIdx = subPropertyList.findIndex((i) => String(i.id) === value);
      if (fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx) {
        toast.error(t('rangeInvalidError'));
      }
    }

    const pNo = calculatePartitionNo('range', rangeFrom, value, []);
    router.replace(buildUrl({ to: value, partitionNo: pNo }), { scroll: false });
  };

  const handleIndividualChange = (values: string[]) => {
    // Clear review state when selection changes
    setReviewData([]);
    setIsReviewing(false);
    const pNo = calculatePartitionNo('individual', '', '', values);
    router.replace(buildUrl({ individual: values.join(','), partitionNo: pNo }), { scroll: false });
  };

  const handleClear = () => {
    setReviewData([]);
    setIsReviewing(false);
    setRemark('');
    setRemarkError(false);
    setSelectedPropertyType('');
    setShowPropertyTypeDropdown(false);
    router.push(
      buildUrl({
        basePropertyId: undefined,
        wardId: undefined,
        wardNo: undefined,
        propertyNo: undefined,
        from: undefined,
        to: undefined,
        individual: undefined,
        rangeFromPartition: undefined,
        rangeToPartition: undefined,
      })
    );
  };

  const handleProceed = () => {
    // Race-condition guard
    if (isPending || isSubmitting) return;
    if (!selectedWardId || !selectedPropertyNo) {
      toast.error(t('basePropertyIncomplete'));
      return;
    }
    const partitionNo = searchParams.get('partitionNo') || '';
    if (!partitionNo) {
      toast.error(t('selectAtLeastOne'));
      return;
    }

    startTransition(async () => {
      setIsReviewing(true);
      try {
        const data = await fetchPropertyCombineDetailsAction({
          wardId: Number(selectedWardId),
          propertyNo: selectedPropertyNo,
          partitionNo,
        });
        setReviewData(data);
        // Auto-check all properties by default
        setCheckedPropertyIds(new Set(data.map((d) => d.propertyId)));
      } catch {
        setReviewData([]);
      }
    });
  };

  const togglePropertyCheck = useCallback((propertyId: number) => {
    setCheckedPropertyIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  }, []);

  const toggleAllProperties = useCallback(() => {
    setCheckedPropertyIds((prev) => {
      if (prev.size === reviewData.length) {
        // All are checked → uncheck all
        return new Set();
      }
      // Check all
      return new Set(reviewData.map((d) => d.propertyId));
    });
  }, [reviewData]);

  const handleCombine = async () => {
    // Race-condition guard
    if (isSubmitting || isPending) return;
    if (!selectedBasePropertyId || reviewData.length === 0) return;

    // Only combine checked properties
    const checkedProperties = reviewData.filter((r) => checkedPropertyIds.has(r.propertyId));
    if (checkedProperties.length === 0) {
      toast.error(t('selectAtLeastOneToMerge'));
      return;
    }

    // Check for missing owner name
    const missingOwnerProps = checkedProperties.filter(r => !r.ownerName || r.ownerName.trim() === '');
    if (missingOwnerProps.length > 0) {
      toast.warning(t('missingOwnerError'));
      return;
    }

    // Check Property Type Mismatch
    const uniquePropertyTypeIds = [...new Set(checkedProperties.map((r) => r.propertyTypeId).filter(id => id > 0))];
    const hasPropertyTypeMismatch = uniquePropertyTypeIds.length > 1;

    if (hasPropertyTypeMismatch && !selectedPropertyType) {
      toast.warning(t('propertyTypeMismatchAlert') || 'Selected properties have different property types. Please select a property type from the dropdown to proceed.');
      setShowPropertyTypeDropdown(true);
      return;
    }

    const finalPropertyTypeId = hasPropertyTypeMismatch ? Number(selectedPropertyType) : (uniquePropertyTypeIds[0] || 0);

    const uniqueOwners = [...new Set(checkedProperties.map((r) => r.ownerName).filter(Boolean))];
    const hasDifferentOwnersLocal = uniqueOwners.length > 1;

    if (!remark.trim()) {
      setRemarkError(true);
      return;
    }

    const confirmTitle = hasDifferentOwnersLocal 
      ? (t('confirmCombineDiffOwnerTitle') || 'Owner Names are Different') 
      : t('confirmCombineTitle');
      
    const confirmDesc = hasDifferentOwnersLocal
      ? (t('confirmCombineDiffOwnerDesc') || 'Owner names are different for the selected properties. Do you want to combine? Click Combine to proceed or Cancel to abort.')
      : t('confirmCombineDesc');

    confirm({
      variant: hasDifferentOwnersLocal ? 'destructive' : 'warning',
      title: confirmTitle,
      description: confirmDesc,
      confirmText: t('combine'),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const combinePropertyIds = checkedProperties.map((r) => r.propertyId).join(',');
          const response = await createCombinePropertyAction({
            sourcePropertyId: Number(selectedBasePropertyId),
            combinedPropertyIds: combinePropertyIds,
            combineReason: remark.trim() || t('defaultRemark'),
            overrideOwnerNameMismatch: hasDifferentOwnersLocal,
            propertyTypeId: finalPropertyTypeId,
          });

          if (response.success) {
            toast.success(response.message || t('combineSuccess'));
            setTimeout(() => {
              handleClear();
              router.refresh();
            }, 2000);
          } else {
            toast.error(response.message || t('combineFailed'));
          }
        } catch {
          toast.error(t('unexpectedError'));
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const selectedCount = useMemo(() => {
    if (selectionMethod === 'individual') return selectedProperties.length;
    if (selectionMethod === 'range' && rangeFrom && rangeTo) {
      const fromIdx = subPropertyList.findIndex((i) => String(i.id) === rangeFrom);
      const toIdx = subPropertyList.findIndex((i) => String(i.id) === rangeTo);
      if (fromIdx === -1 || toIdx === -1) return 0;
      return Math.abs(toIdx - fromIdx) + 1;
    }
    return 0;
  }, [selectionMethod, selectedProperties, rangeFrom, rangeTo, subPropertyList]);

  // Check if the range is invalid ("To" comes before "From" in the subPropertyList)
  const isRangeInvalid = useMemo(() => {
    if (selectionMethod !== 'range' || !rangeFrom || !rangeTo) return false;
    const fromIdx = subPropertyList.findIndex((i) => String(i.id) === rangeFrom);
    const toIdx = subPropertyList.findIndex((i) => String(i.id) === rangeTo);
    return fromIdx !== -1 && toIdx !== -1 && toIdx < fromIdx;
  }, [selectionMethod, rangeFrom, rangeTo, subPropertyList]);

  const canProceed =
    !!selectedBasePropertyId &&
    (selectionMethod === 'range' ? !!(rangeFrom && rangeTo) && !isRangeInvalid : selectedProperties.length > 0);

  const checkedReviewData = useMemo(
    () => reviewData.filter((r) => checkedPropertyIds.has(r.propertyId)),
    [reviewData, checkedPropertyIds]
  );
  const uniqueOwners = [...new Set(checkedReviewData.map((r) => r.ownerName).filter(Boolean))];
  const hasDifferentOwners = uniqueOwners.length > 1;
  const differentOwnerProps = reviewData
    .filter((r, i) => i > 0 && r.ownerName !== reviewData[0]?.ownerName)
    .map((r) => `Ward No.: ${r.wardNo} Property No.: ${r.propertyNo}`)
    .join(', ');

  return {
    reviewData,
    isReviewing,
    isPending,
    isSubmitting,
    rangeFrom,
    rangeTo,
    selectedProperties,
    selectionMethod,
    selectedCount,
    canProceed,
    isRangeInvalid,
    checkedPropertyIds,
    checkedCount: checkedPropertyIds.size,
    hasDifferentOwners,
    differentOwnerProps,
    remark,
    remarkError,
    selectedPropertyType,
    showPropertyTypeDropdown,
    setSelectedPropertyType,
    setRemark: (val: string) => {
      setRemark(val);
      if (val.trim()) setRemarkError(false);
    },
    togglePropertyCheck,
    toggleAllProperties,
    handleBasePropertyChange,
    handleMethodChange,
    handleRangeFromChange,
    handleRangeToChange,
    handleIndividualChange,
    handleClear,
    handleProceed,
    handleCombine,
    router,
  };
}

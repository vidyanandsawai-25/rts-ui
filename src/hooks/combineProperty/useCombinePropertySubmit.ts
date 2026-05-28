import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PropertyCombineDetails } from '@/types/combine-property.types';
import { fetchPropertyCombineDetailsAction, createCombinePropertyAction } from '@/app/[locale]/property-tax/ptis/combineproperty/action';
import { ConfirmContextType } from '@/components/common/ConfirmProvider';

interface SubmitHookParams {
  selectedWardId?: string;
  selectedPropertyNo?: string;
  submitPropertyNos?: string;
  selectedBasePropertyId?: string;
  basePartitionNo?: string;
  partitionNo: string;
  checkedProperties: PropertyCombineDetails[];
  selectedPropertyType: string;
  remark: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  setReviewData: (data: PropertyCombineDetails[]) => void;
  setCheckedPropertyIds: (ids: Set<number>) => void;
  setIsReviewing: (val: boolean) => void;
  setShowPropertyTypeDropdown: (val: boolean) => void;
  setRemarkError: (val: boolean) => void;
  handleClear: () => void;
  router: ReturnType<typeof useRouter>;
  confirm: ConfirmContextType['confirm'];
}

export function useCombinePropertySubmit({
  selectedWardId,
  selectedPropertyNo,
  submitPropertyNos,
  selectedBasePropertyId,
  basePartitionNo,
  partitionNo,
  checkedProperties,
  selectedPropertyType,
  remark,
  t,
  setReviewData,
  setCheckedPropertyIds,
  setIsReviewing,
  setShowPropertyTypeDropdown,
  setRemarkError,
  handleClear,
  router,
  confirm
}: SubmitHookParams) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProceed = () => {
    if (isPending || isSubmitting) return;
    if (!selectedWardId || !selectedPropertyNo) {
      toast.error(t('basePropertyIncomplete'));
      return;
    }
    if (!partitionNo && !submitPropertyNos) {
      toast.error(t('selectAtLeastOne'));
      return;
    }

    startTransition(async () => {
      setIsReviewing(true);
      try {
        const allPartitions = new Set(
          [...partitionNo.split(','), basePartitionNo || '0']
            .map(p => p.trim())
            .filter(Boolean)
        );
        let finalPartitionNo = Array.from(allPartitions).join(',');
        
        // If the only partition number collected is '0', it means NO properties have a real partition.
        // In that case, send an empty string so the API just uses PropertyNo.
        if (finalPartitionNo === '0') {
          finalPartitionNo = '';
        }
        
        const allPropertyNos = new Set(
          [...(submitPropertyNos ? submitPropertyNos.split(',') : []), selectedPropertyNo || '']
            .map(p => p.trim())
            .filter(Boolean)
        );
        const finalPropertyNo = Array.from(allPropertyNos).join(',');

        const data = await fetchPropertyCombineDetailsAction({
          wardId: Number(selectedWardId),
          propertyNo: finalPropertyNo,
          partitionNo: finalPartitionNo,
        });
        
        setReviewData(data);
        setCheckedPropertyIds(new Set(data.map((d) => d.propertyId)));
      } catch {
        setReviewData([]);
      }
    });
  };

  const handleCombine = async () => {
    if (isSubmitting || isPending) return;
    if (!selectedBasePropertyId) return;

    if (checkedProperties.length === 0) {
      toast.error(t('selectAtLeastOneToMerge'));
      return;
    }

    const missingOwnerProps = checkedProperties.filter(r => !r.ownerName || r.ownerName.trim() === '');
    if (missingOwnerProps.length > 0) {
      toast.warning(t('missingOwnerError'));
      return;
    }

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
      variant: 'warning',
      title: confirmTitle,
      description: confirmDesc,
      confirmText: t('combine'),
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const combinePropertyIds = checkedProperties
            .filter((r) => String(r.propertyId) !== selectedBasePropertyId)
            .map((r) => r.propertyId)
            .join(',');
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

  return {
    isPending,
    isSubmitting,
    handleProceed,
    handleCombine
  };
}

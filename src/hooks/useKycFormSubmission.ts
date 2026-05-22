import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updatePropertyKycAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Kyc/action';
import { KycDetails, KycFormData, OwnerTypeApiItem } from '@/types/property-kyc.types';
import type { ConfirmContextType } from '@/components/common/ConfirmProvider';
import type { useDigitInputs } from './useDigitInputs';

interface UseKycFormSubmissionProps {
  formData: KycFormData;
  mobileInput: ReturnType<typeof useDigitInputs>;
  aadharInput: ReturnType<typeof useDigitInputs>;
  KycDetailsData?: KycDetails | null;
  OwnerTypeMasterList: OwnerTypeApiItem[];
  locale: string;
  canSubmit: () => boolean;
  setIsSubmitted: (value: boolean) => void;
}

/**
 * Hook for KYC form submission logic
 * 
 * Handles:
 * - Form submission with validation
 * - Confirmation dialog integration
 * - API calls and error handling
 * - Loading states during submission
 * - Success/error toast notifications
 * 
 * @param props - Submission configuration and dependencies
 * @param t - Translation function
 * @param confirm - Confirmation dialog function
 * @param router - Next.js router for page refresh
 * @returns Submission handler and loading state
 */
export const useKycFormSubmission = (
  {
    formData,
    mobileInput,
    aadharInput,
    KycDetailsData,
    OwnerTypeMasterList,
    locale,
    canSubmit,
    setIsSubmitted,
  }: UseKycFormSubmissionProps,
  t: (key: string) => string,
  confirm: ConfirmContextType['confirm'],
  router: { refresh: () => void }
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPending, startTransition] = useTransition();

  /**
   * Handles form submission with validation and confirmation
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // ✅ RACE CONDITION GUARD: Prevent concurrent submissions
    if (isUpdating || isPending) {
      return;
    }
    
    setIsSubmitted(true);

    // Validate property ID
    if (!KycDetailsData?.propertyId) {
      toast.error(t('kyc.propertyIdMissing'));
      return;
    }

    // Validate form data
    if (!canSubmit()) {
      toast.error(t('kyc.validation.pleaseFixErrors'));
      return;
    }

    // Show confirmation dialog before submitting
    confirm({
      variant: 'update',
      meta: {
        name: formData.ownerName || t('kyc.recordLabel'),
        id: KycDetailsData?.propertyId,
      },
      onConfirm: async () => {
        startTransition(async () => {
          setIsUpdating(true);
          try {
            // Find selected owner type name
            const selectedOwnerType =
              formData.ownerTypeId === null
                ? null
                : OwnerTypeMasterList.find(
                    (item) => item.id === formData.ownerTypeId
                  )?.ownerType ?? null;

            // Build API payload
            const payload: KycDetails = {
              propertyId: KycDetailsData.propertyId,
              ownerTypeId: formData.ownerTypeId ?? null,
              ownerType: selectedOwnerType,
              adharCardNo: aadharInput.value || null,
              /** @deprecated Use adharCardNo instead. Retained for backward compatibility. */
              aadharCardNo: aadharInput.value || null,
              mobileNo: mobileInput.value || null,
              emailId: formData.emailId?.trim() || null,
              ownerTitle: formData.ownerTitle?.trim() || null,
              ownerName: formData.ownerName?.trim() || null,
              ownerTitleEnglish: KycDetailsData.ownerTitleEnglish ?? null,
              ownerNameEnglish: KycDetailsData.ownerNameEnglish ?? null,
              occupierTitle: KycDetailsData.occupierTitle ?? null,
              occupierName: formData.occupierName?.trim() || null,
              occupierTitleEnglish: KycDetailsData.occupierTitleEnglish ?? null,
              occupierNameEnglish: KycDetailsData.occupierNameEnglish ?? null,
              flatOrShopName: formData.flatOrShopName?.trim() || null,
              flatOrShopNameEnglish: KycDetailsData.flatOrShopNameEnglish ?? null,
              flatOrShopNo: KycDetailsData.flatOrShopNo ?? null,
              flatOrShopNoEnglish: KycDetailsData.flatOrShopNoEnglish ?? null,
              address: formData.address?.trim() || null,
              location: formData.location?.trim() || null,
              addressEnglish: KycDetailsData.addressEnglish ?? null,
              locationEnglish: KycDetailsData.locationEnglish ?? null,
            };

            // Validate propertyId before API call
            if (KycDetailsData.propertyId == null) {
              throw new Error('Invalid propertyId');
            }

            // Call API to update KYC details
            const res = await updatePropertyKycAction(
              KycDetailsData.propertyId,
              payload,
              locale
            );

            if (res.success) {
              toast.success(res.message);
              setIsSubmitted(false);
              router.refresh();
            } else {
              // Parse error message from API response
              let errorMessage = res.error || t('kyc.unexpectedError');
              try {
                const parsedError = JSON.parse(res.error || '');
                if (parsedError.errors) {
                  errorMessage = Object.values(parsedError.errors).flat().join('\n');
                } else if (parsedError.title) {
                  errorMessage = parsedError.title;
                }
              } catch (_error) {
                // Not a JSON string, use as is
              }
              toast.error(errorMessage);
            }
          } catch (_error) {
            toast.error(t('kyc.unexpectedError'));
          } finally {
            setIsUpdating(false);
          }
        });
      },
    });
  };

  return {
    handleSubmit,
    isUpdating: isUpdating || isPending,
  };
};

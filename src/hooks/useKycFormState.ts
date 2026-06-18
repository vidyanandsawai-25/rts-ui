import { useState, useMemo } from 'react';
import {
  KycDetails,
  KycFormData,
  OwnerTypeApiItem
} from '@/types/property-kyc.types';
import { KYC_VALIDATION_RULES } from '@/lib/utils/kyc-validation/kyc-validation.constants';
import { useDigitInputs } from './useDigitInputs';

/**
 * Hook for managing KYC form state
 * 
 * Handles:
 * - Form data initialization and state management
 * - Digit inputs (mobile and Aadhar)
 * - Owner type options preparation
 * 
 * @param KycDetailsData - Initial KYC details data
 * @param OwnerTypeMasterList - List of available owner types
 * @returns Form state and setters
 */
export const useKycFormState = (
  KycDetailsData?: KycDetails | null,
  OwnerTypeMasterList: OwnerTypeApiItem[] = []
) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState<KycFormData>({
    ownerTypeId: KycDetailsData?.ownerTypeId != null && KycDetailsData?.ownerTypeId !== undefined
      ? KycDetailsData.ownerTypeId
      : null,
    ownerTitle: KycDetailsData?.ownerTitle ?? '',
    ownerName: KycDetailsData?.ownerName ?? '',
    occupierName: KycDetailsData?.occupierName ?? '',
    flatOrShopName: KycDetailsData?.flatOrShopName ?? '',
    emailId: KycDetailsData?.emailId ?? '',
    address: KycDetailsData?.address ?? '',
    location: KycDetailsData?.location ?? '',
  });

  // Digit inputs for mobile and Aadhar card numbers
  const mobileInput = useDigitInputs(
    KYC_VALIDATION_RULES.MOBILE_LENGTH,
    KycDetailsData?.mobileNo ?? ''
  );

  const alternateMobileInput = useDigitInputs(
    KYC_VALIDATION_RULES.MOBILE_LENGTH,
    KycDetailsData?.alternateMobileNo ?? ''
  );

  const aadharInput = useDigitInputs(
    KYC_VALIDATION_RULES.AADHAR_LENGTH,
    KycDetailsData?.adharCardNo ?? KycDetailsData?.aadharCardNo ?? ''
  );

  // Prepare owner type options for select dropdown
  const ownerTypeOptions = useMemo(() =>
    OwnerTypeMasterList.map((item) => ({
      label: item.ownerType,
      value: item.id != null && item.id !== undefined
        ? String(item.id)
        : '',
    })),
    [OwnerTypeMasterList]
  );

  return {
    formData,
    setFormData,
    mobileInput,
    alternateMobileInput,
    aadharInput,
    isSubmitted,
    setIsSubmitted,
    ownerTypeOptions,
  };
};

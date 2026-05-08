import { useCallback, useMemo } from 'react';
import { KycDetails, KycFormData } from '@/types/property-kyc.types';
import { kycValidators } from '@/lib/utils/kyc-validation.constants';
import type { useDigitInputs } from './useDigitInputs';

/**
 * Hook for KYC form validation logic
 * 
 * Handles:
 * - Change detection (comparing current form data with original)
 * - Form validation (checking if all required fields are valid)
 * 
 * @param formData - Current form data
 * @param mobileInput - Mobile number digit input hook instance
 * @param aadharInput - Aadhar number digit input hook instance
 * @param KycDetailsData - Original KYC details for change comparison
 * @returns Validation state and functions
 */
export const useKycFormValidation = (
  formData: KycFormData,
  mobileInput: ReturnType<typeof useDigitInputs>,
  aadharInput: ReturnType<typeof useDigitInputs>,
  KycDetailsData?: KycDetails | null
) => {
  /**
   * Detects if form data has changed from original values
   * Used to enable/disable save button
   */
  const hasChanges = useMemo(() => {
    const normalizeEmail = (email: string | null | undefined) => email?.trim() || null;
    
    return (
      (formData.ownerTypeId ?? null) !== (KycDetailsData?.ownerTypeId ?? null) ||
      (formData.ownerTitle ?? '') !== (KycDetailsData?.ownerTitle ?? '') ||
      (formData.ownerName ?? '') !== (KycDetailsData?.ownerName ?? '') ||
      (formData.occupierName ?? '') !== (KycDetailsData?.occupierName ?? '') ||
      (formData.flatOrShopName ?? '') !== (KycDetailsData?.flatOrShopName ?? '') ||
      normalizeEmail(formData.emailId) !== normalizeEmail(KycDetailsData?.emailId) ||
      (formData.address ?? '') !== (KycDetailsData?.address ?? '') ||
      (formData.location ?? '') !== (KycDetailsData?.location ?? '') ||
      mobileInput.value !== (KycDetailsData?.mobileNo ?? '').replace(/\D/g, '') ||
      aadharInput.value !== ((KycDetailsData?.adharCardNo ?? KycDetailsData?.aadharCardNo) ?? '').replace(/\D/g, '')
    );
  }, [formData, mobileInput.value, aadharInput.value, KycDetailsData]);

  /**
   * Validates all required form fields
   * Returns true if form can be submitted
   */
  const canSubmit = useCallback(() => {
    return (
      kycValidators.isValidName(formData.ownerName ?? '') &&
      kycValidators.isValidEmail(formData.emailId ?? '') &&
      kycValidators.isValidMobile(mobileInput.value) &&
      kycValidators.isValidAadhar(aadharInput.value)
    );
  }, [formData, mobileInput.value, aadharInput.value]);

  return {
    hasChanges,
    canSubmit,
  };
};

import { useCallback, useMemo } from 'react';
import { KycDetails, KycFormData } from '@/types/property-kyc.types';
import { kycValidators, enhancedKycValidators } from '@/lib/utils/kyc-validation/kyc-validation.constants';
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
  alternateMobileInput: ReturnType<typeof useDigitInputs>,
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
      alternateMobileInput.value !== (KycDetailsData?.alternateMobileNo ?? '').replace(/\D/g, '') ||
      aadharInput.value !== ((KycDetailsData?.adharCardNo ?? KycDetailsData?.aadharCardNo) ?? '').replace(/\D/g, '')
    );
  }, [formData, mobileInput.value, alternateMobileInput.value, aadharInput.value, KycDetailsData]);

  /**
   * Validates all required form fields
   * Returns true if form can be submitted
   * Checks for valid email, name, address, mobile, aadhar, shop name, and occupier name formats
   */
  const canSubmit = useCallback(() => {
    const ownerName = formData.ownerName ?? '';
    const email = formData.emailId ?? '';
    const address = formData.address ?? '';
    const shopName = formData.flatOrShopName ?? '';
    const occupierName = formData.occupierName ?? '';

    // Check if owner name exists and is valid
    const isOwnerNameValid = ownerName.trim().length > 0 && kycValidators.isValidName(ownerName);

    // Check if email is either empty (optional) or valid with enhanced validation (strict)
    const isEmailValid = enhancedKycValidators.isValidEmail(email, true);

    // Check if address is valid (can be empty or valid)
    const isAddressValid = enhancedKycValidators.isValidAddress(address);

    // Check if shop name is valid (can be empty or valid, must not contain numbers)
    const isShopNameValid = enhancedKycValidators.isValidShopName(shopName);

    // Check if occupier name is valid (can be empty or valid, must not contain numbers)
    const isOccupierNameValid = enhancedKycValidators.isValidOccupierName(occupierName);

    // Check mobile and aadhar validity
    const isMobileValid = kycValidators.isValidMobile(mobileInput.value);
    const isAlternateMobileValid = kycValidators.isValidMobile(alternateMobileInput.value);
    const isAadharValid = kycValidators.isValidAadhar(aadharInput.value);

    return (
      isOwnerNameValid &&
      isEmailValid &&
      isAddressValid &&
      isShopNameValid &&
      isOccupierNameValid &&
      isMobileValid &&
      isAlternateMobileValid &&
      isAadharValid
    );
  }, [formData, mobileInput.value, alternateMobileInput.value, aadharInput.value]);

  return {
    hasChanges,
    canSubmit,
  };
};

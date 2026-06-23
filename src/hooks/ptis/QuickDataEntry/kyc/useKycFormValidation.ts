import { useCallback, useMemo } from 'react';
import { KycDetails, KycFormData } from '@/types/property-kyc.types';
import { kycValidators, enhancedKycValidators } from '@/lib/utils/kyc-validation/kyc-validation.constants';
import { useDigitInputs } from '@/hooks/useDigitInputs';

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

    const initialOwnerNameEnglish = KycDetailsData?.ownerNameEnglish && KycDetailsData.ownerNameEnglish.trim() !== ''
      ? KycDetailsData.ownerNameEnglish
      : (KycDetailsData?.ownerName ?? '');

    const initialOccupierNameEnglish = KycDetailsData?.occupierNameEnglish && KycDetailsData.occupierNameEnglish.trim() !== ''
      ? KycDetailsData.occupierNameEnglish
      : (KycDetailsData?.occupierName ?? '');

    const initialFlatOrShopNameEnglish = KycDetailsData?.flatOrShopNameEnglish && KycDetailsData.flatOrShopNameEnglish.trim() !== ''
      ? KycDetailsData.flatOrShopNameEnglish
      : (KycDetailsData?.flatOrShopName ?? '');

    const initialAddressEnglish = KycDetailsData?.addressEnglish && KycDetailsData.addressEnglish.trim() !== ''
      ? KycDetailsData.addressEnglish
      : (KycDetailsData?.address ?? '');

    return (
      (formData.ownerTypeId ?? null) !== (KycDetailsData?.ownerTypeId ?? null) ||
      (formData.ownerTitle ?? '') !== (KycDetailsData?.ownerTitle ?? '') ||
      (formData.ownerName ?? '') !== (KycDetailsData?.ownerName ?? '') ||
      (formData.ownerNameEnglish ?? '') !== initialOwnerNameEnglish ||
      (formData.occupierName ?? '') !== (KycDetailsData?.occupierName ?? '') ||
      (formData.occupierNameEnglish ?? '') !== initialOccupierNameEnglish ||
      (formData.flatOrShopName ?? '') !== (KycDetailsData?.flatOrShopName ?? '') ||
      (formData.flatOrShopNameEnglish ?? '') !== initialFlatOrShopNameEnglish ||
      normalizeEmail(formData.emailId) !== normalizeEmail(KycDetailsData?.emailId) ||
      (formData.address ?? '') !== (KycDetailsData?.address ?? '') ||
      (formData.addressEnglish ?? '') !== initialAddressEnglish ||
      (formData.location ?? '') !== (KycDetailsData?.location ?? '') ||
      (formData.pinCode ?? '') !== (KycDetailsData?.pinCode ?? '') ||
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
    const ownerNameEnglish = formData.ownerNameEnglish ?? '';
    const email = formData.emailId ?? '';
    const address = formData.address ?? '';
    const addressEnglish = formData.addressEnglish ?? '';
    const shopName = formData.flatOrShopName ?? '';
    const shopNameEnglish = formData.flatOrShopNameEnglish ?? '';
    const occupierName = formData.occupierName ?? '';
    const occupierNameEnglish = formData.occupierNameEnglish ?? '';
    const pinCode = formData.pinCode ?? '';

    // Check if owner name exists and is valid
    const isOwnerNameValid = ownerName.trim().length > 0 && kycValidators.isValidName(ownerName);
    const isOwnerNameEnglishValid = ownerNameEnglish.trim().length > 0 && kycValidators.isValidName(ownerNameEnglish);

    // Check if email is either empty (optional) or valid with enhanced validation (strict)
    const isEmailValid = enhancedKycValidators.isValidEmail(email, true);

    // Check if address is valid (can be empty or valid)
    const isAddressValid = enhancedKycValidators.isValidAddress(address);
    const isAddressEnglishValid = enhancedKycValidators.isValidAddress(addressEnglish);

    // Check if shop name is valid (can be empty or valid, must not contain numbers)
    const isShopNameValid = enhancedKycValidators.isValidShopName(shopName);
    const isShopNameEnglishValid = enhancedKycValidators.isValidShopName(shopNameEnglish);

    // Check if occupier name is valid (can be empty or valid, must not contain numbers)
    const isOccupierNameValid = enhancedKycValidators.isValidOccupierName(occupierName);
    const isOccupierNameEnglishValid = enhancedKycValidators.isValidOccupierName(occupierNameEnglish);

    // Check if pinCode is valid (optional, but if provided must be exactly 6 digits)
    const isPinCodeValid = !pinCode || /^[0-9]{6}$/.test(pinCode);

    // Check mobile and aadhar validity
    const isMobileValid = kycValidators.isValidMobile(mobileInput.value);
    const isAlternateMobileValid = kycValidators.isValidMobile(alternateMobileInput.value);
    const isAadharValid = kycValidators.isValidAadhar(aadharInput.value);

    return (
      isOwnerNameValid &&
      isOwnerNameEnglishValid &&
      isEmailValid &&
      isAddressValid &&
      isAddressEnglishValid &&
      isShopNameValid &&
      isShopNameEnglishValid &&
      isOccupierNameValid &&
      isOccupierNameEnglishValid &&
      isPinCodeValid &&
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

import { KycFormData } from '@/types/property-kyc.types';
import type { useDigitInputs } from '@/hooks/useDigitInputs';

/**
 * Utility for determining if a form field should display an error state
 * 
 * @param field - The field name to check (can be a KycFormData key or special fields like 'mobile' or 'aadhar')
 * @param isValid - Whether the field's value is currently valid
 * @param formData - The current form data object
 * @param digitInputs - Object containing digit input helpers (mobile and aadhar)
 * @param isSubmitted - Whether the form has been submitted (shows all errors if true)
 * @returns boolean - true if the error should be displayed, false otherwise
 * 
 * @example
 * ```tsx
 * const shouldShowError = getFieldErrorState(
 *   'ownerName',
 *   kycValidators.isValidName(formData.ownerName ?? ''),
 *   formData,
 *   { mobile: mobileInput, aadhar: aadharInput },
 *   isSubmitted
 * );
 * ```
 */
export const getFieldErrorState = (
  field: keyof KycFormData | 'mobile' | 'alternateMobile' | 'aadhar',
  isValid: boolean,
  formData: KycFormData,
  digitInputs: {
    mobile: ReturnType<typeof useDigitInputs>;
    alternateMobile: ReturnType<typeof useDigitInputs>;
    aadhar: ReturnType<typeof useDigitInputs>;
  },
  isSubmitted: boolean = false
): boolean => {
  // If form is submitted, show all validation errors
  if (isSubmitted) return !isValid;

  // For digit inputs (mobile/alternateMobile/aadhar), show error only if user has entered data
  if (field === 'mobile') {
    return digitInputs.mobile.value.length > 0 && !isValid;
  }

  if (field === 'alternateMobile') {
    return digitInputs.alternateMobile.value.length > 0 && !isValid;
  }
  
  if (field === 'aadhar') {
    return digitInputs.aadhar.value.length > 0 && !isValid;
  }

  // For regular form fields, show error only if field has been touched (has value)
  const value = formData[field as keyof KycFormData];
  return !!value && !isValid;
};

/**
 * Factory function to create a showError helper bound to specific form context
 * 
 * @param formData - The current form data
 * @param digitInputs - Object containing digit input helpers
 * @param isSubmitted - Whether the form has been submitted
 * @returns A function that checks if a specific field should show an error
 * 
 * @example
 * ```tsx
 * const showError = createShowErrorHelper(formData, { mobile: mobileInput, alternateMobile: alternateMobileInput, aadhar: aadharInput }, isSubmitted);
 * const hasNameError = showError('ownerName', kycValidators.isValidName(formData.ownerName ?? ''));
 * ```
 */
export const createShowErrorHelper = (
  formData: KycFormData,
  digitInputs: {
    mobile: ReturnType<typeof useDigitInputs>;
    alternateMobile: ReturnType<typeof useDigitInputs>;
    aadhar: ReturnType<typeof useDigitInputs>;
  },
  isSubmitted: boolean = false
) => {
  return (field: keyof KycFormData | 'mobile' | 'alternateMobile' | 'aadhar', isValid: boolean): boolean => {
    return getFieldErrorState(field, isValid, formData, digitInputs, isSubmitted);
  };
};

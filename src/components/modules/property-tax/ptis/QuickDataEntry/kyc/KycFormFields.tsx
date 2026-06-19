import React, { useState } from 'react';
import { KycFormData } from '@/types/property-kyc.types';
import { useDigitInputs } from '@/hooks/useDigitInputs';
import { createShowErrorHelper } from '@/lib/utils/form-validation.utils';
import { PersonalInfoFields } from './PersonalInfoFields';
import { AddressInfoFields } from './AddressInfoFields';
import { ContactInfoFields } from './ContactInfoFields';

interface KycFormFieldsProps {
  t: (key: string) => string;
  formData: KycFormData;
  setFormData: React.Dispatch<React.SetStateAction<KycFormData>>;
  ownerTypeOptions: { label: string; value: string }[];
  mobileInput: ReturnType<typeof useDigitInputs>;
  alternateMobileInput: ReturnType<typeof useDigitInputs>;
  aadharInput: ReturnType<typeof useDigitInputs>;
  isSubmitted?: boolean;
}

export const KycFormFields: React.FC<KycFormFieldsProps> = ({
  t,
  formData,
  setFormData,
  ownerTypeOptions,
  mobileInput,
  alternateMobileInput,
  aadharInput,
  isSubmitted = false,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Use extracted validation utility for better testability
  const baseShowError = createShowErrorHelper(
    formData,
    { mobile: mobileInput, alternateMobile: alternateMobileInput, aadhar: aadharInput },
    isSubmitted
  );

  const showError = (field: keyof KycFormData | 'mobile' | 'alternateMobile' | 'aadhar', isValid: boolean): boolean => {
    if (focusedField === field) return false;
    return baseShowError(field, isValid);
  };

  return (
    <div className="space-y-3">
      {/* Row 1: Personal Info - Owner Type, Title, Property Holder Name, Occupier Name */}
      <div className="grid grid-cols-12 gap-x-4 gap-y-3">
        <PersonalInfoFields
          t={t}
          formData={formData}
          setFormData={setFormData}
          ownerTypeOptions={ownerTypeOptions}
          showError={showError}
          onFocusField={setFocusedField}
          onBlurField={() => setFocusedField(null)}
        />
      </div>

      {/* Row 2: Address & Email Info - Shop Name, Address, Email ID */}
      <div className="grid grid-cols-12 gap-x-4 gap-y-3">
        <AddressInfoFields
          t={t}
          formData={formData}
          setFormData={setFormData}
          showError={showError}
          onFocusField={setFocusedField}
          onBlurField={() => setFocusedField(null)}
        />
      </div>

      {/* Row 3: Contact Info - Aadhar Card No, Mobile No, Alternate Mobile No */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        <ContactInfoFields
          t={t}
          formData={formData}
          setFormData={setFormData}
          mobileInput={mobileInput}
          alternateMobileInput={alternateMobileInput}
          aadharInput={aadharInput}
          showError={showError}
        />
      </div>
    </div>
  );
};
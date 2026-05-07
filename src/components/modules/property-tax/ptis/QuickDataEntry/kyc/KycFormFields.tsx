import React from 'react';
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
  aadharInput: ReturnType<typeof useDigitInputs>;
  isSubmitted?: boolean;
}

export const KycFormFields: React.FC<KycFormFieldsProps> = ({
  t,
  formData,
  setFormData,
  ownerTypeOptions,
  mobileInput,
  aadharInput,
  isSubmitted = false,
}) => {
  // Use extracted validation utility for better testability
  const showError = createShowErrorHelper(
    formData,
    { mobile: mobileInput, aadhar: aadharInput },
    isSubmitted
  );

  return (
    <div className="space-y-3">
      {/* Row 1: Personal Info - Owner Type, Title, Property Holder Name */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        <PersonalInfoFields
          t={t}
          formData={formData}
          setFormData={setFormData}
          ownerTypeOptions={ownerTypeOptions}
          showError={showError}
        />
      </div>

      {/* Row 2: Address Info - Occupier Name, Shop Name, Address, Landmark */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        <AddressInfoFields
          t={t}
          formData={formData}
          setFormData={setFormData}
        />
      </div>

      {/* Row 3: Contact Info - Email ID, Aadhar Card No, Mobile No */}
      <div className="grid gap-x-4 gap-y-3" style={{ gridTemplateColumns: '1fr 2fr 2fr' }}>
        <ContactInfoFields
          t={t}
          formData={formData}
          setFormData={setFormData}
          mobileInput={mobileInput}
          aadharInput={aadharInput}
          showError={showError}
        />
      </div>
    </div>
  );
};


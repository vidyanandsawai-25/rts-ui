import React from 'react';
import { FormFieldGroup } from '@/components/common';
import {
  KYC_VALIDATION_RULES,
  KYC_TITLE_OPTIONS,
  kycValidators,
} from '@/lib/utils/kyc-validation.constants';
import { sanitizeName } from '@/lib/utils/input-sanitization';
import { KycFormData } from '@/types/property-kyc.types';

interface PersonalInfoFieldsProps {
  t: (key: string) => string;
  formData: KycFormData;
  setFormData: React.Dispatch<React.SetStateAction<KycFormData>>;
  ownerTypeOptions: { label: string; value: string }[];
  showError: (field: keyof KycFormData, isValid: boolean) => boolean;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  t,
  formData,
  setFormData,
  ownerTypeOptions,
  showError,
}) => {
  const titleOptions = [...KYC_TITLE_OPTIONS];
  const ownerNameError = showError(
    'ownerName',
    kycValidators.isValidName(formData.ownerName ?? '')
  );

  return (
    <>
      <FormFieldGroup
        type="select"
        id="kyc-ownertype"
        label={t('kyc.ownerType')}
        options={ownerTypeOptions}
        placeholder={t('kyc.select')}
        value={formData.ownerTypeId?.toString() || ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const value = e.target.value;

          setFormData((prev) => ({
            ...prev,
            ownerTypeId: value ? Number(value) : null,
          }));
        }}
        selectSize="sm"
      />

      <FormFieldGroup
        type="select"
        id="kyc-title"
        label={t('kyc.titleLabel')}
        options={titleOptions}
        placeholder={t('kyc.select')}
        value={formData.ownerTitle ?? ''}
        onChange={(_e: React.ChangeEvent<HTMLSelectElement>, selectedValue: string) => {
          setFormData((prev) => ({ ...prev, ownerTitle: selectedValue }));
        }}
        selectSize="sm"
      />

      <div>
        <FormFieldGroup
          type="text"
          id="kyc-ownername"
          label={t('kyc.propertyHolderName')}
          required
          placeholder={t('kyc.enterFullName')}
          value={formData.ownerName ?? ''}
          maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
          hasError={ownerNameError}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize input to remove invalid characters immediately
            const sanitized = sanitizeName(e.target.value);
            if (sanitized.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH) {
              setFormData((prev) => ({ ...prev, ownerName: sanitized }));
            }
          }}
        />
        {ownerNameError && (
          <span className="text-xs text-red-500">
            {!(formData.ownerName ?? '').trim()
              ? t('kyc.errors.ownerNameRequired')
              : (formData.ownerName ?? '').trim().length < KYC_VALIDATION_RULES.NAME_MIN_LENGTH ||
                (formData.ownerName ?? '').trim().length > KYC_VALIDATION_RULES.NAME_MAX_LENGTH
              ? t('society.validation.invalidNameLength')
              : t('kyc.validation.invalidName')}
          </span>
        )}
      </div>
    </>
  );
};

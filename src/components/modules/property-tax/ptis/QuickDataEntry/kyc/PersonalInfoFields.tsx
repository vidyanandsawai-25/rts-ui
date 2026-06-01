import React from 'react';
import { FormFieldGroup, Label, SearchSelect } from '@/components/common';
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
      <div className="space-y-1.5 relative focus-within:z-50">
        <Label htmlFor="kyc-ownertype" className="text-xs font-semibold text-gray-700">
          {t('kyc.ownerType')}
        </Label>
        <SearchSelect
          id="kyc-ownertype"
          name="ownerType"
          options={ownerTypeOptions}
          value={formData.ownerTypeId?.toString() ?? ''}
          placeholder={t('kyc.select')}
          onChange={(_name: string, value: string) => {
            setFormData((prev) => ({
              ...prev,
              ownerTypeId: value ? Number(value) : null,            
            }));
          }}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="space-y-1.5 relative focus-within:z-40">
        <Label htmlFor="kyc-title" className="text-xs font-semibold text-gray-700">
          {t('kyc.titleLabel')}
        </Label>
        <SearchSelect
          id="kyc-title"
          name="title"
          options={titleOptions}
          value={formData.ownerTitle ?? ''}
          placeholder={t('kyc.select')}
          onChange={(_name: string, value: string) => {
            setFormData((prev) => ({ ...prev, ownerTitle: value }));
          }}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

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

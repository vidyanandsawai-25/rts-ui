import React from 'react';
import { FormFieldGroup, Label, SearchSelect } from '@/components/common';
import {
  KYC_VALIDATION_RULES,
  KYC_TITLE_OPTIONS,
  kycValidators,
} from '@/lib/utils/kyc-validation/kyc-validation.constants';
import { sanitizeName, capitalizeEachWord } from '@/lib/utils/input-sanitization';
import { KycFormData } from '@/types/property-kyc.types';

interface PersonalInfoFieldsProps {
  t: (key: string) => string;
  formData: KycFormData;
  setFormData: React.Dispatch<React.SetStateAction<KycFormData>>;
  ownerTypeOptions: { label: string; value: string }[];
  showError: (field: keyof KycFormData, isValid: boolean) => boolean;
  onFocusField: (field: keyof KycFormData) => void;
  onBlurField: () => void;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  t,
  formData,
  setFormData,
  ownerTypeOptions,
  showError,
  onFocusField,
  onBlurField,
}) => {
  const titleOptions = [...KYC_TITLE_OPTIONS];
  const ownerNameError = showError(
    'ownerName',
    kycValidators.isValidName(formData.ownerName ?? '')
  );
  const ownerNameEnglishError = showError(
    'ownerNameEnglish',
    kycValidators.isValidName(formData.ownerNameEnglish ?? '')
  );

  return (
    <>
      {/* Owner Category */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2 space-y-1.5 relative focus-within:z-50">
        <Label htmlFor="kyc-ownertype" className="text-xs font-semibold text-gray-700">
          {t('kyc.ownerType')}
        </Label>
        <SearchSelect
          id="kyc-ownertype"
          name="ownerType"
          options={ownerTypeOptions}
          value={formData.ownerTypeId?.toString() ?? ''}
          placeholder={t('kyc.select')}
          onChange={(_name, value) => {
            setFormData((prev) => ({
              ...prev,
              ownerTypeId: value ? Number(value) : null,
            }));
          }}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Title */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2 space-y-1.5 relative focus-within:z-40">
        <Label htmlFor="kyc-title" className="text-xs font-semibold text-gray-700">
          {t('kyc.titleLabel')}
        </Label>
        <SearchSelect
          id="kyc-title"
          name="title"
          options={titleOptions}
          value={formData.ownerTitle ?? ''}
          placeholder={t('kyc.select')}
          onChange={(_name, value) => {
            setFormData((prev) => ({ ...prev, ownerTitle: value }));
          }}
          className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Property Holder Name Regional */}
      <div className="col-span-12 sm:col-span-6 md:col-span-4">
        <FormFieldGroup
          type="text"
          id="kyc-ownername"
          label={t('kyc.propertyHolderNameMarathi')}
          required
          placeholder={t('kyc.enterFullNameMarathi')}
          value={formData.ownerName ?? ''}
          maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
          hasError={ownerNameError}
          onFocus={() => onFocusField('ownerName')}
          onBlur={onBlurField}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize input to remove invalid characters immediately
            const sanitized = sanitizeName(e.target.value);
            const capitalized = capitalizeEachWord(sanitized);
            if (capitalized.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH) {
              setFormData((prev) => ({ ...prev, ownerName: capitalized }));
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

      {/* Property Holder Name English */}
      <div className="col-span-12 sm:col-span-6 md:col-span-4">
        <FormFieldGroup
          type="text"
          id="kyc-ownername-english"
          label={t('kyc.propertyHolderNameEnglish')}
          required
          placeholder={t('kyc.enterFullNameEnglish')}
          value={formData.ownerNameEnglish ?? ''}
          maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
          hasError={ownerNameEnglishError}
          onFocus={() => onFocusField('ownerNameEnglish')}
          onBlur={onBlurField}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize input to remove invalid characters immediately
            const sanitized = sanitizeName(e.target.value);
            const capitalized = capitalizeEachWord(sanitized);
            if (capitalized.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH) {
              setFormData((prev) => ({ ...prev, ownerNameEnglish: capitalized }));
            }
          }}
        />
        {ownerNameEnglishError && (
          <span className="text-xs text-red-500">
            {!(formData.ownerNameEnglish ?? '').trim()
              ? t('kyc.errors.ownerNameRequired')
              : (formData.ownerNameEnglish ?? '').trim().length < KYC_VALIDATION_RULES.NAME_MIN_LENGTH ||
                (formData.ownerNameEnglish ?? '').trim().length > KYC_VALIDATION_RULES.NAME_MAX_LENGTH
                ? t('society.validation.invalidNameLength')
                : t('kyc.validation.invalidName')}
          </span>
        )}
      </div>
    </>
  );
};

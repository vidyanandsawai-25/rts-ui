import React from 'react';
import { FormFieldGroup, Label, SearchSelect, Input } from '@/components/common';
import {
  KYC_VALIDATION_RULES,
  KYC_TITLE_OPTIONS,
  kycValidators,
  enhancedKycValidators,
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

  return (
    <>
      <div className="col-span-2 space-y-1.5 relative focus-within:z-50">
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

      <div className="col-span-2 space-y-1.5 relative focus-within:z-40">
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

      <div className="col-span-4">
        <FormFieldGroup
          type="text"
          id="kyc-ownername"
          label={t('kyc.propertyHolderName')}
          required
          placeholder={t('kyc.enterFullName')}
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

      <div className="col-span-4 space-y-1.5">
        <Label htmlFor="kyc-occupier" className="text-xs font-semibold text-gray-700">
          {t('kyc.occupierName')}
        </Label>
        <Input
          type="text"
          id="kyc-occupier"
          placeholder={t('kyc.enterOccupierName')}
          value={formData.occupierName ?? ''}
          maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${showError('occupierName', enhancedKycValidators.isValidOccupierName(formData.occupierName ?? ''))
            ? 'border-red-300 focus:border-red-500'
            : ''
            }`}
          onFocus={() => onFocusField('occupierName')}
          onBlur={onBlurField}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize to remove invalid characters and numbers immediately
            const sanitized = sanitizeName(e.target.value);
            const capitalized = capitalizeEachWord(sanitized);
            if (capitalized.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH) {
              setFormData((prev) => ({ ...prev, occupierName: capitalized }));
            }
          }}
        />
        {showError('occupierName', enhancedKycValidators.isValidOccupierName(formData.occupierName ?? '')) && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidName')}
          </span>
        )}
      </div>
    </>
  );
};

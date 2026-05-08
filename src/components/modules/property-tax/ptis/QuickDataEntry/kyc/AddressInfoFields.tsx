import React from 'react';
import { FormFieldGroup } from '@/components/common';
import { KYC_VALIDATION_RULES } from '@/lib/utils/kyc-validation.constants';
import { sanitizeName, sanitizeTextInput, sanitizeAddress } from '@/lib/utils/input-sanitization';
import { KycFormData } from '@/types/property-kyc.types';

interface AddressInfoFieldsProps {
  t: (key: string) => string;
  formData: KycFormData;
  setFormData: React.Dispatch<React.SetStateAction<KycFormData>>;
}

export const AddressInfoFields: React.FC<AddressInfoFieldsProps> = ({
  t,
  formData,
  setFormData,
}) => {
  return (
    <>
      <FormFieldGroup
        type="text"
        id="kyc-occupier"
        label={t('kyc.occupierName')}
        placeholder={t('kyc.enterOccupierName')}
        value={formData.occupierName ?? ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const sanitized = sanitizeName(e.target.value);
          setFormData((prev) => ({ ...prev, occupierName: sanitized }));
        }}
      />

      <FormFieldGroup
        type="text"
        id="kyc-shopname"
        label={t('kyc.shopName')}
        placeholder={t('kyc.enterShopName')}
        value={formData.flatOrShopName ?? ''}
        maxLength={KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const sanitized = sanitizeTextInput(e.target.value);
          if (sanitized.length <= KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH) {
            setFormData((prev) => ({ ...prev, flatOrShopName: sanitized }));
          }
        }}
      />

      <FormFieldGroup
        type="text"
        id="kyc-address"
        label={t('kyc.address')}
        placeholder={t('kyc.enterAddress')}
        value={formData.address ?? ''}
        maxLength={KYC_VALIDATION_RULES.ADDRESS_MAX_LENGTH}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const sanitized = sanitizeAddress(e.target.value);
          setFormData((prev) => ({
            ...prev,
            address: sanitized.slice(0, KYC_VALIDATION_RULES.ADDRESS_MAX_LENGTH),
          }));
        }}
      />
    </>
  );
};

import React from 'react';
import { Input } from '@/components/common';
import { Label } from '@/components/common/label';
import { KYC_VALIDATION_RULES, enhancedKycValidators } from '@/lib/utils/kyc-validation.constants';
import { sanitizeName, sanitizeAddress } from '@/lib/utils/input-sanitization';
import { KycFormData } from '@/types/property-kyc.types';
import { useTranslations } from 'next-intl';

interface AddressInfoFieldsProps {
  t: (key: string) => string;
  formData: KycFormData;
  setFormData: React.Dispatch<React.SetStateAction<KycFormData>>;
  showError: (field: keyof KycFormData, isValid: boolean) => boolean;
}

export const AddressInfoFields: React.FC<AddressInfoFieldsProps> = ({
  t,
  formData,
  setFormData,
  showError,
}) => {
  
  const t2 = useTranslations('quickDataEntry');
  
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="kyc-occupier" className="text-xs font-semibold text-gray-700">
          {t('kyc.occupierName')}
        </Label>
        <Input
          type="text"
          id="kyc-occupier"
          placeholder={t('kyc.enterOccupierName')}
          value={formData.occupierName ?? ''}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${
            showError('occupierName', enhancedKycValidators.isValidOccupierName(formData.occupierName ?? ''))
              ? 'border-red-300 focus:border-red-500'
              : ''
          }`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize to remove invalid characters and numbers immediately
            const sanitized = sanitizeName(e.target.value);
            setFormData((prev) => ({ ...prev, occupierName: sanitized }));
          }}
        />
        {showError('occupierName', enhancedKycValidators.isValidOccupierName(formData.occupierName ?? '')) && (
          <span className="text-xs text-red-500">
            {t2('kyc.validation.invalidName')}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kyc-shopname" className="text-xs font-semibold text-gray-700">
          {t('kyc.shopName')}
        </Label>
        <Input
          type="text"
          id="kyc-shopname"
          placeholder={t('kyc.enterShopName')}
          value={formData.flatOrShopName ?? ''}
          maxLength={KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${
            showError('flatOrShopName', enhancedKycValidators.isValidShopName(formData.flatOrShopName ?? ''))
              ? 'border-red-300 focus:border-red-500'
              : ''
          }`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize to remove invalid characters and numbers immediately
            const sanitized = sanitizeName(e.target.value);
            if (sanitized.length <= KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH) {
              setFormData((prev) => ({ ...prev, flatOrShopName: sanitized }));
            }
          }}
        />
        {showError('flatOrShopName', enhancedKycValidators.isValidShopName(formData.flatOrShopName ?? '')) && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidName')}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="kyc-address" className="text-xs font-semibold text-gray-700">
          {t('kyc.address')}
        </Label>
        <Input
          type="text"
          id="kyc-address"
          placeholder={t('kyc.enterAddress')}
          value={formData.address ?? ''}
          maxLength={KYC_VALIDATION_RULES.ADDRESS_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${
            showError('address', enhancedKycValidators.isValidAddress(formData.address ?? ''))
              ? 'border-red-300 focus:border-red-500'
              : ''
          }`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize to remove invalid characters immediately
            const sanitized = sanitizeAddress(e.target.value);
            setFormData((prev) => ({
              ...prev,
              address: sanitized.slice(0, KYC_VALIDATION_RULES.ADDRESS_MAX_LENGTH),
            }));
          }}
        />
        {showError('address', enhancedKycValidators.isValidAddress(formData.address ?? '')) && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidAddress')}
          </span>
        )}
      </div>
    </>
  );
};

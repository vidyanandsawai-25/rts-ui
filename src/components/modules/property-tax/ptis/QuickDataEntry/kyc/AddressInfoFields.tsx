import React from 'react';
import { Input } from '@/components/common';
import { Label } from '@/components/common/label';
import { KYC_VALIDATION_RULES, enhancedKycValidators } from '@/lib/utils/kyc-validation/kyc-validation.constants';
import { sanitizeAddress, sanitizeShopName, capitalizeEachWord, sanitizeEmailStrict } from '@/lib/utils/input-sanitization';
import { KycFormData } from '@/types/property-kyc.types';

interface AddressInfoFieldsProps {
  t: (key: string) => string;
  formData: KycFormData;
  setFormData: React.Dispatch<React.SetStateAction<KycFormData>>;
  showError: (field: keyof KycFormData, isValid: boolean) => boolean;
  onFocusField: (field: keyof KycFormData) => void;
  onBlurField: () => void;
}

export const AddressInfoFields: React.FC<AddressInfoFieldsProps> = ({
  t,
  formData,
  setFormData,
  showError,
  onFocusField,
  onBlurField,
}) => {

  return (
    <>
      <div className="col-span-3 space-y-1.5">
        <Label htmlFor="kyc-shopname" className="text-xs font-semibold text-gray-700">
          {t('kyc.shopName')}
        </Label>
        <Input
          type="text"
          id="kyc-shopname"
          placeholder={t('kyc.enterShopName')}
          value={formData.flatOrShopName ?? ''}
          maxLength={KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${showError('flatOrShopName', enhancedKycValidators.isValidShopName(formData.flatOrShopName ?? ''))
            ? 'border-red-300 focus:border-red-500'
            : ''
            }`}
          onFocus={() => onFocusField('flatOrShopName')}
          onBlur={onBlurField}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize to remove invalid characters, allowing realistic shop names with numbers and symbols
            const sanitized = sanitizeShopName(e.target.value);
            const capitalized = capitalizeEachWord(sanitized);
            if (capitalized.length <= KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH) {
              setFormData((prev) => ({ ...prev, flatOrShopName: capitalized }));
            }
          }}
        />
        {showError('flatOrShopName', enhancedKycValidators.isValidShopName(formData.flatOrShopName ?? '')) && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidName')}
          </span>
        )}
      </div>


      <div className="col-span-3 space-y-1.5">
        <Label htmlFor="kyc-email" className="text-xs font-semibold text-gray-700">
          {t('kyc.emailId')}
        </Label>
        <Input
          id="kyc-email"
          type="email"
          placeholder={t('kyc.enterEmailId')}
          value={formData.emailId ?? ''}
          maxLength={KYC_VALIDATION_RULES.EMAIL_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${showError('emailId', enhancedKycValidators.isValidEmail(formData.emailId ?? '', true))
            ? 'border-red-300 focus:border-red-500'
            : ''
            }`}
          onFocus={() => onFocusField('emailId')}
          onBlur={onBlurField}
          onChange={(e) => {
            const sanitized = sanitizeEmailStrict(e.target.value);
            setFormData((prev) => ({ ...prev, emailId: sanitized }));
          }}
        />
        {showError('emailId', enhancedKycValidators.isValidEmail(formData.emailId ?? '', true)) && (
          <span className="text-xs text-red-500">{t('kyc.validation.invalidEmail')}</span>
        )}
      </div>

      <div className="col-span-4 space-y-1.5">
        <Label htmlFor="kyc-address" className="text-xs font-semibold text-gray-700">
          {t('kyc.address')}
        </Label>
        <Input
          type="text"
          id="kyc-address"
          placeholder={t('kyc.enterAddress')}
          value={formData.address ?? ''}
          maxLength={KYC_VALIDATION_RULES.ADDRESS_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${showError('address', enhancedKycValidators.isValidAddress(formData.address ?? ''))
            ? 'border-red-300 focus:border-red-500'
            : ''
            }`}
          onFocus={() => onFocusField('address')}
          onBlur={onBlurField}
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

      <div className="col-span-2 space-y-1.5">
        <Label htmlFor="kyc-pincode" className="text-xs font-bold text-gray-700">
          {t('kyc.pinCode')}
        </Label>
        <Input
          id="kyc-pincode"
          type="text"
          placeholder={t('kyc.enterPinCode')}
          value={formData.pinCode ?? ''}
          maxLength={6}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${showError('pinCode', !formData.pinCode || /^[0-9]{6}$/.test(formData.pinCode))
            ? 'border-red-300 focus:border-red-500'
            : ''
            }`}
          onFocus={() => onFocusField('pinCode')}
          onBlur={onBlurField}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/\D/g, '').slice(0, 6);
            setFormData((prev) => ({ ...prev, pinCode: sanitized }));
          }}
        />
        {showError('pinCode', !formData.pinCode || /^[0-9]{6}$/.test(formData.pinCode)) && (
          <span className="text-xs text-red-500">{t('kyc.validation.invalidPinCode')}</span>
        )}
      </div>
    </>
  );
};

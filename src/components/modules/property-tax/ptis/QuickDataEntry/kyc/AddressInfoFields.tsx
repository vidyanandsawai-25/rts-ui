import React from 'react';
import { Input } from '@/components/common';
import { Label } from '@/components/common/label';
import { KYC_VALIDATION_RULES, enhancedKycValidators } from '@/lib/utils/kyc-validation/kyc-validation.constants';
import { sanitizeAddress, sanitizeShopName, capitalizeEachWord, sanitizeEmailStrict, sanitizeName } from '@/lib/utils/input-sanitization';
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
  const shopNameError = showError(
    'flatOrShopName',
    enhancedKycValidators.isValidShopName(formData.flatOrShopName ?? '')
  );
  const shopNameEnglishError = showError(
    'flatOrShopNameEnglish',
    enhancedKycValidators.isValidShopName(formData.flatOrShopNameEnglish ?? '')
  );
  const occupierNameError = showError(
    'occupierName',
    enhancedKycValidators.isValidOccupierName(formData.occupierName ?? '')
  );
  const occupierNameEnglishError = showError(
    'occupierNameEnglish',
    enhancedKycValidators.isValidOccupierName(formData.occupierNameEnglish ?? '')
  );
  const emailIdError = showError(
    'emailId',
    enhancedKycValidators.isValidEmail(formData.emailId ?? '', true)
  );
  const addressError = showError(
    'address',
    enhancedKycValidators.isValidAddress(formData.address ?? '')
  );
  const addressEnglishError = showError(
    'addressEnglish',
    enhancedKycValidators.isValidAddress(formData.addressEnglish ?? '')
  );
  const pinCodeError = showError(
    'pinCode',
    !formData.pinCode || /^[0-9]{6}$/.test(formData.pinCode)
  );

  return (
    <>
      {/* Occupier Name Regional */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3 space-y-1.5">
        <Label htmlFor="kyc-occupier" className="text-xs font-semibold text-gray-700">
          {t('kyc.occupierNameMarathi')}
        </Label>
        <Input
          type="text"
          id="kyc-occupier"
          placeholder={t('kyc.enterOccupierNameMarathi')}
          value={formData.occupierName ?? ''}
          maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${occupierNameError ? 'border-red-300 focus:border-red-500' : ''}`}
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
        {occupierNameError && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidName')}
          </span>
        )}
      </div>

      {/* Occupier Name English */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3 space-y-1.5">
        <Label htmlFor="kyc-occupier-english" className="text-xs font-semibold text-gray-700">
          {t('kyc.occupierNameEnglish')}
        </Label>
        <Input
          type="text"
          id="kyc-occupier-english"
          placeholder={t('kyc.enterOccupierNameEnglish')}
          value={formData.occupierNameEnglish ?? ''}
          maxLength={KYC_VALIDATION_RULES.NAME_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${occupierNameEnglishError ? 'border-red-300 focus:border-red-500' : ''}`}
          onFocus={() => onFocusField('occupierNameEnglish')}
          onBlur={onBlurField}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize to remove invalid characters and numbers immediately
            const sanitized = sanitizeName(e.target.value);
            const capitalized = capitalizeEachWord(sanitized);
            if (capitalized.length <= KYC_VALIDATION_RULES.NAME_MAX_LENGTH) {
              setFormData((prev) => ({ ...prev, occupierNameEnglish: capitalized }));
            }
          }}
        />
        {occupierNameEnglishError && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidName')}
          </span>
        )}
      </div>

      {/* Shop Name Regional */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3 space-y-1.5">
        <Label htmlFor="kyc-shopname" className="text-xs font-semibold text-gray-700">
          {t('kyc.shopNameMarathi')}
        </Label>
        <Input
          type="text"
          id="kyc-shopname"
          placeholder={t('kyc.enterShopNameMarathi')}
          value={formData.flatOrShopName ?? ''}
          maxLength={KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${shopNameError ? 'border-red-300 focus:border-red-500' : ''}`}
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
        {shopNameError && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidName')}
          </span>
        )}
      </div>

      {/* Shop Name English */}
      <div className="col-span-12 sm:col-span-6 md:col-span-3 space-y-1.5">
        <Label htmlFor="kyc-shopname-english" className="text-xs font-semibold text-gray-700">
          {t('kyc.shopNameEnglish')}
        </Label>
        <Input
          type="text"
          id="kyc-shopname-english"
          placeholder={t('kyc.enterShopNameEnglish')}
          value={formData.flatOrShopNameEnglish ?? ''}
          maxLength={KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${shopNameEnglishError ? 'border-red-300 focus:border-red-500' : ''}`}
          onFocus={() => onFocusField('flatOrShopNameEnglish')}
          onBlur={onBlurField}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize to remove invalid characters, allowing realistic shop names with numbers and symbols
            const sanitized = sanitizeShopName(e.target.value);
            const capitalized = capitalizeEachWord(sanitized);
            if (capitalized.length <= KYC_VALIDATION_RULES.SHOP_NAME_MAX_LENGTH) {
              setFormData((prev) => ({ ...prev, flatOrShopNameEnglish: capitalized }));
            }
          }}
        />
        {shopNameEnglishError && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidName')}
          </span>
        )}
      </div>

      {/* Address Regional */}
      <div className="col-span-12 sm:col-span-6 md:col-span-4 space-y-1.5">
        <Label htmlFor="kyc-address" className="text-xs font-semibold text-gray-700">
          {t('kyc.addressMarathi')}
        </Label>
        <Input
          type="text"
          id="kyc-address"
          placeholder={t('kyc.enterAddressMarathi')}
          value={formData.address ?? ''}
          maxLength={KYC_VALIDATION_RULES.ADDRESS_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${addressError ? 'border-red-300 focus:border-red-500' : ''}`}
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
        {addressError && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidAddress')}
          </span>
        )}
      </div>

      {/* Address English */}
      <div className="col-span-12 sm:col-span-6 md:col-span-4 space-y-1.5">
        <Label htmlFor="kyc-address-english" className="text-xs font-semibold text-gray-700">
          {t('kyc.addressEnglish')}
        </Label>
        <Input
          type="text"
          id="kyc-address-english"
          placeholder={t('kyc.enterAddressEnglish')}
          value={formData.addressEnglish ?? ''}
          maxLength={KYC_VALIDATION_RULES.ADDRESS_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${addressEnglishError ? 'border-red-300 focus:border-red-500' : ''}`}
          onFocus={() => onFocusField('addressEnglish')}
          onBlur={onBlurField}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Sanitize to remove invalid characters immediately
            const sanitized = sanitizeAddress(e.target.value);
            setFormData((prev) => ({
              ...prev,
              addressEnglish: sanitized.slice(0, KYC_VALIDATION_RULES.ADDRESS_MAX_LENGTH),
            }));
          }}
        />
        {addressEnglishError && (
          <span className="text-xs text-red-500">
            {t('kyc.validation.invalidAddress')}
          </span>
        )}
      </div>

      {/* Pin Code */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2 space-y-1.5">
        <Label htmlFor="kyc-pincode" className="text-xs font-bold text-gray-700">
          {t('kyc.pinCode')}
        </Label>
        <Input
          id="kyc-pincode"
          type="text"
          placeholder={t('kyc.enterPinCode')}
          value={formData.pinCode ?? ''}
          maxLength={6}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${pinCodeError ? 'border-red-300 focus:border-red-500' : ''}`}
          onFocus={() => onFocusField('pinCode')}
          onBlur={onBlurField}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/\D/g, '').slice(0, 6);
            setFormData((prev) => ({ ...prev, pinCode: sanitized }));
          }}
        />
        {pinCodeError && (
          <span className="text-xs text-red-500">{t('kyc.validation.invalidPinCode')}</span>
        )}
      </div>

      {/* Email ID */}
      <div className="col-span-12 sm:col-span-6 md:col-span-2 space-y-1.5">
        <Label htmlFor="kyc-email" className="text-xs font-semibold text-gray-700">
          {t('kyc.emailId')}
        </Label>
        <Input
          id="kyc-email"
          type="email"
          placeholder={t('kyc.enterEmailId')}
          value={formData.emailId ?? ''}
          maxLength={KYC_VALIDATION_RULES.EMAIL_MAX_LENGTH}
          className={`h-9 text-sm border-gray-300 focus:border-gray-600 focus:ring-2 focus:ring-gray-200 ${emailIdError ? 'border-red-300 focus:border-red-500' : ''}`}
          onFocus={() => onFocusField('emailId')}
          onBlur={onBlurField}
          onChange={(e) => {
            const sanitized = sanitizeEmailStrict(e.target.value);
            setFormData((prev) => ({ ...prev, emailId: sanitized }));
          }}
        />
        {emailIdError && (
          <span className="text-xs text-red-500">{t('kyc.validation.invalidEmail')}</span>
        )}
      </div>
    </>
  );
};

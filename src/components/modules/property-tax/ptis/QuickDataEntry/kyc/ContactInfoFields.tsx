import React from 'react';
import { Input } from '@/components/common';
import { Label } from '@/components/common/label';
import { KYC_VALIDATION_RULES, kycValidators, enhancedKycValidators } from '@/lib/utils/kyc-validation.constants';
import { sanitizeEmailStrict } from '@/lib/utils/input-sanitization';
import { KycFormData } from '@/types/property-kyc.types';
import { useDigitInputs } from '@/hooks/useDigitInputs';

interface ContactInfoFieldsProps {
  t: (key: string) => string;
  formData: KycFormData;
  setFormData: React.Dispatch<React.SetStateAction<KycFormData>>;
  mobileInput: ReturnType<typeof useDigitInputs>;
  aadharInput: ReturnType<typeof useDigitInputs>;
  showError: (field: keyof KycFormData | 'mobile' | 'aadhar', isValid: boolean) => boolean;
}

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({
  t,
  formData,
  setFormData,
  mobileInput,
  aadharInput,
  showError,
}) => {
  return (
    <>
      {/* Email ID */}
      <div className="space-y-1.5">
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
          onChange={(e) => {
            const sanitized = sanitizeEmailStrict(e.target.value);
            setFormData((prev) => ({ ...prev, emailId: sanitized }));
          }}
        />
        {showError('emailId', enhancedKycValidators.isValidEmail(formData.emailId ?? '', true)) && (
          <span className="text-xs text-red-500">{t('kyc.validation.invalidEmail')}</span>
        )}
      </div>

      {/* Aadhar Card No */}
      <div className="space-y-1.5">
        <Label htmlFor="kyc-aadhar-0" className="text-xs font-semibold text-gray-700">
          {t('kyc.aadharCardNo')}
        </Label>
        <div className={`flex items-center gap-1 px-1 bg-white border rounded-md h-9 focus-within:ring-1 ${showError('aadhar', kycValidators.isValidAadhar(aadharInput.value))
          ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-300'
          : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-300'
          }`}>
          {[0, 1, 2].map((groupIndex) => (
            <React.Fragment key={`group-fg-${groupIndex}`}>
              <div className="flex gap-0.5 flex-1 h-full items-center">
                {Array.from({ length: 4 }).map((_, i) => {
                  const index = groupIndex * 4 + i;
                  return (
                    <Input
                      key={index}
                      id={index === 0 ? 'kyc-aadhar-0' : undefined}
                      aria-label={`${t('kyc.aadharCardNo')} digit ${index + 1} of 12`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]"
                      value={aadharInput.digits[index]}
                      onChange={(e) => aadharInput.handleChange(index, e.target.value)}
                      onKeyDown={(e) => aadharInput.handleKeyDown(index, e)}
                      ref={aadharInput.setRef(index)}
                      naked
                      error={showError('aadhar', kycValidators.isValidAadhar(aadharInput.value)) ? 'error' : undefined}
                      className={`flex-1 min-w-0 w-full h-7 text-center text-xs font-semibold text-gray-900 border rounded bg-white outline-none focus:ring-1 ${showError('aadhar', kycValidators.isValidAadhar(aadharInput.value))
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-300'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'
                        }`}
                    />
                  );
                })}
              </div>
              {groupIndex < 2 && <span className="text-gray-400 font-bold text-xs shrink-0">-</span>}
            </React.Fragment>
          ))}
        </div>
        {showError('aadhar', kycValidators.isValidAadhar(aadharInput.value)) && (
          <span className="text-xs text-red-500">
            {aadharInput.value && kycValidators.hasRepeatedSequence(aadharInput.value.replace(/\D/g, ''), 5)
              ? t('kyc.validation.invalidRepeatedSequence')
              : (aadharInput.value && (aadharInput.value.replace(/\D/g, '').startsWith('0') || aadharInput.value.replace(/\D/g, '').startsWith('1')))
                ? t('kyc.validation.invalidAadharStart')
                : t('kyc.validation.invalidAadhar')}
          </span>
        )}
      </div>

      {/* Mobile No */}
      <div className="space-y-1.5">
        <Label htmlFor="kyc-mobile-0" className="text-xs font-semibold text-gray-700">
          {t('kyc.mobileNo')}
        </Label>
        <div className={`flex items-center gap-1 px-1 bg-white border rounded-md h-9 focus-within:ring-1 ${showError('mobile', kycValidators.isValidMobile(mobileInput.value))
          ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-300'
          : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-300'
          }`}>
          <span className="flex items-center justify-center px-1.5 text-[10px] text-gray-600 font-semibold bg-gray-100 border border-gray-200 rounded h-7 shrink-0">
            +91
          </span>
          <div className="flex gap-0.5 flex-1 h-full items-center">
            {Array.from({ length: KYC_VALIDATION_RULES.MOBILE_LENGTH }).map((_, i) => (
              <Input
                key={i}
                id={i === 0 ? 'kyc-mobile-0' : undefined}
                aria-label={`${t('kyc.mobileNo')} digit ${i + 1} of 10`}
                type="text"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]"
                value={mobileInput.digits[i]}
                onChange={(e) => mobileInput.handleChange(i, e.target.value)}
                onKeyDown={(e) => mobileInput.handleKeyDown(i, e)}
                ref={mobileInput.setRef(i)}
                naked
                error={showError('mobile', kycValidators.isValidMobile(mobileInput.value)) ? 'error' : undefined}
                className={`flex-1 min-w-0 w-full h-7 text-center text-xs font-semibold text-gray-900 border rounded bg-white outline-none focus:ring-1 ${showError('mobile', kycValidators.isValidMobile(mobileInput.value))
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
                  }`}
              />
            ))}
          </div>
        </div>
        {showError('mobile', kycValidators.isValidMobile(mobileInput.value)) && (
          <span className="text-xs text-red-500">
            {mobileInput.value && kycValidators.hasRepeatedSequence(mobileInput.value.replace(/\D/g, ''), 5)
              ? t('kyc.validation.invalidRepeatedSequence')
              : (mobileInput.value && !/^[6-9]/.test(mobileInput.value.replace(/\D/g, '')))
                ? t('kyc.validation.invalidMobileStart')
                : t('kyc.validation.invalidMobile')}
          </span>
        )}
      </div>

    </>
  );
};

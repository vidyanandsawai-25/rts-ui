import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { SOCIETY_VALIDATION_RULES, societyValidators } from '@/lib/utils/kyc-validation.constants';
import { sanitizeEmailStrict, sanitizeName } from '@/lib/utils/input-sanitization';
import { useDigitInputs } from '@/hooks/useDigitInputs';

interface SocietyContactFieldsProps {
    t: (key: string) => string;
    managerMobileInput: ReturnType<typeof useDigitInputs>;
    secretaryMobileInput: ReturnType<typeof useDigitInputs>;
    managerEmail: string;
    setManagerEmail: (email: string) => void;
    secretaryEmail: string;
    setSecretaryEmail: (email: string) => void;
    managerName: string;
    setManagerName: (name: string) => void;
    secretaryName: string;
    setSecretaryName: (name: string) => void;
    showError: (
        field: 'managerMobile' | 'secretaryMobile' | 'managerEmail' | 'secretaryEmail' | 'societyEmail' |
               'landOwnerName' | 'builderName' | 'societyName' | 'managerName' | 'secretaryName',
        isValid: boolean
    ) => boolean;
}

export const SocietyContactFields = ({
    t,
    managerMobileInput,
    secretaryMobileInput,
    managerEmail,
    setManagerEmail,
    secretaryEmail,
    setSecretaryEmail,
    managerName,
    setManagerName,
    secretaryName,
    setSecretaryName,
    showError,
}: SocietyContactFieldsProps) => {
    const getMobileErrorMessage = (value: string): string => {
        const digits = value.replace(/\D/g, '');
        if (digits.length === 0) return '';
        if (!/^[6-9]/.test(digits)) {
            return t('kyc.validation.invalidMobileStart') || 'Mobile number must start with 6 to 9.';
        }
        if (digits.length !== 10) {
            return t('kyc.validation.invalidMobile') || 'Mobile number must be exactly 10 digits.';
        }
        return '';
    };

    return (
        <>
            {/* Manager Details */}
            <div className="space-y-1.5">
                <Label htmlFor="manager-name" className="text-xs font-semibold text-gray-700">{t('society.managerName')}</Label>
                <Input
                    id="manager-name"
                    value={managerName}
                    placeholder={t('society.managerNamePlaceholder')}
                    maxLength={SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH}
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${
                        showError('managerName', !managerName || societyValidators.isValidPersonName(managerName))
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        // Sanitize to remove invalid characters immediately
                        const sanitized = sanitizeName(e.target.value);
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH) {
                            setManagerName(sanitized);
                        }
                    }}
                />
                {showError('managerName', !managerName || societyValidators.isValidPersonName(managerName)) && (
                    <span className="text-xs text-red-500">
                        {t('kyc.validation.invalidName') || 'Invalid name. Cannot contain only special characters.'}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="manager-email" className="text-xs font-semibold text-gray-700">{t('society.managerEmail')}</Label>
                <Input
                    id="manager-email"
                    type="email"
                    placeholder={t('society.managerEmailPlaceholder')}
                    value={managerEmail}
                    maxLength={SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH}
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${showError('managerEmail', societyValidators.isValidEmail(managerEmail))
                        ? 'border-red-300 focus:border-red-500'
                        : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizeEmailStrict(e.target.value);
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH) {
                            setManagerEmail(sanitized);
                        }
                    }}
                />
                {showError('managerEmail', societyValidators.isValidEmail(managerEmail)) && (
                    <span className="text-xs text-red-500">{t('kyc.validation.invalidEmail')}</span>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="manager-mobile-0" className="text-xs font-semibold text-gray-700">
                    {t('society.managerMobileNo')}
                </Label>
                <div className={`flex items-center gap-1 px-1 bg-white border rounded-md h-9 focus-within:ring-1 ${showError('managerMobile', societyValidators.isValidMobile(managerMobileInput.value))
                    ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-300'
                    : 'border-purple-200 focus-within:border-purple-500 focus-within:ring-purple-200'
                }`}>
                    <span className="flex items-center justify-center px-1.5 text-[10px] text-gray-600 font-semibold bg-gray-100 border border-gray-200 rounded h-7 shrink-0">
                        +91
                    </span>
                    <div id="manager-mobile-container" className="flex gap-0.5 flex-1 h-full items-center">
                        {Array.from({ length: SOCIETY_VALIDATION_RULES.MOBILE_LENGTH }).map((_, i) => (
                            <Input
                                key={i}
                                id={i === 0 ? 'manager-mobile-0' : undefined}
                                aria-label={`${t('society.managerMobileNo')} digit ${i + 1} of 10`}
                                type="text"
                                maxLength={1}
                                inputMode="numeric"
                                pattern="[0-9]"
                                value={managerMobileInput.digits[i]}
                                onChange={(e) => managerMobileInput.handleChange(i, e.target.value)}
                                onKeyDown={(e) => managerMobileInput.handleKeyDown(i, e)}
                                ref={managerMobileInput.setRef(i)}
                                naked
                                className={`flex-1 min-w-0 w-full h-7 text-center text-xs font-semibold text-gray-900 border rounded bg-white outline-none focus:ring-1 ${showError('managerMobile', societyValidators.isValidMobile(managerMobileInput.value))
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-300'
                                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
                {showError('managerMobile', societyValidators.isValidMobile(managerMobileInput.value)) && (
                    <span className="text-xs text-red-500">{getMobileErrorMessage(managerMobileInput.value)}</span>
                )}
            </div>

            {/* Secretary Details */}
            <div className="space-y-1.5">
                <Label htmlFor="secretary-name" className="text-xs font-semibold text-gray-700">{t('society.secretaryName')}</Label>
                <Input
                    id="secretary-name"
                    value={secretaryName}
                    placeholder={t('society.secretaryNamePlaceholder')}
                    maxLength={SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH}
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${
                        showError('secretaryName', !secretaryName || societyValidators.isValidPersonName(secretaryName))
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        // Sanitize to remove invalid characters immediately
                        const sanitized = sanitizeName(e.target.value);
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH) {
                            setSecretaryName(sanitized);
                        }
                    }}
                />
                {showError('secretaryName', !secretaryName || societyValidators.isValidPersonName(secretaryName)) && (
                    <span className="text-xs text-red-500">
                        {t('kyc.validation.invalidName') || 'Invalid name. Cannot contain only special characters.'}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="secretary-email" className="text-xs font-semibold text-gray-700">{t('society.secretaryEmail')}</Label>
                <Input
                    id="secretary-email"
                    type="email"
                    placeholder={t('society.secretaryEmailPlaceholder')}
                    value={secretaryEmail}
                    maxLength={SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH}
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${showError('secretaryEmail', societyValidators.isValidEmail(secretaryEmail))
                        ? 'border-red-300 focus:border-red-500'
                        : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizeEmailStrict(e.target.value);
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH) {
                            setSecretaryEmail(sanitized);
                        }
                    }}
                />
                {showError('secretaryEmail', societyValidators.isValidEmail(secretaryEmail)) && (
                    <span className="text-xs text-red-500">{t('kyc.validation.invalidEmail')}</span>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="secretary-mobile-0" className="text-xs font-semibold text-gray-700">
                    {t('society.secretaryMobile')}
                </Label>
                <div className={`flex items-center gap-1 px-1 bg-white border rounded-md h-9 focus-within:ring-1 ${showError('secretaryMobile', societyValidators.isValidMobile(secretaryMobileInput.value))
                    ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-300'
                    : 'border-purple-200 focus-within:border-purple-500 focus-within:ring-purple-200'
                }`}>
                    <span className="flex items-center justify-center px-1.5 text-[10px] text-gray-600 font-semibold bg-gray-100 border border-gray-200 rounded h-7 shrink-0">
                        +91
                    </span>
                    <div id="secretary-mobile-container" className="flex gap-0.5 flex-1 h-full items-center">
                        {Array.from({ length: SOCIETY_VALIDATION_RULES.MOBILE_LENGTH }).map((_, i) => (
                            <Input
                                key={i}
                                id={i === 0 ? 'secretary-mobile-0' : undefined}
                                aria-label={`${t('society.secretaryMobile')} digit ${i + 1} of 10`}
                                type="text"
                                maxLength={1}
                                inputMode="numeric"
                                pattern="[0-9]"
                                value={secretaryMobileInput.digits[i]}
                                onChange={(e) => secretaryMobileInput.handleChange(i, e.target.value)}
                                onKeyDown={(e) => secretaryMobileInput.handleKeyDown(i, e)}
                                ref={secretaryMobileInput.setRef(i)}
                                naked
                                className={`flex-1 min-w-0 w-full h-7 text-center text-xs font-semibold text-gray-900 border rounded bg-white outline-none focus:ring-1 ${showError('secretaryMobile', societyValidators.isValidMobile(secretaryMobileInput.value))
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-300'
                                    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
                {showError('secretaryMobile', societyValidators.isValidMobile(secretaryMobileInput.value)) && (
                    <span className="text-xs text-red-500">{getMobileErrorMessage(secretaryMobileInput.value)}</span>
                )}
            </div>
        </>
    );
};

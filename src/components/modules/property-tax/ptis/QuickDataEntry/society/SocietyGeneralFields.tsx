import { Input, SearchSelect } from "@/components/common";
import { Label } from "@/components/common/label";
import { societyValidators, SOCIETY_VALIDATION_RULES, propertyValidators } from '@/lib/utils/kyc-validation.constants';
import { sanitizeEmailStrict, sanitizeName, sanitizeAddress } from '@/lib/utils/input-sanitization';
import { useTranslations } from "next-intl";

interface SocietyGeneralFieldsProps {
    societyEmail: string;
    setSocietyEmail: (email: string) => void;
    landOwnerName: string;
    setLandOwnerName: (name: string) => void;
    builderName: string;
    setBuilderName: (name: string) => void;
    societyName: string;
    setSocietyName: (name: string) => void;
    societyAddress: string;
    setSocietyAddress: (address: string) => void;
    wingId: number | null;
    wingOptions: { label: string; value: string }[];
    handleWingChange: (name: string | undefined, value: string) => void;
    showError: (
        field: 'managerMobile' | 'secretaryMobile' | 'managerEmail' | 'secretaryEmail' | 'societyEmail' |
            'landOwnerName' | 'builderName' | 'societyName' | 'managerName' | 'secretaryName' | 'societyAddress',
        isValid: boolean
    ) => boolean;
}

export const SocietyGeneralFields = ({
    // t,
    societyEmail,
    setSocietyEmail,
    landOwnerName,
    setLandOwnerName,
    builderName,
    setBuilderName,
    societyName,
    setSocietyName,
    societyAddress,
    setSocietyAddress,
    wingId,
    wingOptions,
    handleWingChange,
    showError,
}: SocietyGeneralFieldsProps) => {

    const t = useTranslations('quickDataEntry');

    return (
        <>
            {/* Row 1: Land Owner | Builder Name | Building/Society Name */}
            <div className="space-y-1.5">
                <Label htmlFor="land-owner-name" className="text-xs font-semibold text-gray-700">
                    {t('society.landOwner')}
                </Label>
                <Input
                    id="land-owner-name"
                    value={landOwnerName}
                    placeholder={t('society.landOwnerPlaceholder')}
                    maxLength={SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH}
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${showError('landOwnerName', !landOwnerName || societyValidators.isValidPersonName(landOwnerName))
                        ? 'border-red-300 focus:border-red-500'
                        : ''
                        }`}
                    onChange={(e) => {
                        // Sanitize to remove invalid characters immediately
                        const sanitized = sanitizeName(e.target.value);
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH) {
                            setLandOwnerName(sanitized);
                        }
                    }}
                />
                {showError('landOwnerName', !landOwnerName || societyValidators.isValidPersonName(landOwnerName)) && (
                    <span className="text-xs text-red-500">
                        {landOwnerName && (landOwnerName.trim().length < SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH || landOwnerName.trim().length > SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH)
                            ? t('society.validation.invalidNameLength')
                            : t('kyc.validation.invalidName')}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="builder-name" className="text-xs font-semibold text-gray-700">
                    {t('society.builderName')}
                </Label>
                <Input
                    id="builder-name"
                    value={builderName}
                    placeholder={t('society.builderNamePlaceholder')}
                    maxLength={SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH}
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${showError('builderName', !builderName || societyValidators.isValidPersonName(builderName))
                        ? 'border-red-300 focus:border-red-500'
                        : ''
                        }`}
                    onChange={(e) => {
                        // Sanitize to remove invalid characters immediately
                        const sanitized = sanitizeName(e.target.value);
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH) {
                            setBuilderName(sanitized);
                        }
                    }}
                />
                {showError('builderName', !builderName || societyValidators.isValidPersonName(builderName)) && (
                    <span className="text-xs text-red-500">
                        {builderName && (builderName.trim().length < SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH || builderName.trim().length > SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH)
                            ? t('society.validation.invalidNameLength')
                            : t('kyc.validation.invalidName')}
                    </span>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="society-name" className="text-xs font-semibold text-gray-700">
                    {t('society.buildingSocietyName')}
                </Label>
                <Input
                    id="society-name"
                    value={societyName}
                    placeholder={t('society.buildingSocietyNamePlaceholder')}
                    maxLength={SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH}
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${showError('societyName', !societyName || societyValidators.isValidSocietyName(societyName))
                        ? 'border-red-300 focus:border-red-500'
                        : ''
                        }`}
                    onChange={(e) => {
                        // Sanitize to remove invalid characters immediately
                        const sanitized = sanitizeName(e.target.value);
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH) {
                            setSocietyName(sanitized);
                        }
                    }}
                />
                {showError('societyName', !societyName || societyValidators.isValidSocietyName(societyName)) && (
                    <span className="text-xs text-red-500">
                        {societyName && (societyName.trim().length < SOCIETY_VALIDATION_RULES.NAME_MIN_LENGTH || societyName.trim().length > SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH)
                            ? t('society.validation.invalidNameLength')
                            : t('kyc.validation.invalidName')}
                    </span>
                )}
            </div>

            {/* Wing Field */}
            <div className="space-y-1.5">
                <Label htmlFor="society-wing" className="text-xs font-semibold text-gray-700">
                    {t('society.wing')}
                </Label>
                <SearchSelect
                    name="wing"
                    options={wingOptions}
                    value={wingId?.toString() ?? ''}
                    placeholder={t('society.select') || 'Select Wing'}
                    onChange={handleWingChange}
                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
            </div>

            {/* Row 2: Society Email & Society Address (side by side) */}
            <div className="col-span-3 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="society-email" className="text-xs font-semibold text-gray-700">
                        {t('society.societyEmail')}
                    </Label>
                    <Input
                        id="society-email"
                        type="email"
                        placeholder={t('society.societyEmailPlaceholder')}
                        value={societyEmail}
                        maxLength={SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH}
                        className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${showError('societyEmail', societyValidators.isValidEmail(societyEmail))
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                            }`}
                        onChange={(e) => {
                            const sanitized = sanitizeEmailStrict(e.target.value);
                            if (sanitized.length <= SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH) {
                                setSocietyEmail(sanitized);
                            }
                        }}
                    />
                    {showError('societyEmail', societyValidators.isValidEmail(societyEmail)) && (
                        <span className="text-xs text-red-500">{t('society.validation.societyEmail')}</span>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="society-address" className="text-xs font-semibold text-gray-700">
                        {t('society.societyAddress')}
                    </Label>
                    <Input
                        id="society-address"
                        name="societyAddress"
                        value={societyAddress}
                        placeholder={t('society.societyAddressPlaceholder')}
                        maxLength={SOCIETY_VALIDATION_RULES.ADDRESS_MAX_LENGTH}
                        className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${showError('societyAddress', !societyAddress || propertyValidators.isValidAddress(societyAddress))
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                            }`}
                        onChange={(e) => {
                            // Sanitize to remove invalid characters immediately
                            const sanitized = sanitizeAddress(e.target.value);
                            if (sanitized.length <= SOCIETY_VALIDATION_RULES.ADDRESS_MAX_LENGTH) {
                                setSocietyAddress(sanitized);
                            }
                        }}
                    />
                    {showError('societyAddress', !societyAddress || propertyValidators.isValidAddress(societyAddress)) && (
                        <span className="text-xs text-red-500">
                            {t('society.validation.societyAddress')}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
};

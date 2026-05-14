import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { PropertySocietyDetailsApiItem } from "@/types/property-society-details.types";
import { kycValidators, SOCIETY_VALIDATION_RULES } from '@/lib/utils/kyc-validation.constants';
import { sanitizeEmail, sanitizeName } from '@/lib/utils/input-sanitization';

interface SocietyGeneralFieldsProps {
    t: (key: string) => string;
    societyData: PropertySocietyDetailsApiItem | null;
    societyEmail: string;
    setSocietyEmail: (email: string) => void;
    landOwnerName: string;
    setLandOwnerName: (name: string) => void;
    builderName: string;
    setBuilderName: (name: string) => void;
    societyName: string;
    setSocietyName: (name: string) => void;
    showError: (
        field: 'managerMobile' | 'secretaryMobile' | 'managerEmail' | 'secretaryEmail' | 'societyEmail' |
               'landOwnerName' | 'builderName' | 'societyName' | 'managerName' | 'secretaryName',
        isValid: boolean
    ) => boolean;
}

export const SocietyGeneralFields = ({ 
    t, 
    societyData,
    societyEmail,
    setSocietyEmail,
    landOwnerName,
    setLandOwnerName,
    builderName,
    setBuilderName,
    societyName,
    setSocietyName,
    showError,
}: SocietyGeneralFieldsProps) => {
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
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${
                        showError('landOwnerName', !landOwnerName || kycValidators.isValidName(landOwnerName))
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizeName(e.target.value.trimStart());
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH) {
                            setLandOwnerName(sanitized);
                        }
                    }}
                />
                {showError('landOwnerName', !landOwnerName || kycValidators.isValidName(landOwnerName)) && (
                    <span className="text-xs text-red-500">{t('kyc.validation.invalidName')}</span>
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
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${
                        showError('builderName', !builderName || kycValidators.isValidName(builderName))
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizeName(e.target.value.trimStart());
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.PERSON_NAME_MAX_LENGTH) {
                            setBuilderName(sanitized);
                        }
                    }}
                />
                {showError('builderName', !builderName || kycValidators.isValidName(builderName)) && (
                    <span className="text-xs text-red-500">{t('kyc.validation.invalidName')}</span>
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
                    className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${
                        showError('societyName', !societyName || kycValidators.isValidName(societyName))
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizeName(e.target.value.trimStart());
                        if (sanitized.length <= SOCIETY_VALIDATION_RULES.SOCIETY_NAME_MAX_LENGTH) {
                            setSocietyName(sanitized);
                        }
                    }}
                />
                {showError('societyName', !societyName || kycValidators.isValidName(societyName)) && (
                    <span className="text-xs text-red-500">{t('kyc.validation.invalidName')}</span>
                )}
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
                        className={`h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 ${showError('societyEmail', kycValidators.isValidEmail(societyEmail))
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                        }`}
                        onChange={(e) => {
                            const sanitized = sanitizeEmail(e.target.value);
                            if (sanitized.length <= SOCIETY_VALIDATION_RULES.EMAIL_MAX_LENGTH) {
                                setSocietyEmail(sanitized);
                            }
                        }}
                    />
                    {showError('societyEmail', kycValidators.isValidEmail(societyEmail)) && (
                        <span className="text-xs text-red-500">{t('kyc.validation.invalidEmail')}</span>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                        {t('society.societyAddress')}
                    </Label>
                    <Input
                        name="societyAddress"
                        defaultValue={societyData?.societyAddress ?? ''}
                        placeholder={t('society.societyAddressPlaceholder')}
                        maxLength={SOCIETY_VALIDATION_RULES.ADDRESS_MAX_LENGTH}
                        className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                </div>
            </div>
        </>
    );
};

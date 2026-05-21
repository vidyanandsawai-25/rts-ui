import { Input, SearchSelect } from '@/components/common';
import { Label } from '@/components/common/label';
import { PropertyBasicDetailsApiItem, TaxZoneItem } from '@/types/property-basic-details.types';
import { sanitizeSurveyNo, sanitizeSubZoneNo, sanitizePositiveInteger } from '@/lib/utils/input-sanitization';
import { propertyValidators, PROPERTY_VALIDATION_RULES } from '@/lib/utils/kyc-validation.constants';
import { useState, useMemo } from 'react';

interface AdditionalPropertyFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
    taxZones: TaxZoneItem[];
}

export const AdditionalPropertyFields = ({
    t,
    propertyData,
    taxZones,
}: AdditionalPropertyFieldsProps) => {
    const [taxZoneId, setTaxZoneId] = useState(propertyData?.taxZoneId ? String(propertyData.taxZoneId) : '');
    const [taxZoneNo, setTaxZoneNo] = useState(propertyData?.taxZoneNo?.toString() ?? '');
    const [surveyNo, setSurveyNo] = useState(propertyData?.surveyNo ?? '');
    const [subZoneNo, setSubZoneNo] = useState(propertyData?.subZoneNo ?? '');
    const [residentialToilets, setResidentialToilets] = useState(propertyData?.noOfResidentialToilets?.toString() ?? '');
    const [commercialToilets, setCommercialToilets] = useState(propertyData?.noOfCommercialToilets?.toString() ?? '');
    
    const [showTaxZoneNoError, setShowTaxZoneNoError] = useState(false);
    const [showSurveyNoError, setShowSurveyNoError] = useState(false);
    const [showSubZoneNoError, setShowSubZoneNoError] = useState(false);
    const [showResidentialToiletsError, setShowResidentialToiletsError] = useState(false);
    const [showCommercialToiletsError, setShowCommercialToiletsError] = useState(false);

    const taxZoneOptions = useMemo(() => {
        return (taxZones ?? [])
            .filter((z) => z.isActive)
            .map((z) => ({
                label: z.taxZoneNo,
                value: String(z.id)
            }));
    }, [taxZones]);

    const handleTaxZoneChange = (_name: string | undefined, value: string) => {
        setTaxZoneId(value);
        const selected = taxZones.find(z => String(z.id) === value);
        if (selected) {
            setTaxZoneNo(selected.taxZoneNo);
        } else {
            setTaxZoneNo('');
        }
        setShowTaxZoneNoError(true);
    };

    return (
        <>
            {/* Tax Zone No */}
            <div className="space-y-1.5 relative focus-within:z-50">
                <Label htmlFor="pd-taxzone" className="text-xs font-semibold text-gray-700">
                    {t('property.taxZoneNo')}
                </Label>
                <SearchSelect
                    id="pd-taxzone"
                    options={taxZoneOptions}
                    placeholder={t('property.selectTaxZonePlaceholder') || 'Select Tax Zone'}
                    value={taxZoneId}
                    onChange={handleTaxZoneChange}
                    className={`h-9 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        showTaxZoneNoError && !taxZoneId
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                />
                <input type="hidden" name="taxZoneId" value={taxZoneId} />
                <input type="hidden" name="taxZoneNo" value={taxZoneNo} />
                {showTaxZoneNoError && !taxZoneId && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.taxZoneNoRequired')}
                    </span>
                )}
            </div>

            {/* Survey No */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-survey" className="text-xs font-semibold text-gray-700">
                    {t('property.surveyNo')}
                </Label>
                <Input
                    id="pd-survey"
                    name="surveyNo"
                    placeholder="45/2B"
                    value={surveyNo}
                    maxLength={PROPERTY_VALIDATION_RULES.SURVEY_NO_MAX_LENGTH}
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        showSurveyNoError && !propertyValidators.isValidSurveyNo(surveyNo)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizeSurveyNo(e.target.value);
                        setSurveyNo(sanitized);
                        if (sanitized) setShowSurveyNoError(true);
                    }}
                    onBlur={() => setShowSurveyNoError(true)}
                />
                {showSurveyNoError && !propertyValidators.isValidSurveyNo(surveyNo) && (
                    <span className="text-xs text-red-500">
                    {t('property.validation.invalidSurveyNo') }
                    </span>
                )}
            </div>

            {/* Sub Zone No */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-subzone" className="text-xs font-semibold text-gray-700">
                    {t('property.subZoneNo')}
                </Label>
                <Input
                    id="pd-subzone"
                    name="subZoneNo"
                    placeholder="SZ-12"
                    value={subZoneNo}
                    maxLength={PROPERTY_VALIDATION_RULES.SUB_ZONE_NO_MAX_LENGTH}
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        showSubZoneNoError && !propertyValidators.isValidSubZoneNo(subZoneNo)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizeSubZoneNo(e.target.value);
                        setSubZoneNo(sanitized);
                        if (sanitized) setShowSubZoneNoError(true);
                    }}
                    onBlur={() => setShowSubZoneNoError(true)}
                />
                {showSubZoneNoError && !propertyValidators.isValidSubZoneNo(subZoneNo) && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.invalidSubZoneNo')}
                    </span>
                )}
            </div>

            {/* UPIC ID */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-upic" className="text-xs font-extrabold text-gray-700">
                    {t('property.upicId')}
                </Label>
                <Input
                    id="pd-upic"
                    name="upicId"
                    readOnly
                    placeholder="UPIC2024001234"
                    defaultValue={propertyData?.upicId ?? ''}
                    // className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
            </div>

            {/* Residential Toilet */}
            <div className="space-y-1.5">
                <Label
                    htmlFor="pd-residentialtoilet"
                    className="text-xs font-semibold text-gray-700"
                >
                    {t('property.residentialToilet')}
                </Label>
                <Input
                    id="pd-residentialtoilet"
                    name="noOfResidentialToilets"
                    type="number"
                    min="0"
                    step="1"
                    value={residentialToilets}
                    placeholder="0"
                    maxLength={PROPERTY_VALIDATION_RULES.RESIDENTIAL_TOILET_MAX_LENGTH}
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        showResidentialToiletsError && !propertyValidators.isValidPositiveNumber(residentialToilets)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Prevent negative values
                        if (value && parseFloat(value) < 0) return;
                        const sanitized = sanitizePositiveInteger(value);
                        // Limit to 2 digits (max 99)
                        const limited = sanitized.slice(0, PROPERTY_VALIDATION_RULES.RESIDENTIAL_TOILET_MAX_LENGTH);
                        setResidentialToilets(limited);
                        if (limited) setShowResidentialToiletsError(true);
                    }}
                    onKeyDown={(e) => {
                        // Prevent negative sign, decimal point, and 'e' character
                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                            e.preventDefault();
                        }
                    }}
                    onBlur={() => setShowResidentialToiletsError(true)}
                />
                {showResidentialToiletsError && !propertyValidators.isValidPositiveNumber(residentialToilets) && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.invalidResidentialToilets')}
                    </span>
                )}
            </div>

            {/* Commercial Toilet */}
            <div className="space-y-1.5">
                <Label
                    htmlFor="pd-commercialtoilet"
                    className="text-xs font-semibold text-gray-700"
                >
                    {t('property.commercialToilet')}
                </Label>
                <Input
                    id="pd-commercialtoilet"
                    name="noOfCommercialToilets"
                    type="number"
                    min="0"
                    step="1"
                    value={commercialToilets}
                    placeholder="0"
                    maxLength={PROPERTY_VALIDATION_RULES.COMMERCIAL_TOILET_MAX_LENGTH}
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        showCommercialToiletsError && !propertyValidators.isValidPositiveNumber(commercialToilets)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Prevent negative values
                        if (value && parseFloat(value) < 0) return;
                        const sanitized = sanitizePositiveInteger(value);
                        // Limit to 2 digits (max 99)
                        const limited = sanitized.slice(0, PROPERTY_VALIDATION_RULES.COMMERCIAL_TOILET_MAX_LENGTH);
                        setCommercialToilets(limited);
                        if (limited) setShowCommercialToiletsError(true);
                    }}
                    onKeyDown={(e) => {
                        // Prevent negative sign, decimal point, and 'e' character
                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                            e.preventDefault();
                        }
                    }}
                    onBlur={() => setShowCommercialToiletsError(true)}
                />
                {showCommercialToiletsError && !propertyValidators.isValidPositiveNumber(commercialToilets) && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.invalidCommercialToilets')}
                    </span>
                )}
            </div>
        </>
    );
};

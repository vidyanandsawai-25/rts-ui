import { useState, useMemo } from 'react';
import { Input, SearchSelect } from '@/components/common';
import { Label } from '@/components/common/label';
import {
    PropertyBasicDetailsApiItem,
    TaxZoneItem
} from '@/types/property-basic-details.types';
import {
    sanitizeSurveyNo,
    sanitizeSubZoneNo,
    sanitizePlotArea
} from '@/lib/utils/input-sanitization';
import {
    propertyValidators,
    PROPERTY_VALIDATION_RULES
} from '@/lib/utils/kyc-validation/kyc-validation.constants';
interface AdditionalPropertyFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
    taxZones: TaxZoneItem[];
    checkFormChanges: () => void;
}

export const AdditionalPropertyFields = ({
    t,
    propertyData,
    taxZones,
    checkFormChanges,
}: AdditionalPropertyFieldsProps) => {
    const [taxZoneId, setTaxZoneId] = useState(propertyData?.taxZoneId ? String(propertyData.taxZoneId) : '');
    const [taxZoneNo, setTaxZoneNo] = useState(propertyData?.taxZoneNo?.toString() ?? '');
    const [surveyNo, setSurveyNo] = useState(propertyData?.surveyNo ?? '');
    const [subZoneNo, setSubZoneNo] = useState(propertyData?.subZoneNo ?? '');
    const [plotArea, setPlotArea] = useState(propertyData?.plotArea?.toString() ?? '');

    const [showTaxZoneNoError, setShowTaxZoneNoError] = useState(false);
    const [showSurveyNoError, setShowSurveyNoError] = useState(false);
    const [showSubZoneNoError, setShowSubZoneNoError] = useState(false);
    const [showPlotAreaError, setShowPlotAreaError] = useState(false);

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
        // Manually trigger change detection since hidden inputs don't fire onChange
        setTimeout(() => checkFormChanges(), 0);
    };

    return (
        <>
            {/* Tax Zone No */}
            <div className="space-y-1.5 col-span-12 md:col-span-3 order-[4] relative focus-within:z-50">
                <Label htmlFor="pd-taxzone" className="text-xs font-semibold text-gray-700">
                    {t('property.taxZoneNo')}
                </Label>
                <SearchSelect
                    id="pd-taxzone"
                    options={taxZoneOptions}
                    placeholder={t('property.selectTaxZonePlaceholder') || 'Select Tax Zone'}
                    value={taxZoneId}
                    onChange={handleTaxZoneChange}
                    className={`h-9 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${showTaxZoneNoError && !taxZoneId
                        ? 'border-red-300 focus:border-red-500'
                        : ''
                        }`}
                />
                <input type="hidden" name="taxZoneId" value={taxZoneId} />
                <input type="hidden" name="taxZoneNo" value={taxZoneNo} />
                {showTaxZoneNoError && !taxZoneId && (
                    <span className="text-xs text-red-500 block">
                        {t('property.validation.taxZoneNoRequired')}
                    </span>
                )}
            </div>

            {/* Rate Section Name */}
            <div className="space-y-1.5 col-span-12 md:col-span-3 order-[5]">
                <Label htmlFor="pd-ratesection" className="text-xs font-semibold text-gray-700">
                    {t('property.rateSectionDescription') || 'Rate Section Name'}
                </Label>
                <Input
                    readOnly
                    id="pd-ratesection"
                    name="rateSectionDescription"
                    placeholder={t('property.rateSectionPlaceholder') || 'Enter Rate Section Name'}
                    defaultValue={propertyData?.rateSectionDescription ?? ''}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
            </div>

            {/* UPIC ID */}
            <div className="space-y-1.5 col-span-12 md:col-span-3 order-[6]">
                <Label htmlFor="pd-upic" className="text-xs font-extrabold text-gray-700">
                    {t('property.upicId')}
                </Label>
                <Input
                    id="pd-upic"
                    name="upicId"
                    readOnly
                    placeholder="UPIC2024001234"
                    defaultValue={propertyData?.upicId ?? ''}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
            </div>

            {/* Sub Zone No */}
            <div className="space-y-1.5 col-span-12 md:col-span-3 order-[9]">
                <Label htmlFor="pd-subzone" className="text-xs font-semibold text-gray-700">
                    {t('property.subZoneNo')}
                </Label>
                <Input
                    id="pd-subzone"
                    name="subZoneNo"
                    placeholder="SZ-12"
                    value={subZoneNo}
                    maxLength={PROPERTY_VALIDATION_RULES.SUB_ZONE_NO_MAX_LENGTH}
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${showSubZoneNoError && !propertyValidators.isValidSubZoneNo(subZoneNo)
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
                    <span className="text-xs text-red-500 block">
                        {t('property.validation.invalidSubZoneNo')}
                    </span>
                )}
            </div>

            {/* Survey No */}
            <div className="space-y-1.5 col-span-12 md:col-span-3 order-[10]">
                <Label htmlFor="pd-survey" className="text-xs font-semibold text-gray-700">
                    {t('property.surveyNo')}
                </Label>
                <Input
                    id="pd-survey"
                    name="surveyNo"
                    placeholder="45/2B"
                    value={surveyNo}
                    maxLength={PROPERTY_VALIDATION_RULES.SURVEY_NO_MAX_LENGTH}
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${showSurveyNoError && !propertyValidators.isValidSurveyNo(surveyNo)
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
                    <span className="text-xs text-red-500 block">
                        {t('property.validation.invalidSurveyNo')}
                    </span>
                )}
            </div>

            {/* Plot Area */}
            <div className="space-y-1.5 col-span-12 md:col-span-4 order-[12]">
                <Label htmlFor="pd-plotarea" className="text-xs font-semibold text-gray-700">
                    {t('property.plotArea')}
                </Label>
                <Input
                    id="pd-plotarea"
                    name="plotArea"
                    type="text"
                    min="0"
                    step="0.0001"
                    value={plotArea}
                    placeholder="1500.1234"
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${showPlotAreaError && !propertyValidators.isValidPlotArea(plotArea)
                        ? 'border-red-300 focus:border-red-500'
                        : ''
                        }`}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Prevent negative values
                        if (value && parseFloat(value) < 0) return;
                        const sanitized = sanitizePlotArea(value);
                        setPlotArea(sanitized);
                        if (sanitized) setShowPlotAreaError(true);
                    }}
                    onKeyDown={(e) => {
                        // Prevent negative sign and 'e' character
                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                            e.preventDefault();
                        }
                    }}
                    onBlur={() => setShowPlotAreaError(true)}
                />
                {showPlotAreaError && !propertyValidators.isValidPlotArea(plotArea) && (
                    <span className="text-xs text-red-500 block">
                        {t('property.validation.invalidPlotArea') || 'Invalid plot area. Max 15 digits total, 4 decimals allowed.'}
                    </span>
                )}
            </div>
        </>
    );
};

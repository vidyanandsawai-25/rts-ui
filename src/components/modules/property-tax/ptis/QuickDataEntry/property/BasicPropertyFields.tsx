import { Input, SearchSelect } from '@/components/common';
import { Label } from '@/components/common/label';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';
import { sanitizeFlatShopNo, sanitizePlotNo } from '@/lib/utils/input-sanitization';
import { propertyValidators, PROPERTY_VALIDATION_RULES } from '@/lib/utils/kyc-validation/kyc-validation.constants';
import { useState } from 'react';

interface BasicPropertyFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
    categoryOptions: { label: string; value: string }[];
    categoryId: number | null;
    handleCategoryChange: (name: string | undefined, value: string) => void;
    moujaOptions: { label: string; value: string }[];
    moujaId: number | null;
    handleMoujaChange: (name: string | undefined, value: string) => void;
    propertyDescriptionOptions: { label: string; value: string }[];
    propertyTypeId: number | null;
    handlePropertyDescriptionChange: (name: string | undefined, value: string) => void;
}

export const BasicPropertyFields = ({
    t,
    propertyData,
    categoryOptions,
    categoryId,
    handleCategoryChange,
    moujaOptions,
    moujaId,
    handleMoujaChange,
    propertyDescriptionOptions,
    propertyTypeId,
    handlePropertyDescriptionChange,
}: BasicPropertyFieldsProps) => {
    const [flatShopNo, setFlatShopNo] = useState(propertyData?.flatOrShopNo ?? '');
    const [plotNo, setPlotNo] = useState(propertyData?.plotNo ?? '');

    const [showFlatShopError, setShowFlatShopError] = useState(false);
    const [showPlotNoError, setShowPlotNoError] = useState(false);

    return (
        <>
            {/* Division */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-division" className="text-xs font-semibold text-gray-700">
                    {t('property.division')} <span className="text-red-500">*</span>
                </Label>
                <Input
                    readOnly
                    id="pd-division"
                    name="division"
                    placeholder={t('property.divisionPlaceholder')}
                    defaultValue={propertyData?.division?.toString() ?? ''}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
            </div>

            {/* Mouja */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-mouja" className="text-xs font-semibold text-gray-700">
                    {t('property.mouja')}
                </Label>
                <SearchSelect
                    id="pd-mouja"
                    name="mouja"
                    options={moujaOptions}
                    value={moujaId?.toString() ?? ''}
                    placeholder={t('property.select')}
                    onChange={handleMoujaChange}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-category" className="text-xs font-semibold text-gray-700">
                    {t('property.category')}
                </Label>
                <SearchSelect
                    id="pd-category"
                    name="category"
                    options={categoryOptions}
                    value={categoryId?.toString() ?? ''}
                    placeholder={t('property.select')}
                    onChange={handleCategoryChange}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>

            {/* Flat No / Shop No */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-flat-shop" className="text-xs font-semibold text-gray-700">
                    {t('property.flatShopNo')}
                </Label>
                <Input
                    id="pd-flat-shop"
                    name="flatOrShopNo"
                    placeholder={t('property.flatShopNoPlaceholder')}
                    value={flatShopNo}
                    maxLength={PROPERTY_VALIDATION_RULES.FLAT_SHOP_NO_MAX_LENGTH}
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${showFlatShopError && !propertyValidators.isValidFlatShopNo(flatShopNo)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                        }`}
                    onChange={(e) => {
                        const sanitized = sanitizeFlatShopNo(e.target.value);
                        const limited = sanitized.slice(0, PROPERTY_VALIDATION_RULES.FLAT_SHOP_NO_MAX_LENGTH);
                        setFlatShopNo(limited);
                        if (limited) setShowFlatShopError(true);
                    }}
                    onBlur={() => setShowFlatShopError(true)}
                />
                {showFlatShopError && !propertyValidators.isValidFlatShopNo(flatShopNo) && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.invalidFlatShopNo') || 'Invalid flat/shop number. Only alphanumeric, -, and / allowed (max 10 characters).'}
                    </span>
                )}
            </div>

            {/* Plot No */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-plot" className="text-xs font-semibold text-gray-700">
                    {t('property.plotNo')}
                </Label>
                <Input
                    id="pd-plot"
                    name="plotNo"
                    placeholder={t('property.plotNoPlaceholder')}
                    value={plotNo}
                    maxLength={PROPERTY_VALIDATION_RULES.PLOT_NO_MAX_LENGTH}
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${showPlotNoError && !propertyValidators.isValidPlotNo(plotNo)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                        }`}
                    onChange={(e) => {
                        const sanitized = sanitizePlotNo(e.target.value);
                        const limited = sanitized.slice(0, PROPERTY_VALIDATION_RULES.PLOT_NO_MAX_LENGTH);
                        setPlotNo(limited);
                        if (limited) setShowPlotNoError(true);
                    }}
                    onBlur={() => setShowPlotNoError(true)}
                />
                {showPlotNoError && !propertyValidators.isValidPlotNo(plotNo) && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.invalidPlotNo') || 'Invalid plot number. Only alphanumeric, -, and / allowed (max 10 characters).'}
                    </span>
                )}
            </div>


            {/* Property Description */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-description" className="text-xs font-semibold text-gray-700">
                    {t('property.propertyDescription')}
                </Label>
                <SearchSelect
                    name="propertyDescription"
                    options={propertyDescriptionOptions}
                    placeholder={t('property.select')}
                    value={propertyTypeId?.toString() ?? ''}
                    onChange={handlePropertyDescriptionChange}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>
        </>
    );
};

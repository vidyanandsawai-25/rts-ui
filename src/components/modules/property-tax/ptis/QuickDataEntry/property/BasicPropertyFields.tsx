import { Input, SearchSelect } from '@/components/common';
import { Label } from '@/components/common/label';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';
import { sanitizeFlatShopNo, sanitizePlotNo } from '@/lib/utils/input-sanitization';
import { propertyValidators, PROPERTY_VALIDATION_RULES } from '@/lib/utils/kyc-validation.constants';
import { useState } from 'react';

interface BasicPropertyFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
    categoryOptions: { label: string; value: string }[];
    categoryId: number | null;
    handleCategoryChange: (name: string | undefined, value: string) => void;
    wingOptions: { label: string; value: string }[];
    wingId: number | null;
    handleWingChange: (name: string | undefined, value: string) => void;
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
    wingOptions,
    wingId,
    handleWingChange,
    propertyDescriptionOptions,
    propertyTypeId,
    handlePropertyDescriptionChange,
}: BasicPropertyFieldsProps) => {
    const [flatShopNo, setFlatShopNo] = useState(propertyData?.flatOrShopNo ?? '');
    const [plotNo, setPlotNo] = useState(propertyData?.plotNo ?? '');
    const [plotArea, setPlotArea] = useState(propertyData?.plotArea?.toString() ?? '');
    
    const [showFlatShopError, setShowFlatShopError] = useState(false);
    const [showPlotNoError, setShowPlotNoError] = useState(false);
    const [showPlotAreaError, setShowPlotAreaError] = useState(false);

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
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>

            {/* Mouja */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-mouja" className="text-xs font-semibold text-gray-700">
                    {t('property.mouja')}
                </Label>
                <Input
                    readOnly
                    id="pd-mouja"
                    name="moujaName"
                    placeholder={t('property.mouja')}
                    defaultValue={propertyData?.moujaName ?? ''}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-category" className="text-xs font-semibold text-gray-700">
                    {t('property.category')}
                </Label>
                <SearchSelect
                    name="category"
                    options={categoryOptions}
                    value={categoryId?.toString() ?? ''}
                    placeholder={t('property.select')}
                    onChange={handleCategoryChange}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>

            {/* Wing */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-wing" className="text-xs font-semibold text-gray-700">
                    {t('property.wing')}
                </Label>
                <SearchSelect
                    name="wing"
                    options={wingOptions}
                    value={wingId?.toString() ?? ''}
                    placeholder={t('property.select')}
                    onChange={handleWingChange}
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
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        showFlatShopError && !propertyValidators.isValidFlatShopNo(flatShopNo)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizeFlatShopNo(e.target.value);
                        setFlatShopNo(sanitized);
                        if (sanitized) setShowFlatShopError(true);
                    }}
                    onBlur={() => setShowFlatShopError(true)}
                />
                {showFlatShopError && !propertyValidators.isValidFlatShopNo(flatShopNo) && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.invalidFlatShopNo') || 'Invalid flat/shop number. Only alphanumeric and hyphen allowed.'}
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
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        showPlotNoError && !propertyValidators.isValidPlotNo(plotNo)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const sanitized = sanitizePlotNo(e.target.value);
                        setPlotNo(sanitized);
                        if (sanitized) setShowPlotNoError(true);
                    }}
                    onBlur={() => setShowPlotNoError(true)}
                />
                {showPlotNoError && !propertyValidators.isValidPlotNo(plotNo) && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.invalidPlotNo') || 'Invalid plot number. Only alphanumeric characters allowed.'}
                    </span>
                )}
            </div>

            {/* Plot Area */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-plotarea" className="text-xs font-semibold text-gray-700">
                    {t('property.plotArea')}
                </Label>
                <Input
                    id="pd-plotarea"
                    name="plotArea"
                    type="number"
                    min="0"
                    step="0.01"
                    value={plotArea}
                    placeholder="1500"
                    className={`h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${
                        showPlotAreaError && !propertyValidators.isValidPositiveNumber(plotArea)
                            ? 'border-red-300 focus:border-red-500'
                            : ''
                    }`}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Prevent negative values
                        if (value && parseFloat(value) < 0) return;
                        setPlotArea(value);
                        if (value) setShowPlotAreaError(true);
                    }}
                    onKeyDown={(e) => {
                        // Prevent negative sign and 'e' character
                        if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                            e.preventDefault();
                        }
                    }}
                    onBlur={() => setShowPlotAreaError(true)}
                />
                {showPlotAreaError && !propertyValidators.isValidPositiveNumber(plotArea) && (
                    <span className="text-xs text-red-500">
                        {t('property.validation.invalidPlotArea') || 'Invalid plot area. Only positive numbers allowed.'}
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

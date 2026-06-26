import { useState } from 'react';
import { Input } from '@/components/common';
import { Label } from '@/components/common/label';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';
import { sanitizePlotArea } from '@/lib/utils/input-sanitization';
import { propertyValidators } from '@/lib/utils/kyc-validation/kyc-validation.constants';

interface AreaDetailsFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
}

export const AreaDetailsFields = ({
    t,
    propertyData,
}: AreaDetailsFieldsProps) => {
    const [plotArea, setPlotArea] = useState(propertyData?.plotArea?.toString() ?? '');
    const [showPlotAreaError, setShowPlotAreaError] = useState(false);

    const formatAreaValue = (sqFeet: number | null | undefined, sqMeter: number | null | undefined) => {
        if (sqFeet == null && sqMeter == null) return '';
        const feetStr = sqFeet != null ? Number(sqFeet).toFixed(2) : '0.00';
        const meterStr = sqMeter != null ? Number(sqMeter).toFixed(2) : '0.00';
        return `${feetStr} / ${meterStr}`;
    };

    const carpetAreaVal = formatAreaValue(propertyData?.totalCarpetAreaSqFeet, propertyData?.totalCarpetAreaSqMeter);
    const buildupAreaVal = formatAreaValue(propertyData?.totalBuiltupAreaSqFeet, propertyData?.totalBuiltupAreaSqMeter);

    const preventEnterSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    return (
        <>
            {/* Plot Area */}
            <div className="space-y-1.5 col-span-12 md:col-span-4">
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
                        // if (e.key === 'Enter') {
                        //     e.preventDefault();
                        // }
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

            {/* Total Carpet Area */}
            <div className="space-y-1.5 col-span-12 md:col-span-4">
                <Label htmlFor="pd-carpetarea" className="text-xs font-semibold text-gray-700">
                    {t('property.totalCarpetAreaWithUnit')}
                </Label>
                <Input
                    readOnly
                    id="pd-carpetarea"
                    type="text"
                    placeholder="0.00 / 0.00"
                    defaultValue={carpetAreaVal}
                    onKeyDown={preventEnterSubmit}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
                <input type="hidden" name="totalCarpetAreaSqFeet" value={propertyData?.totalCarpetAreaSqFeet != null ? Number(propertyData.totalCarpetAreaSqFeet).toFixed(2) : ''} />
                <input type="hidden" name="totalCarpetAreaSqMeter" value={propertyData?.totalCarpetAreaSqMeter != null ? Number(propertyData.totalCarpetAreaSqMeter).toFixed(2) : ''} />
            </div>

            {/* Buildup Area */}
            <div className="space-y-1.5 col-span-12 md:col-span-4">
                <Label htmlFor="pd-builduparea" className="text-xs font-semibold text-gray-700">
                    {t('property.buildupAreaWithUnit')}
                </Label>
                <Input
                    readOnly
                    id="pd-builduparea"
                    type="text"
                    placeholder="0.00 / 0.00"
                    defaultValue={buildupAreaVal}
                    onKeyDown={preventEnterSubmit}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
                <input type="hidden" name="totalBuiltupAreaSqFeet" value={propertyData?.totalBuiltupAreaSqFeet != null ? Number(propertyData.totalBuiltupAreaSqFeet).toFixed(2) : ''} />
                <input type="hidden" name="totalBuiltupAreaSqMeter" value={propertyData?.totalBuiltupAreaSqMeter != null ? Number(propertyData.totalBuiltupAreaSqMeter).toFixed(2) : ''} />
            </div>
        </>
    );
};

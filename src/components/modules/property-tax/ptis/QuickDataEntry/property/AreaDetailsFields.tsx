import { Input } from '@/components/common';
import { Label } from '@/components/common/label';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';

interface AreaDetailsFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
}

export const AreaDetailsFields = ({
    t,
    propertyData,
}: AreaDetailsFieldsProps) => {
 
    const formatAreaValue = (sqFeet: number | null | undefined, sqMeter: number | null | undefined) => {
        if (sqFeet == null && sqMeter == null) return '';
        const feetStr = sqFeet != null ? Number(sqFeet).toFixed(2) : '0.00';
        const meterStr = sqMeter != null ? Number(sqMeter).toFixed(2) : '0.00';
        return `${feetStr} / ${meterStr}`;
    };
    

    const carpetAreaVal = formatAreaValue(propertyData?.totalCarpetAreaSqFeet, propertyData?.totalCarpetAreaSqMeter);
    const buildupAreaVal = formatAreaValue(propertyData?.totalBuiltupAreaSqFeet, propertyData?.totalBuiltupAreaSqMeter);

    return (
        <>
            {/* Total Carpet Area */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-carpetarea" className="text-xs font-semibold text-gray-700">
                    {t('property.totalCarpetAreaWithUnit')}
                </Label>
                <Input
                    readOnly
                    id="pd-carpetarea"
                    type="text"
                    placeholder="0.00 / 0.00"
                    defaultValue={carpetAreaVal}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
                <input type="hidden" name="totalCarpetAreaSqFeet" value={propertyData?.totalCarpetAreaSqFeet != null ? Number(propertyData.totalCarpetAreaSqFeet).toFixed(2) : ''} />
                <input type="hidden" name="totalCarpetAreaSqMeter" value={propertyData?.totalCarpetAreaSqMeter != null ? Number(propertyData.totalCarpetAreaSqMeter).toFixed(2) : ''} />
            </div>

            {/* Buildup Area */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-builduparea" className="text-xs font-semibold text-gray-700">
                    {t('property.buildupAreaWithUnit')}
                </Label>
                <Input
                    readOnly
                    id="pd-builduparea"
                    type="text"
                    placeholder="0.00 / 0.00"
                    defaultValue={buildupAreaVal}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
                <input type="hidden" name="totalBuiltupAreaSqFeet" value={propertyData?.totalBuiltupAreaSqFeet != null ? Number(propertyData.totalBuiltupAreaSqFeet).toFixed(2) : ''} />
                <input type="hidden" name="totalBuiltupAreaSqMeter" value={propertyData?.totalBuiltupAreaSqMeter != null ? Number(propertyData.totalBuiltupAreaSqMeter).toFixed(2) : ''} />
            </div>
        </>
    );
};


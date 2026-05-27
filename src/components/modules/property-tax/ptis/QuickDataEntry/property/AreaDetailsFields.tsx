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
    return (
        <>
            {/* Total Carpet Area */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-carpetarea" className="text-xs font-semibold text-gray-700">
                    {t('property.totalCarpetArea')}
                </Label>
                <Input
                    readOnly
                    id="pd-carpetarea"
                    name="totalCarpetAreaSqFeet"
                    type="number"
                    placeholder="1200"
                    defaultValue={Number(propertyData?.totalCarpetAreaSqFeet).toFixed(2) ?? ''}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
            </div>

            {/* Buildup Area */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-builduparea" className="text-xs font-semibold text-gray-700">
                    {t('property.buildupArea')}
                </Label>
                <Input
                    readOnly
                    id="pd-builduparea"
                    name="totalBuiltupAreaSqFeet"
                    type="number"
                    placeholder="1350"
                    defaultValue={Number(propertyData?.totalBuiltupAreaSqFeet).toFixed(2) ?? ''}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
            </div>

            {/* Total Carpet Area SqMeter */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-carpetarea-mtr" className="text-xs font-semibold text-gray-700">
                    {t('property.totalCarpetAreafmtr')}
                </Label>
                <Input
                    readOnly
                    id="pd-carpetarea-mtr"
                    name="totalCarpetAreaSqMeter"
                    type="number"
                    placeholder="22.66"
                    defaultValue={Number(propertyData?.totalCarpetAreaSqMeter).toFixed(2) ?? ''}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
            </div>

            {/* Buildup Area SqMeter */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-builduparea-mtr" className="text-xs font-semibold text-gray-700">
                    {t('property.builtupAreaSqMeter')}
                </Label>
                <Input
                    readOnly
                    id="pd-builduparea-mtr"
                    name="totalBuiltupAreaSqMeter"
                    type="number"
                    placeholder="27.19"
                    defaultValue={Number(propertyData?.totalBuiltupAreaSqMeter).toFixed(2) ?? ''}
                    className="h-9 text-sm bg-gray-50 text-gray-600 cursor-not-allowed border-gray-300"
                />
            </div>
        </>
    );
};

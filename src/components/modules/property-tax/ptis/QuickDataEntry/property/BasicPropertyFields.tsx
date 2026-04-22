import { Input, SearchSelect } from '@/components/common';
import { Label } from '@/components/common/label';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';

interface BasicPropertyFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
    categoryOptions: { label: string; value: string }[];
    categoryId: string;
    handleCategoryChange: (name: string, value: string) => void;
    wingOptions: { label: string; value: string }[];
    wingId: string;
    handleWingChange: (name: string, value: string) => void;
    propertyDescriptionOptions: { label: string; value: string }[];
    propertyTypeId: string;
    handlePropertyDescriptionChange: (name: string, value: string) => void;
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
                    value={categoryId}
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
                    value={wingId}
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
                    defaultValue={propertyData?.flatOrShopNo ?? ''}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
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
                    defaultValue={propertyData?.plotNo ?? ''}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
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
                    defaultValue={propertyData?.plotArea ?? undefined}
                    placeholder="1500"
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
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
                    value={propertyTypeId}
                    onChange={handlePropertyDescriptionChange}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>
        </>
    );
};

import { Input } from '@/components/common';
import { Label } from '@/components/common/label';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';

interface AdditionalPropertyFieldsProps {
    t: (key: string) => string;
    propertyData: PropertyBasicDetailsApiItem | null;
}

export const AdditionalPropertyFields = ({
    t,
    propertyData,
}: AdditionalPropertyFieldsProps) => {
    return (
        <>
            {/* Tax Zone No */}
            <div className="space-y-1.5">
                <Label htmlFor="pd-taxzone" className="text-xs font-semibold text-gray-700">
                    {t('property.taxZoneNo')}
                </Label>
                <Input
                    id="pd-taxzone"
                    name="taxZoneNo"
                    placeholder="Z-03"
                    readOnly
                    disabled
                    title={t('property.taxZoneNo')}
                    defaultValue={propertyData?.taxZoneNo?.toString() ?? ''}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
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
                    defaultValue={propertyData?.surveyNo ?? ''}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
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
                    defaultValue={propertyData?.subZoneNo ?? ''}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
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
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                    placeholder="0"
                    defaultValue={propertyData?.noOfResidentialToilets ?? 0}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
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
                    placeholder="0"
                    defaultValue={propertyData?.noOfCommercialToilets ?? 0}
                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
            </div>
        </>
    );
};

import { Input } from "@/components/common";
import { Label } from "@/components/common/label";
import { PropertySocietyDetailsApiItem } from "@/types/property-society-details.types";

interface SocietyGeneralFieldsProps {
    t: (key: string) => string;
    societyData: PropertySocietyDetailsApiItem | null;
}

export const SocietyGeneralFields = ({ t, societyData }: SocietyGeneralFieldsProps) => {
    return (
        <>
            {/* Row 1: Land Owner | Builder Name | Building/Society Name */}
            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('society.landOwner')}
                </Label>
                <Input
                    name="landOwnerName"
                    defaultValue={societyData?.landOwnerName ?? ''}
                    placeholder={t('society.landOwnerPlaceholder')}
                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('society.builderName')}
                </Label>
                <Input
                    name="builderName"
                    defaultValue={societyData?.builderName ?? ''}
                    placeholder={t('society.builderNamePlaceholder')}
                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                    {t('society.buildingSocietyName')}
                </Label>
                <Input
                    name="societyName"
                    defaultValue={societyData?.societyName ?? ''}
                    placeholder={t('society.buildingSocietyNamePlaceholder')}
                    className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
            </div>

            {/* Row 2: Society Email & Society Address (side by side) */}
            <div className="col-span-3 grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                        {t('society.societyEmail')}
                    </Label>
                    <Input
                        name="societyEmailId"
                        type="email"
                        defaultValue={societyData?.societyEmailId ?? ''}
                        placeholder={t('society.societyEmailPlaceholder')}
                        className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                        {t('society.societyAddress')}
                    </Label>
                    <Input
                        name="societyAddress"
                        defaultValue={societyData?.societyAddress ?? ''}
                        placeholder={t('society.societyAddressPlaceholder')}
                        className="h-9 text-sm border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    />
                </div>
            </div>
        </>
    );
};

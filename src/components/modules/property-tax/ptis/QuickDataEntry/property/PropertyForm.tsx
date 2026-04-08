'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, Input, AddButton, SearchSelect } from '@/components/common';
import { Label } from '@/components/common/label';
import { useConfirm } from '@/components/common/ConfirmProvider';


import { PropertySocietyDetailsApiItem } from '@/types/property-Society-details.types';

import { toast } from 'sonner';
import { updatePropertyBasicDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action';
import {
    PropertyBasicDetailsApiItem,
    PropertyCategoryApiItem,
    PropertyTypeApiItem,
    UpdatePropertyBasicDetailsDto,
    WingItem
} from '@/types/property-basic-details.types';

interface PropertyFormViewProps {
    WingMaster: WingItem[],
    propertyCategories: PropertyCategoryApiItem[],
    propertyDescriptions: PropertyTypeApiItem[],
    propertyData: PropertyBasicDetailsApiItem | null;
    propertySocietyDetails: PropertySocietyDetailsApiItem | null;
    locale: string;
}

const PropertyFormView = ({
    WingMaster: initialWingMaster,
    propertyCategories: initialPropertyCategoryList,
    propertyDescriptions: initialPropertyDescriptionList,
    propertyData,
    propertySocietyDetails,
    locale
}: PropertyFormViewProps) => {

    const t = useTranslations('quickDataEntry');
    const { confirm } = useConfirm();

    // ✅ State (clear naming)
    const [propertyDescriptionList] = useState(initialPropertyDescriptionList);
    const [propertyCategoryList] = useState(initialPropertyCategoryList);
    const [wingList] = useState(initialWingMaster);

    const [propertyTypeId, setPropertyTypeId] = useState(propertyData?.propertyTypeId?.toString() ?? '');
    const [categoryId, setCategoryId] = useState(propertyData?.categoryId?.toString() ?? '');

    // Fallback to society details if wingId is null or 0 in basic details
    const initialWingId = (propertyData?.wingId && propertyData.wingId !== 0)
        ? propertyData.wingId.toString()
        : (propertySocietyDetails?.wingId?.toString() ?? '');

    const initialWingName = (propertyData?.wingName && propertyData.wingName.trim() !== "")
        ? propertyData.wingName
        : (propertySocietyDetails?.wingName ?? '');

    const [wingId, setWingId] = useState(initialWingId);
    const [wingName, setWingName] = useState(initialWingName);

    const [isUpdating, setIsUpdating] = useState(false);

    const categoryOptions = propertyCategoryList.map((item) => ({
        label: item.propertyCategoryName,
        value: String(item.propertyCategoryId),
    }));

    const wingOptions = wingList.map((item) => ({
        label: item.wingNo,
        value: String(item.wingId),
    }));

    const propertyDescriptionOptions = propertyDescriptionList.map((item) => ({
        label: item.propertyDescription,
        value: String(item.propertyTypeId),
    }));

    const handlePropertyDescriptionChange = (_name: string, value: string) => {
        setPropertyTypeId(value);
    };

    const handleCategoryChange = (_name: string, value: string) => {
        setCategoryId(value);
    };

    const handleWingChange = (_name: string, value: string) => {
        setWingId(value);
        const selectedWing = wingList.find((w) => String(w.wingId) === value);
        setWingName(selectedWing?.wingNo || '');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const pId = propertyData?.propertyId ?? 0;

        const selectedWingIdValue = String(formData.get("wingId") ?? "").trim();
        const selectedWingId = selectedWingIdValue ? Number(selectedWingIdValue) : null;

        const selectedWing = wingList.find((wing) => wing.wingId === selectedWingId);

        const payload: UpdatePropertyBasicDetailsDto = {
            wardId: propertyData?.wardId ?? 0,
            taxZoneId: propertyData?.taxZoneId ?? 0,
            categoryId: Number(formData.get("categoryId")) || null,
            propertyTypeId: Number(propertyTypeId) || null,

            wingId: selectedWing?.wingId ?? null,
            wingNo: selectedWing?.wingNo ?? null,

            // wingId: Number(formData.get("    ")) || null,
            wingName: propertySocietyDetails?.wingName || null,

            partitionNo: propertyData?.partitionNo || null,
            flatOrShopNo: String(formData.get("flatOrShopNo") ?? "").trim() || null,
            plotNo: String(formData.get("plotNo") ?? "").trim() || null,
            surveyNo: String(formData.get("surveyNo") ?? "").trim() || null,
            upicId: String(formData.get("upicId") ?? "").trim() || null,
            subZoneNo: String(formData.get("subZoneNo") ?? "").trim() || null,

            // wingNo: String(formData.get("wingName") ?? "").trim() || null,

            noOfResidentialToilets: Number(formData.get("noOfResidentialToilets")),
            noOfCommercialToilets: Number(formData.get("noOfCommercialToilets")),
            totalBuiltupAreaSqFeet: Number(formData.get("totalBuiltupAreaSqFeet")),
            totalCarpetAreaSqFeet: Number(formData.get("totalCarpetAreaSqFeet")),
            plotArea: Number(formData.get("plotArea")),

            plotAreaFtLength: propertyData?.plotAreaFtLength || null,
            plotAreaFtWidth: propertyData?.plotAreaFtWidth || null,
            plotAreaMtrLength: propertyData?.plotAreaMtrLength || null,
            plotAreaMtrWidth: propertyData?.plotAreaMtrWidth || null,

        };

        confirm({
            variant: "update",
            title: t('property.updateConfirmTitle'),
            description: t('property.updateConfirmText'),
            confirmText: t('property.updateConfirmButton'),
            onConfirm: async () => {
                setIsUpdating(true);
                try {
                    await updatePropertyBasicDetailsAction(locale, pId, payload);
                    toast.success(t('property.updateSuccess'));
                } catch (err) {
                    console.error("Submission error:", err);
                    toast.error(t('property.updateError'));
                } finally {
                    setIsUpdating(false);
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Tabs defaultValue="property">
                <Tabs.TabPanel value="property" className="mt-0 p-4 space-y-3">
                    <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-4">
                        <h3 className="text-sm font-bold text-blue-800 mb-3 pb-2 border-b-2 border-blue-200">
                            {t('property.title')}
                        </h3>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
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

                            {/* Category */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pd-category" className="text-xs font-semibold text-gray-700">
                                    {t('property.category')}
                                </Label>
                                <input type="hidden" name="categoryId" value={categoryId} />
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
                                <input type="hidden" name="wingId" value={wingId} />
                                <input type="hidden" name="wingName" value={wingName} />
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

                                <input type="hidden" name="propertyTypeId" value={propertyTypeId} />
                                <SearchSelect
                                    name="propertyDescription"
                                    options={propertyDescriptionOptions}
                                    placeholder={t('property.select')}
                                    value={propertyTypeId}
                                    onChange={handlePropertyDescriptionChange}
                                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Tax Zone No */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pd-taxzone" className="text-xs font-semibold text-gray-700">
                                    {t('property.taxZoneNo')}
                                </Label>
                                <Input
                                    id="pd-taxzone"
                                    name="taxZoneNo"
                                    placeholder="Z-03"
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
                                    defaultValue={propertyData?.totalCarpetAreaSqFeet ?? ''}
                                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                                    defaultValue={propertyData?.totalBuiltupAreaSqFeet ?? ''}
                                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <AddButton label={t('property.updateButton')} type='submit' isLoading={isUpdating} />
                        </div>
                    </div>
                </Tabs.TabPanel>
            </Tabs>
        </form>
    );
};

export default PropertyFormView;
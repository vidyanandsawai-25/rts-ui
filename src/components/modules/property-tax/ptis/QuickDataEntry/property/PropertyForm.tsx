'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, Input, AddButton, SearchSelect } from '@/components/common';
import { Label } from '@/components/common/label';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { updatePropertyBasicDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action';
import {
    PropertyFormViewProps,
    UpdatePropertyBasicDetailsDto,
} from '@/types/property-basic-details.types';

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
    const router = useRouter();
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
        value: String(item.id),
    }));

    const wingOptions = wingList.map((item) => ({
        label: item.wingNo,
        value: String(item.id),
    }));

    const propertyDescriptionOptions = propertyDescriptionList.map((item) => ({
        label: item.propertyDescription,
        value: String(item.id),
    }));

    const handlePropertyDescriptionChange = (_name: string, value: string) => {
        setPropertyTypeId(value);
    };

    const handleCategoryChange = (_name: string, value: string) => {
        setCategoryId(value);
    };

    const handleWingChange = (_name: string, value: string) => {
        setWingId(value);
        const selectedWing = wingList.find((w) => String(w.id) === value);
        setWingName(selectedWing?.wingNo || '');
    };

    const parseOptionalNumber = (value: FormDataEntryValue | null): number | null => {
        const normalized = typeof value === "string" ? value.trim() : value;
        if (normalized === null || normalized === "") {
            return null;
        }
        const parsed = Number(normalized);
        return Number.isNaN(parsed) ? null : parsed;
    };

    const parseId = (value: string): number | null => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!propertyData) {
            toast.error(t('property.updateError'));
            return;
        }

        const formData = new FormData(e.currentTarget);
        const pId = propertyData.propertyId;

        // const selectedWingIdValue = String(formData.get("wingId") ?? "").trim();
        // const selectedWingId = selectedWingIdValue ? Number(selectedWingIdValue) : null;
        const selectedWingId = parseId(wingId);
        const selectedWing = wingList.find((wing) => wing.id === selectedWingId);

        const payload: UpdatePropertyBasicDetailsDto = {
            wardId: propertyData.wardId,
            taxZoneId: propertyData.taxZoneId,
            categoryId: parseId(categoryId),
            propertyTypeId: parseId(propertyTypeId) || null,

            wingId: selectedWing?.id ?? null,
            wingNo: selectedWing?.wingNo ?? null,
            wingName: wingName || null,
            moujaId: propertyData?.moujaId ?? null,
            moujaName: propertyData?.moujaName ?? null,

            partitionNo: propertyData?.partitionNo || null,
            flatOrShopNo: String(formData.get("flatOrShopNo") ?? "").trim() || null,
            plotNo: String(formData.get("plotNo") ?? "").trim() || null,
            surveyNo: String(formData.get("surveyNo") ?? "").trim() || null,
            upicId: String(formData.get("upicId") ?? "").trim() || null,
            subZoneNo: String(formData.get("subZoneNo") ?? "").trim() || null,

            // wingNo: String(formData.get("wingName") ?? "").trim() || null,

            noOfResidentialToilets: parseOptionalNumber(formData.get("noOfResidentialToilets")),
            noOfCommercialToilets: parseOptionalNumber(formData.get("noOfCommercialToilets")),
            totalBuiltupAreaSqFeet: parseOptionalNumber(formData.get("totalBuiltupAreaSqFeet")),
            totalCarpetAreaSqFeet: parseOptionalNumber(formData.get("totalCarpetAreaSqFeet")),
            totalBuiltupAreaSqMeter: parseOptionalNumber(formData.get("totalBuiltupAreaSqMeter")),
            totalCarpetAreaSqMeter: parseOptionalNumber(formData.get("totalCarpetAreaSqMeter")),
            plotArea: parseOptionalNumber(formData.get("plotArea")),

            plotAreaFtLength: propertyData?.plotAreaFtLength ?? null,
            plotAreaFtWidth: propertyData?.plotAreaFtWidth ?? null,
            plotAreaMtrLength: propertyData?.plotAreaMtrLength ?? null,
            plotAreaMtrWidth: propertyData?.plotAreaMtrWidth ?? null,
        };

        confirm({
            variant: "update",
            title: t('property.updateConfirmTitle'),
            description: t('property.updateConfirmText'),
            confirmText: t('property.updateConfirmButton'),
            onConfirm: async () => {
                setIsUpdating(true);
                try {
                    const result = await updatePropertyBasicDetailsAction(locale, pId, payload);

                    if (!result?.success) {
                        console.error("Submission error:", result?.error);
                        toast.error(result?.error || t('property.updateError'));
                        return;
                    }

                    toast.success(t('property.updateSuccess'));
                    router.refresh();
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

                            {/* Total Carpet Area SqMeter */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pd-carpetarea-mtr" className="text-xs font-semibold text-gray-700">
                                    {t('property.totalCarpetArea')}
                                </Label>
                                <Input
                                    readOnly
                                    id="pd-carpetarea-mtr"
                                    name="totalCarpetAreaSqMeter"
                                    type="number"
                                    placeholder="22.66"
                                    defaultValue={propertyData?.totalCarpetAreaSqMeter ?? ''}
                                    className="h-9 text-sm border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {/* Buildup Area SqMeter */}
                            <div className="space-y-1.5">
                                <Label htmlFor="pd-builduparea-mtr" className="text-xs font-semibold text-gray-700">
                                    {t('property.buildupArea')}
                                </Label>
                                <Input
                                    readOnly
                                    id="pd-builduparea-mtr"
                                    name="totalBuiltupAreaSqMeter"
                                    type="number"
                                    placeholder="27.19"
                                    defaultValue={propertyData?.totalBuiltupAreaSqMeter ?? ''}
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
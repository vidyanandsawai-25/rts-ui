import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { updatePropertyBasicDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ConfirmContextType } from '@/components/common/ConfirmProvider';
import {
    UpdatePropertyBasicDetailsDto,
    PropertyFormViewProps,
} from '@/types/property-basic-details.types';

export const usePropertyForm = (props: PropertyFormViewProps, t: (key: string) => string, confirm: ConfirmContextType['confirm'], router: AppRouterInstance) => {
    const {
        WingMaster: wingList,
        propertyCategories: propertyCategoryList,
        propertyDescriptions: propertyDescriptionList,
        propertyData,
        propertySocietyDetails,
        locale
    } = props;

    const [propertyTypeId, setPropertyTypeId] = useState(propertyData?.propertyTypeId?.toString() ?? '');
    const [categoryId, setCategoryId] = useState(propertyData?.categoryId?.toString() ?? '');

    const initialWingId = (propertyData?.wingId && propertyData.wingId !== 0)
        ? propertyData.wingId.toString()
        : (propertySocietyDetails?.wingId?.toString() ?? '');

    const initialWingName = (propertyData?.wingName && propertyData.wingName.trim() !== "")
        ? propertyData.wingName
        : (propertySocietyDetails?.wingName ?? '');

    const [wingId, setWingId] = useState(initialWingId);
    const [wingName, setWingName] = useState(initialWingName);
    const [isUpdating, setIsUpdating] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const parseOptionalNumber = (value: FormDataEntryValue | null): number | null => {
        const normalized = typeof value === "string" ? value.trim() : value;
        if (normalized === null || normalized === "") return null;
        const parsed = Number(normalized);
        return Number.isNaN(parsed) ? null : parsed;
    };

    const parseId = (value: string): number | null => {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    };

    const checkFormChanges = useCallback(() => {
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        const residentialToilets = parseOptionalNumber(formData.get("noOfResidentialToilets"));
        const commercialToilets = parseOptionalNumber(formData.get("noOfCommercialToilets"));
        const plotArea = parseOptionalNumber(formData.get("plotArea"));

        const isChanged =
            String(formData.get("plotNo") ?? "").trim() !== (propertyData?.plotNo ?? "") ||
            String(formData.get("flatOrShopNo") ?? "").trim() !== (propertyData?.flatOrShopNo ?? "") ||
            String(formData.get("surveyNo") ?? "").trim() !== (propertyData?.surveyNo ?? "") ||
            String(formData.get("subZoneNo") ?? "").trim() !== (propertyData?.subZoneNo ?? "") ||
            residentialToilets !== (propertyData?.noOfResidentialToilets ?? null) ||
            commercialToilets !== (propertyData?.noOfCommercialToilets ?? null) ||
            plotArea !== (propertyData?.plotArea ?? null) ||
            categoryId !== (propertyData?.categoryId?.toString() ?? '') ||
            propertyTypeId !== (propertyData?.propertyTypeId?.toString() ?? '') ||
            wingId !== initialWingId;

        setHasChanges(isChanged);
    }, [categoryId, propertyTypeId, wingId, initialWingId, propertyData]);

    useEffect(() => {
        checkFormChanges();
    }, [checkFormChanges]);

    const handlePropertyDescriptionChange = (_name: string, value: string) => setPropertyTypeId(value);
    const handleCategoryChange = (_name: string, value: string) => setCategoryId(value);
    const handleWingChange = (_name: string, value: string) => {
        setWingId(value);
        const selectedWing = wingList.find((w) => String(w.id) === value);
        setWingName(selectedWing?.wingNo || '');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!propertyData) {
            toast.error(t('property.updateError'));
            return;
        }

        const formData = new FormData(e.currentTarget);
        const pId = propertyData.propertyId;
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
            partitionNo: propertyData?.partitionNo ?? null,
            flatOrShopNo: String(formData.get("flatOrShopNo") ?? "").trim() || null,
            plotNo: String(formData.get("plotNo") ?? "").trim() || null,
            surveyNo: String(formData.get("surveyNo") ?? "").trim() || null,
            upicId: String(formData.get("upicId") ?? "").trim() || null,
            subZoneNo: String(formData.get("subZoneNo") ?? "").trim() || null,
            noOfResidentialToilets: parseOptionalNumber(formData.get("noOfResidentialToilets")),
            noOfCommercialToilets: parseOptionalNumber(formData.get("noOfCommercialToilets")),
            totalBuiltupAreaSqFeet: parseOptionalNumber(formData.get("totalBuiltupAreaSqFeet")),
            totalCarpetAreaSqFeet: parseOptionalNumber(formData.get("totalCarpetAreaSqFeet")),
            totalBuiltupAreaSqMeter: parseOptionalNumber(formData.get("totalBuiltupAreaSqMeter")),
            totalCarpetAreaSqMeter: parseOptionalNumber(formData.get("totalCarpetAreaSqMeter")),
            plotArea: parseOptionalNumber(formData.get("plotArea")),
            plotAreaFtWidth: propertyData?.plotAreaFtWidth ?? null,
            plotAreaFtLength: propertyData?.plotAreaFtLength ?? null,
            plotAreaMtrWidth: propertyData?.plotAreaMtrWidth ?? null,
            plotAreaMtrLength: propertyData?.plotAreaMtrLength ?? null,
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
                        toast.error(result?.error || t('property.updateError'));
                        return;
                    }
                    toast.success(t('property.updateSuccess'));
                    router.refresh();
                } catch (_err) {
                    toast.error(t('property.updateError'));
                } finally {
                    setIsUpdating(false);
                }
            }
        });
    };

    return {
        formRef,
        hasChanges,
        isUpdating,
        propertyTypeId,
        categoryId,
        wingId,
        checkFormChanges,
        handleSubmit,
        handlePropertyDescriptionChange,
        handleCategoryChange,
        handleWingChange,
        categoryOptions: propertyCategoryList.map((item) => ({ label: item.propertyCategoryName, value: String(item.id) })),
        wingOptions: wingList.map((item) => ({ label: item.wingNo, value: String(item.id) })),
        propertyDescriptionOptions: propertyDescriptionList.map((item) => ({ label: item.propertyDescription, value: String(item.id) })),
    };
};

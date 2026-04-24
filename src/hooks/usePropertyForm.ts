import { useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useLoading } from '@/hooks/useLoading';
import { validateForm, hasErrors, propertyValidations } from '@/lib/utils/validation';
import { updatePropertyBasicDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action';
import {
    UpdatePropertyBasicDetailsDto,
    PropertyFormViewProps,
} from '@/types/property-basic-details.types';

import { usePropertyOptions } from '@/hooks/usePropertyOptions';
import { usePropertyFormState } from '@/hooks/usePropertyFormState';
import { usePropertyChanges } from '@/hooks/usePropertyChanges';

export const usePropertyForm = (props: PropertyFormViewProps) => {
    const {
        WingMaster: wingList,
        propertyData,
        propertySocietyDetails,
        locale
    } = props;

    const t = useTranslations('quickDataEntry');
    const { confirm } = useConfirm();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const { isLoading: isUpdating, startLoading, stopLoading } = useLoading(false);

    // 1. Options Hook
    const { categoryOptions, wingOptions, propertyDescriptionOptions } = usePropertyOptions(props);

    // 2. State Hook
    const {
        propertyTypeId, setPropertyTypeId,
        categoryId, setCategoryId,
        wingId, setWingId,
        wingName, setWingName,
        hasChanges, setHasChanges,
        initialWingId
    } = usePropertyFormState(propertyData, propertySocietyDetails);

    // 3. Changes Hook
    const { checkFormChanges } = usePropertyChanges({
        formRef,
        categoryId,
        propertyTypeId,
        wingId,
        initialWingId,
        propertyData,
        setHasChanges
    });

    // Helper functions
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

    // Handlers
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
        
        const validationData = {
            categoryId,
            plotArea: formData.get("plotArea"),
            noOfResidentialToilets: formData.get("noOfResidentialToilets"),
            noOfCommercialToilets: formData.get("noOfCommercialToilets"),
        };

        const errors = validateForm(validationData, {
            categoryId: propertyValidations.required("category", t),
            plotArea: propertyValidations.number("plotArea", t),
            noOfResidentialToilets: propertyValidations.number("residentialToilets", t),
            noOfCommercialToilets: propertyValidations.number("commercialToilets", t),
        });

        if (hasErrors(errors)) {
            toast.error(Object.values(errors)[0]);
            return;
        }

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
                startLoading();
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
                    stopLoading();
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
        categoryOptions,
        wingOptions,
        propertyDescriptionOptions,
    };
};

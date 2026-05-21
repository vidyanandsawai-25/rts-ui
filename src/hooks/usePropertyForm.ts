import { useRef } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useLoading } from '@/hooks/useLoading';    
import { hasErrors } from '@/lib/utils/validation';
import { updatePropertyBasicDetailsAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Property/action';
import {
    UpdatePropertyBasicDetailsDto,
    PropertyFormViewProps,
} from '@/types/property-basic-details.types';

import { usePropertyOptions } from '@/hooks/usePropertyOptions';
import { usePropertyFormState } from '@/hooks/usePropertyFormState';
import { usePropertyChanges } from '@/hooks/usePropertyChanges';
import { parseOptionalNumber } from '@/lib/utils/form-helpers';
import { validatePropertyForm } from '@/lib/utils/validatePropertyForm';

export const usePropertyForm = (props: PropertyFormViewProps) => {
    const {
        MoujaMaster: moujaList,
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
    const { categoryOptions, moujaOptions, propertyDescriptionOptions } = usePropertyOptions(props);

    // 2. State Hook
    const {
        propertyTypeId, setPropertyTypeId,
        categoryId, setCategoryId,
        moujaId, setMoujaId,
        moujaName, setMoujaName,
        hasChanges, setHasChanges,
    } = usePropertyFormState(propertyData, propertySocietyDetails);

    const { checkFormChanges } = usePropertyChanges({
        formRef,
        categoryId,
        propertyTypeId,
        moujaId,
        propertyData,
        setHasChanges
    });

    // Handlers
    const handlePropertyDescriptionChange = (_name: string | undefined, value: string) => setPropertyTypeId(Number(value) || null);
    const handleCategoryChange = (_name: string | undefined, value: string) => setCategoryId(Number(value) || null);
    const handleMoujaChange = (_name: string | undefined, value: string) => {
        const id = Number(value) || null;
        setMoujaId(id);
        const selectedMouja = moujaList.find((m) => m.id === id);
        setMoujaName(selectedMouja?.moujaName || '');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!propertyData) {
            toast.error(t('property.updateError'));
            return;
        }

        const formData = new FormData(e.currentTarget);
        
        const errors = validatePropertyForm(formData, categoryId, t);

        if (hasErrors(errors)) {
            toast.error(Object.values(errors)[0]);
            return;
        }

        const pId = propertyData.propertyId;

        const payload: UpdatePropertyBasicDetailsDto = {
            wardId: propertyData.wardId,
            taxZoneId: Number(formData.get("taxZoneId") ?? propertyData.taxZoneId),
            categoryId,
            propertyTypeId: propertyTypeId || null,            
            moujaId: moujaId,
            moujaName: moujaName || null,
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
                        toast.error(t('property.errors.updatePropertyBasicDetails'));
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
        moujaId,
        checkFormChanges,
        handleSubmit,
        handlePropertyDescriptionChange,
        handleCategoryChange,
        handleMoujaChange,
        categoryOptions,
        moujaOptions,
        propertyDescriptionOptions,
    };
};

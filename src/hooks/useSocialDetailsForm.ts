import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import { upsertPropertySocialInfoAction } from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/action";
import { PropertySocialInfoResponseDto, PropertySocialInfoItemDto } from "@/types/property-social-details.types";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { useTranslations } from "next-intl";
import {
    FlatSocialAttributeState,
    flattenAttributes,
    isAttributeEnabled
} from "@/lib/utils/social-details";
import { validateSocialDetails } from "@/lib/validations/social-details.validation";

export const useSocialDetailsForm = (
    initialSocialData: PropertySocialInfoResponseDto | null,
    propertyId: string
) => {
    const t = useTranslations("quickDataEntry");
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);
    const [hasChanges, setHasChanges] = useState(false);
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const { confirm } = useConfirm();

    const initialFlatData = useMemo(() => {
        return flattenAttributes(initialSocialData?.socialAttributes || []);
    }, [initialSocialData]);

    const [formState, setFormState] = useState<{
        data: Record<number, FlatSocialAttributeState>;
        errors: Record<number, string>;
    }>(() => ({
        data: flattenAttributes(initialSocialData?.socialAttributes || []),
        errors: {}
    }));

    const socialData = formState.data;
    const errors = formState.errors;

    const handleValueChange = (
        attributeId: number,
        field: keyof FlatSocialAttributeState,
        value: string | number | boolean | null
    ) => {
        setHasChanges(true);

        setFormState((prev) => {
            const nextData = { ...prev.data };
            const currentAttr = nextData[attributeId];
            if (!currentAttr) return prev;

            // 1. Update value
            nextData[attributeId] = { ...currentAttr, [field]: value };

            // 2. Validate with translation helper
            const valErrors = validateSocialDetails(nextData, t);

            // 3. Sync full error state (avoids stale descendant errors when enabling/disabling parents)
            const nextErrors = valErrors;

            return {
                data: nextData,
                errors: nextErrors
            };
        });
    };

    const handleSave = async () => {
        const valErrors = validateSocialDetails(socialData, t);
        if (Object.keys(valErrors).length > 0) {
            setFormState((prev) => ({ ...prev, errors: valErrors }));
            toast.error(t("discount.socialValidation.correctErrors") || "Please correct the validation errors before saving.");
            return;
        }
        setFormState((prev) => ({ ...prev, errors: {} }));

        confirm({
            variant: "update",
            title: t("discount.socialConfirm.saveTitle") || "Save Social Details",
            description: t("discount.socialConfirm.saveDescription") || "Are you sure you want to save all changes to property social details?",
            confirmText: t("discount.socialConfirm.confirmText") || "Yes, Save",
            cancelText: t("discount.socialConfirm.cancelText") || "No, Cancel",
            onConfirm: async () => {
                startLoading();
                try {
                    const socialAttributes: PropertySocialInfoItemDto[] = [];
                    const socialAttributeIdsToRemove: number[] = [];

                    Object.values(socialData).forEach((attr) => {
                        const isEnabled = isAttributeEnabled(attr, socialData);

                        if (!isEnabled) {
                            if (attr.id) socialAttributeIdsToRemove.push(attr.socialAttributeId);
                        } else {
                            const init = initialFlatData[attr.socialAttributeId];
                            const isDirty = !init ||
                                attr.bitValue !== init.bitValue || attr.intValue !== init.intValue ||
                                attr.decimalValue !== init.decimalValue || attr.textValue !== init.textValue ||
                                attr.dateValue !== init.dateValue || attr.documentBindingId !== init.documentBindingId ||
                                attr.remark !== init.remark;

                            if (isDirty) {
                                socialAttributes.push({
                                    id: attr.id,
                                    socialAttributeId: attr.socialAttributeId,
                                    bitValue: attr.dataType.toUpperCase() === "BIT" ? attr.bitValue : null,
                                    intValue: attr.intValue !== null && attr.intValue !== undefined && String(attr.intValue) !== "" ? Number(attr.intValue) : null,
                                    decimalValue: attr.decimalValue !== null && attr.decimalValue !== undefined && String(attr.decimalValue) !== "" ? Number(attr.decimalValue) : null,
                                    textValue: attr.textValue,
                                    dateValue: attr.dateValue,
                                    documentBindingId: attr.documentBindingId,
                                    remark: attr.remark
                                });
                             }
                        }
                    });

                    if (socialAttributes.length === 0 && socialAttributeIdsToRemove.length === 0) {
                        setHasChanges(false);
                        toast.success(t("discount.socialConfirm.noChanges") || "No changes to save.");
                        return;
                    }

                    const response = await upsertPropertySocialInfoAction(locale, propertyId, {
                        socialAttributes,
                        socialAttributeIdsToRemove
                    });

                    if (response.success) {
                        setHasChanges(false);
                        toast.success(response.message || t("discount.socialConfirm.saveSuccess") || "Social details saved successfully!");
                        router.refresh();
                    } else {
                        toast.error(response.error || t("discount.socialConfirm.saveError") || "Failed to save social details.");
                    }
                } catch (_error) {
                    toast.error(t("discount.socialConfirm.unexpectedError") || "An unexpected error occurred while saving.");
                } finally {
                    stopLoading();
                }
            }
        });
    };

    return {
        socialData,
        isSaving,
        hasChanges,
        errors,
        isAttributeEnabled: (attr: FlatSocialAttributeState) => isAttributeEnabled(attr, socialData),
        handleValueChange,
        handleSave
    };
};

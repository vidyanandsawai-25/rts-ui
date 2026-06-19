import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import { 
    upsertPropertySocialInfoAction
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/social-actions";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { useTranslations } from "next-intl";
import {
    FlatSocialAttributeState,
    isAttributeEnabled,
    getLocalizedName
} from "@/lib/utils/social-details";
import { validateSocialDetails } from "@/lib/validations/social-details.validation";
import { checkSocialRequiredFields } from "@/lib/validations/social-details.validation";
import { mapSocialStateToApi } from "@/lib/utils/social-guidelines";
import { useSocialFormState } from "./useSocialFormState";
import { useSocialPhotoUpload } from "./useSocialPhotoUpload";

export const useSocialDetailsForm = (
    initialSocialData: PropertySocialInfoResponseDto | null,
    propertyId: string
) => {
    const t = useTranslations("quickDataEntry");
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);
    const params = useParams();
    const router = useRouter();
    const locale = params.locale as string;
    const { confirm } = useConfirm();

    const {
        socialData,
        validationErrors,
        setFormState,
        hasChanges,
        setHasChanges,
        initialFlatData,
        handleInputChange,
        handleToggleEnabled
    } = useSocialFormState(initialSocialData);

    const { handlePhotoUpload } = useSocialPhotoUpload(
        socialData,
        propertyId,
        setFormState,
        setHasChanges,
        t as unknown as {
            (key: string, values?: Record<string, string | number | Date>): string;
            has?: (key: string) => boolean;
        }
    );

    const incompleteAttributes = useMemo(() => {
        const list: { id: number; name: string }[] = [];
        const seen = new Set<number>();
        
        Object.keys(validationErrors).forEach((idStr) => {
            const attrId = Number(idStr);
            const attr = socialData[attrId];
            if (attr) {
                const findRootParent = (item: FlatSocialAttributeState): FlatSocialAttributeState => {
                    if (item.parentAttributeId) {
                        const parent = socialData[item.parentAttributeId];
                        if (parent) return findRootParent(parent);
                    }
                    return item;
                };

                const rootParent = findRootParent(attr);
                if (rootParent && !seen.has(rootParent.socialAttributeId)) {
                    seen.add(rootParent.socialAttributeId);
                    list.push({
                        id: rootParent.socialAttributeId,
                        name: getLocalizedName(rootParent.socialAttributeCode, rootParent.socialAttributeName, t)
                    });
                }
            }
        });
        return list;
    }, [validationErrors, socialData, t]);

    const handleSave = async () => {
        const valErrors = validateSocialDetails(socialData, t);
        if (Object.keys(valErrors).length > 0) {
            setFormState((prev) => ({ ...prev, errors: valErrors }));
            toast.error(t("discount.socialValidation.correctErrors") || "Please correct the validation errors before saving.");
            return { success: false, isValid: false, errors: valErrors };
        }
        setFormState((prev) => ({ ...prev, errors: {} }));

        return new Promise<{ success: boolean; isValid: boolean; errors?: Record<number, string> }>((resolve) => {
            confirm({
                variant: "update",
                title: t("discount.socialConfirm.saveTitle") || "Save Social Details",
                description: t("discount.socialConfirm.saveDescription") || "Are you sure you want to save all changes to property social details?",
                confirmText: t("discount.socialConfirm.confirmText") || "Yes, Save",
                cancelText: t("discount.socialConfirm.cancelText") || "No, Cancel",
                onConfirm: async () => {
                    startLoading();
                    try {
                        const { socialAttributes, socialAttributeIdsToRemove } = mapSocialStateToApi(socialData, initialFlatData);

                        if (socialAttributes.length === 0 && socialAttributeIdsToRemove.length === 0) {
                            setHasChanges(false);
                            toast.success(t("discount.socialConfirm.noChanges") || "No changes to save.");
                            resolve({ success: true, isValid: true });
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
                            resolve({ success: true, isValid: true });
                        } else {
                            toast.error(response.error || t("discount.socialConfirm.saveError") || "Failed to save social details.");
                            resolve({ success: false, isValid: true });
                        }
                    } catch (_error) {
                        toast.error(t("discount.socialConfirm.unexpectedError") || "An unexpected error occurred while saving.");
                        resolve({ success: false, isValid: true });
                    } finally {
                        stopLoading();
                    }
                },
                onCancel: () => {
                    resolve({ success: false, isValid: true });
                }
            });
        });
    };

    return {
        socialData,
        isSaving,
        hasChanges,
        validationErrors,
        incompleteAttributes,
        isAttributeEnabled: (attr: FlatSocialAttributeState) => isAttributeEnabled(attr, socialData),
        handleInputChange,
        handleToggleEnabled,
        handlePhotoUpload,
        handleSave
    };
};
export { checkSocialRequiredFields };

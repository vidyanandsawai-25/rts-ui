import { useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import { 
    upsertPropertySocialInfoAction,
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
        socialData, validationErrors, setFormState,
        hasChanges, initialFlatData, handleInputChange, handleToggleEnabled
    } = useSocialFormState(initialSocialData);

    const { handlePhotoUpload, handlePhotoDelete } = useSocialPhotoUpload(
        socialData, setFormState,
        t as unknown as { (key: string, values?: Record<string, string | number | Date>): string; has?: (key: string) => boolean; }
    );

    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as unknown as { __socialFormHasChanges?: boolean }).__socialFormHasChanges = hasChanges;
        }
        return () => {
            if (typeof window !== "undefined") {
                (window as unknown as { __socialFormHasChanges?: boolean }).__socialFormHasChanges = false;
            }
        };
    }, [hasChanges]);

    const incompleteAttributes = useMemo(() => {
        const list: { id: number; name: string }[] = [];
        const seen = new Set<number>();
        Object.keys(validationErrors).forEach((idStr) => {
            const attrId = Number(idStr);
            const attr = socialData[attrId];
            if (!attr) return;
            const findRootParent = (item: FlatSocialAttributeState): FlatSocialAttributeState =>
                item.parentAttributeId && socialData[item.parentAttributeId]
                    ? findRootParent(socialData[item.parentAttributeId]!)
                    : item;
            const rootParent = findRootParent(attr);
            if (rootParent && !seen.has(rootParent.socialAttributeId)) {
                seen.add(rootParent.socialAttributeId);
                list.push({
                    id: rootParent.socialAttributeId,
                    name: getLocalizedName(rootParent.socialAttributeCode, rootParent.socialAttributeName, t)
                });
            }
        });
        return list;
    }, [validationErrors, socialData, t]);

    const handleSave = async () => {
        const valErrors = validateSocialDetails(socialData, t);
        if (Object.keys(valErrors).length > 0) {
            setFormState((prev) => ({ ...prev, errors: valErrors }));
            toast.error(t("discount.socialValidation.correctErrors") || "Please correct errors before saving.");
            return { success: false, isValid: false, errors: valErrors };
        }
        setFormState((prev) => ({ ...prev, errors: {} }));

        return new Promise<{ success: boolean; isValid: boolean; errors?: Record<number, string> }>((resolve) => {
            confirm({
                variant: "update",
                title: t("discount.socialConfirm.saveTitle") || "Save Social Details",
                description: t("discount.socialConfirm.saveDescription") || "Are you sure you want to save changes?",
                confirmText: t("discount.socialConfirm.confirmText") || "Yes, Save",
                cancelText: t("discount.socialConfirm.cancelText") || "No, Cancel",
                onConfirm: async () => {
                    startLoading();
                    try {
                        const { socialAttributes, socialAttributeIdsToRemove } = mapSocialStateToApi(socialData, initialFlatData);
                        const hasPendingFiles = Object.values(socialData).some(item => isAttributeEnabled(item, socialData) && !!item.pendingFile);

                        if (socialAttributes.length === 0 && socialAttributeIdsToRemove.length === 0 && !hasPendingFiles) {
                            toast.success(t("discount.socialConfirm.noChanges") || "No changes to save.");
                            resolve({ success: true, isValid: true });
                            return;
                        }

                        const formData = new FormData();
                        formData.append("socialAttributes", JSON.stringify(socialAttributes));
                        formData.append("socialAttributeIdsToRemove", JSON.stringify(socialAttributeIdsToRemove));

                        // Append pending files
                        Object.values(socialData).forEach(item => {
                            if (isAttributeEnabled(item, socialData) && item.pendingFile) {
                                formData.append(`file_${item.socialAttributeId}`, item.pendingFile);
                            }
                        });

                        const response = await upsertPropertySocialInfoAction(locale, propertyId, formData);
                        if (response.success) {
                            toast.success(response.message || t("discount.socialConfirm.saveSuccess") || "Saved successfully!");
                            router.refresh();
                            resolve({ success: true, isValid: true });
                        } else {
                            toast.error(response.error || t("discount.socialConfirm.saveError") || "Failed to save.");
                            resolve({ success: false, isValid: true });
                        }
                    } catch (error: unknown) {
                        toast.error(error instanceof Error ? error.message : String(error));
                        resolve({ success: false, isValid: true });
                    } finally { stopLoading(); }
                },
                onCancel: () => resolve({ success: false, isValid: true })
            });
        });
    };

    return {
        socialData, isSaving, hasChanges, validationErrors, incompleteAttributes,
        isAttributeEnabled: (attr: FlatSocialAttributeState) => isAttributeEnabled(attr, socialData),
        handleInputChange, handleToggleEnabled, handlePhotoUpload, handlePhotoDelete, handleSave
    };
};
export { checkSocialRequiredFields };

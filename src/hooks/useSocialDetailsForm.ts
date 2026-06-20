import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import { 
    upsertPropertySocialInfoAction,
    uploadSocialPhotoAction,
    replaceSocialPhotoAction
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

    const { handlePhotoUpload, handlePhotoDelete } = useSocialPhotoUpload(
        socialData,
        propertyId,
        setFormState,
        setHasChanges,
        t as unknown as {
            (key: string, values?: Record<string, string | number | Date>): string;
            has?: (key: string) => boolean;
        },
        initialFlatData
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
                        // 1. Find all attributes that are enabled and have a pending File
                        const pendingUploads = Object.values(socialData).filter(
                            attr => attr.bitValue === true && attr.pendingFile
                        );

                        // Map of successfully uploaded details to update state later
                        const uploadedDetails: Record<number, {
                            propertySocialDetailId: number;
                            documentBindingId: number;
                            documentGuid: string;
                            documentUrl: string;
                        }> = {};

                        // 2. Upload pending files sequentially
                        for (const attr of pendingUploads) {
                            // Show loader on the target card
                            setFormState(prev => {
                                const nextData = { ...prev.data };
                                if (nextData[attr.socialAttributeId]) {
                                    nextData[attr.socialAttributeId] = {
                                        ...nextData[attr.socialAttributeId],
                                        isUploading: true
                                    };
                                }
                                return { ...prev, data: nextData };
                            });

                            const formData = new FormData();
                            formData.append("File", attr.pendingFile!);
                            
                            const hasDetailId = !!attr.id;
                            if (!hasDetailId) {
                                formData.append("PropertyId", String(propertyId));
                                formData.append("SocialAttributeId", String(attr.socialAttributeId));
                            }
                            formData.append("IsPhoto", "true");

                            const uploadResult = hasDetailId
                                ? await replaceSocialPhotoAction(attr.id!, formData)
                                : await uploadSocialPhotoAction(formData);

                            if (!uploadResult.success || !uploadResult.data) {
                                throw new Error(uploadResult.error || `Failed to upload file for ${attr.socialAttributeName}`);
                            }

                            uploadedDetails[attr.socialAttributeId] = {
                                propertySocialDetailId: uploadResult.data.propertySocialDetailId,
                                documentBindingId: uploadResult.data.documentBindingId,
                                documentGuid: uploadResult.data.documentGuid,
                                documentUrl: `/api/documents/${encodeURIComponent(uploadResult.data.documentGuid)}/view`
                            };
                        }

                        // 3. Update state with uploaded file data and clear pendingFile
                        const finalSocialData = { ...socialData };
                        Object.keys(uploadedDetails).forEach((key) => {
                            const attrId = Number(key);
                            const info = uploadedDetails[attrId];
                            finalSocialData[attrId] = {
                                ...finalSocialData[attrId],
                                id: info.propertySocialDetailId,
                                documentBindingId: info.documentBindingId,
                                documentGuid: info.documentGuid,
                                documentUrl: info.documentUrl,
                                pendingFile: undefined,
                                isUploading: false
                            };
                        });

                        if (Object.keys(uploadedDetails).length > 0) {
                            setFormState(prev => ({
                                ...prev,
                                data: { ...prev.data, ...finalSocialData }
                            }));
                        }

                        // 4. Map the state to API payload
                        const { socialAttributes, socialAttributeIdsToRemove } = mapSocialStateToApi(finalSocialData, initialFlatData);

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
                    } catch (error: unknown) {
                        // Reset uploading loaders on error
                        setFormState(prev => {
                            const nextData = { ...prev.data };
                            Object.keys(nextData).forEach((key) => {
                                const attrId = Number(key);
                                if (nextData[attrId].isUploading) {
                                    nextData[attrId] = { ...nextData[attrId], isUploading: false };
                                }
                            });
                            return { ...prev, data: nextData };
                        });
                        const msg = error instanceof Error ? error.message : String(error);
                        toast.error(msg || t("discount.socialConfirm.unexpectedError") || "An unexpected error occurred while saving.");
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
        handlePhotoDelete,
        handleSave
    };
};
export { checkSocialRequiredFields };

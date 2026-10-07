import { useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import { 
    upsertPropertySocialInfoAction,
    deletePropertySocialDetailsByHierarchyAction,
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/social-actions";
import { PropertySocialInfoResponseDto, DeletePropertySocialDetailsByHierarchyParams, PropertySocialDetailsDto, SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
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

import { SocialAttribute } from "@/types/social-attribute.types";

export const useSocialDetailsForm = (
    initialSocialData: PropertySocialInfoResponseDto | null,
    propertyId: string,
    masterAttributes?: SocialAttribute[],
    options?: {
        level?: 'Apartment' | 'Wing' | 'Unit';
        societyDetailId?: string | null;
        wingDetailId?: string | null;
        propertyIds?: string;
        isSociety?: boolean;
        selectedUnitCount?: number;
        totalUnitCount?: number;
        savedPropertyDetails?: (PropertySocialDetailsDto | SocialAttributeHierarchyDto)[];
        editingUnitId?: number | null;
    }
) => {
    const t = useTranslations("quickDataEntry");
    const { isLoading: isSaving, startLoading: startSaveLoading, stopLoading: stopSaveLoading } = useLoading(false);
    const { isLoading: isDeleting, startLoading: startDeleteLoading, stopLoading: stopDeleteLoading } = useLoading(false);
    const params = useParams();
    const locale = params.locale as string;
    const { confirm } = useConfirm();

    const {
        socialData, validationErrors, setFormState,
        hasChanges, initialFlatData, setSavedFlatData, handleInputChange, handleToggleEnabled,
        resetWithFreshData, clearPendingFiles
    } = useSocialFormState(initialSocialData, masterAttributes, {
        level: options?.level,
        savedPropertyDetails: options?.savedPropertyDetails,
        editingUnitId: options?.editingUnitId,
    });

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
        if (isSaving || isDeleting) return { success: false, isValid: true };
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
                    startSaveLoading();
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
                        
                        if (options?.level) formData.append("level", options.level);
                        if (options?.societyDetailId) formData.append("societyDetailId", options.societyDetailId);
                        if (options?.wingDetailId) formData.append("wingDetailId", options.wingDetailId);
                        if (options?.propertyIds) formData.append("propertyIds", options.propertyIds);
                        if (options?.isSociety !== undefined) formData.append("isSociety", String(options.isSociety));
                        if (options?.selectedUnitCount !== undefined) formData.append("selectedUnitCount", String(options.selectedUnitCount));
                        if (options?.totalUnitCount !== undefined) formData.append("totalUnitCount", String(options.totalUnitCount));

                        // Append pending files
                        Object.values(socialData).forEach(item => {
                            if (isAttributeEnabled(item, socialData) && item.pendingFile) {
                                formData.append(`file_${item.socialAttributeId}`, item.pendingFile);
                            }
                        });

                        const response = await upsertPropertySocialInfoAction(locale, propertyId, formData);
                        if (response.success) {
                            if (response.data) {
                                resetWithFreshData(response.data);
                            } else {
                                clearPendingFiles();
                            }
                            toast.success(response.message || t("discount.socialConfirm.saveSuccess") || "Saved successfully!");
                            resolve({ success: true, isValid: true });
                        } else {
                            toast.error(response.error || t("discount.socialConfirm.saveError") || "Failed to save.");
                            resolve({ success: false, isValid: true });
                        }
                    } catch (error: unknown) {
                        toast.error(error instanceof Error ? error.message : String(error));
                        resolve({ success: false, isValid: true });
                    } finally { stopSaveLoading(); }
                },
                onCancel: () => resolve({ success: false, isValid: true })
            });
        });
    };

    const handleDeleteSocialDetail = useCallback(async (id: number) => {
        if (isSaving || isDeleting) return;
        const activeItem = socialData[id];
        if (!activeItem) return;

        const isSavedOnBackend = typeof activeItem.id === "number" && activeItem.id > 0;

        startDeleteLoading();
        try {
            if (isSavedOnBackend) {
                const isSocietyMode = options?.isSociety === true && !!options?.societyDetailId;
                const socId = options?.societyDetailId ? Number(options.societyDetailId) : undefined;
                const wingId = options?.wingDetailId ? Number(options.wingDetailId) : undefined;
                const docBindingId = (activeItem.documentBindingId ?? activeItem.photoBindingId) ?? undefined;

                const hierarchyParams: DeletePropertySocialDetailsByHierarchyParams = {
                    socialAttributeId: id,
                };

                if (!isSocietyMode) {
                    // Individual Property
                    hierarchyParams.entityType = 'P';
                    if (propertyId && !isNaN(Number(propertyId))) {
                        hierarchyParams.propertyId = Number(propertyId);
                        hierarchyParams.propertyIds = [Number(propertyId)];
                    }
                    if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                } else if (options?.level === 'Apartment') {
                    // Apartment Level: societyDetailsId, socialAttributeId, documentBindingId
                    hierarchyParams.entityType = 'S';
                    if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                    if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                } else if (options?.level === 'Wing') {
                    // Wing Level: societyDetailsId, wingDetailId, socialAttributeId, documentBindingId
                    hierarchyParams.entityType = 'W';
                    if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                    if (wingId !== undefined) hierarchyParams.wingDetailId = wingId;
                    if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                } else if (options?.level === 'Unit') {
                    // Unit Level
                    hierarchyParams.entityType = 'P';
                    if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                    if (wingId !== undefined) hierarchyParams.wingDetailId = wingId;

                    const selectedIds = options?.propertyIds
                        ? options.propertyIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
                        : [];

                    const isAllUnits = options?.totalUnitCount && options?.selectedUnitCount
                        ? options.selectedUnitCount >= options.totalUnitCount
                        : false;

                    if (isAllUnits) {
                        // When all units in wing: entityType W can delete wing level or propertyIds for all
                        if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                        if (selectedIds.length > 0) hierarchyParams.propertyIds = selectedIds;
                    } else {
                        // Specific units: propertyIds
                        if (selectedIds.length > 0) {
                            hierarchyParams.propertyIds = selectedIds;
                        } else if (propertyId && !isNaN(Number(propertyId))) {
                            hierarchyParams.propertyIds = [Number(propertyId)];
                            hierarchyParams.propertyId = Number(propertyId);
                        }
                    }
                } else {
                    hierarchyParams.entityType = 'P';
                    if (propertyId && !isNaN(Number(propertyId))) {
                        hierarchyParams.propertyId = Number(propertyId);
                        hierarchyParams.propertyIds = [Number(propertyId)];
                    }
                }

                const response = await deletePropertySocialDetailsByHierarchyAction(
                    hierarchyParams,
                    propertyId,
                    locale
                );

                if (!response.success) {
                    toast.error(response.error || "Failed to delete social details");
                    return;
                }
            }

            // Clear local state recursively for this attribute and its children
            setFormState(prev => {
                const nextData = { ...prev.data };
                const nextErrors = { ...prev.errors };

                const clearAttributeAndChildren = (attrs: Record<number, FlatSocialAttributeState>, targetId: number) => {
                    const item = attrs[targetId];
                    if (!item) return;

                    attrs[targetId] = {
                        ...item,
                        bitValue: false,
                        intValue: null,
                        decimalValue: null,
                        textValue: null,
                        dateValue: null,
                        remark: "",
                        documentGuid: null,
                        documentBindingId: null,
                        documentUrl: null,
                        pendingFile: undefined,
                        id: null // Reset backend ID
                    };

                    delete nextErrors[targetId];

                    Object.values(attrs).forEach(attr => {
                        if (attr.parentAttributeId === targetId) {
                            clearAttributeAndChildren(attrs, attr.socialAttributeId);
                        }
                    });
                };

                clearAttributeAndChildren(nextData, id);
                setSavedFlatData(nextData);

                return {
                    data: nextData,
                    errors: nextErrors
                };
            });

            toast.success(t("discount.deleteSuccess") || "Social detail and associated data deleted successfully!");
        } catch (_error) {
            toast.error("An error occurred while deleting the social details");
        } finally {
            stopDeleteLoading();
        }
    }, [
        socialData,
        isSaving,
        isDeleting,
        propertyId,
        locale,
        options?.isSociety,
        options?.societyDetailId,
        options?.wingDetailId,
        options?.propertyIds,
        options?.selectedUnitCount,
        options?.totalUnitCount,
        options?.level,
        setFormState,
        setSavedFlatData,
        startDeleteLoading,
        stopDeleteLoading,
        t
    ]);

    const revertSocialAttribute = useCallback((id: number) => {
        setFormState((prev) => {
            const initialItem = initialFlatData[id];
            if (!initialItem) return prev;
            const hasDbValues = typeof initialItem.id === "number" && initialItem.id > 0;
            if (!hasDbValues) return prev;
            
            const nextData = { ...prev.data, [id]: { ...initialItem } };
            const nextErrors = { ...prev.errors };
            delete nextErrors[id];

            return {
                data: nextData,
                errors: nextErrors
            };
        });
    }, [initialFlatData, setFormState]);

    const translateCallback = useCallback((key: string, params?: Record<string, string | number | Date>) => {
        return t(key, params);
    }, [t]);

    const isFormValid = useMemo(() => {
        try {
            const errs = validateSocialDetails(socialData, translateCallback);
            return Object.keys(errs).length === 0;
        } catch (_error) {
            return false;
        }
    }, [socialData, translateCallback]);

    return {
        socialData, isSaving, isDeleting, hasChanges, isFormValid, validationErrors, incompleteAttributes,
        isAttributeEnabled: (attr: FlatSocialAttributeState) => isAttributeEnabled(attr, socialData),
        handleInputChange, handleToggleEnabled, handlePhotoUpload, handlePhotoDelete, handleDeleteSocialDetail, handleSave, revertSocialAttribute
    };
};
export { checkSocialRequiredFields };

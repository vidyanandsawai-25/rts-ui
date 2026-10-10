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
import { getDocumentViewUrl } from "@/lib/utils/document-utils";

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

        const isDirectSavedOnBackend = typeof activeItem.id === "number" && activeItem.id > 0;
        const isInheritedSavedOnBackend = activeItem.isInherited || (options?.savedPropertyDetails || []).some(p => {
            const attrId = 'socialAttributeId' in p && p.socialAttributeId != null ? Number(p.socialAttributeId) : Number(p.id);
            return attrId === id && p.isActive !== false;
        });
        const isSavedOnBackend = isDirectSavedOnBackend || isInheritedSavedOnBackend || activeItem.isOverridden;

        startDeleteLoading();
        try {
            let deletedScope: 'Wing' | 'Apartment' | 'Unit' = 'Unit';

            if (isSavedOnBackend) {
                const isSocietyMode = options?.isSociety === true && !!options?.societyDetailId;
                const socId = options?.societyDetailId ? Number(options.societyDetailId) : undefined;
                const wingId = options?.wingDetailId ? Number(options.wingDetailId) : undefined;

                const wingRecord = (options?.savedPropertyDetails || []).find((p) => {
                    const attrId = 'socialAttributeId' in p && p.socialAttributeId != null ? Number(p.socialAttributeId) : Number(p.id);
                    const entityType = 'entityType' in p ? p.entityType : undefined;
                    const rawPropId = 'propertyId' in p ? p.propertyId : undefined;
                    const itemPropId = rawPropId != null ? Number(rawPropId) : undefined;
                    const rawWingId = 'wingDetailId' in p ? p.wingDetailId : undefined;
                    const itemWingId = rawWingId != null ? Number(rawWingId) : undefined;
                    const isActive = 'isActive' in p ? p.isActive : true;

                    return (
                        attrId === id &&
                        (entityType === 'W' || (itemWingId && Number(itemWingId) === Number(wingId) && (!itemPropId || itemPropId === 0))) &&
                        isActive !== false
                    );
                });

                const apartmentRecord = (options?.savedPropertyDetails || []).find((p) => {
                    const attrId = 'socialAttributeId' in p && p.socialAttributeId != null ? Number(p.socialAttributeId) : Number(p.id);
                    const entityType = 'entityType' in p ? p.entityType : undefined;
                    const rawPropId = 'propertyId' in p ? p.propertyId : undefined;
                    const itemPropId = rawPropId != null ? Number(rawPropId) : undefined;
                    const rawWingId = 'wingDetailId' in p ? p.wingDetailId : undefined;
                    const itemWingId = rawWingId != null ? Number(rawWingId) : undefined;
                    const isActive = 'isActive' in p ? p.isActive : true;

                    return (
                        attrId === id &&
                        (entityType === 'S' || (!itemWingId && !itemPropId)) &&
                        isActive !== false
                    );
                });

                const wRec = wingRecord ? (wingRecord as unknown as Record<string, unknown>) : null;
                const aRec = apartmentRecord ? (apartmentRecord as unknown as Record<string, unknown>) : null;

                const rawDocBindingId = (activeItem.documentBindingId ?? activeItem.photoBindingId) ?? 
                    (wRec ? (wRec.documentBindingId as number | undefined) ?? (wRec.photoBindingId as number | undefined) : undefined) ?? 
                    (aRec ? (aRec.documentBindingId as number | undefined) ?? (aRec.photoBindingId as number | undefined) : undefined);
                const docBindingId = typeof rawDocBindingId === 'number' ? rawDocBindingId : undefined;

                const hierarchyParams: DeletePropertySocialDetailsByHierarchyParams = {
                    socialAttributeId: id,
                };

                const selectedIds = options?.propertyIds
                    ? options.propertyIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0)
                    : [];
                const targetUnitId = options?.editingUnitId || (selectedIds.length === 1 ? selectedIds[0] : (activeItem.propertyId || undefined));

                if (!isSocietyMode) {
                    // Individual Property
                    deletedScope = 'Unit';
                    hierarchyParams.entityType = 'P';
                    const pId = targetUnitId || (propertyId && !isNaN(Number(propertyId)) ? Number(propertyId) : undefined);
                    if (pId) {
                        hierarchyParams.propertyId = pId;
                        hierarchyParams.propertyIds = [pId];
                    }
                    if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                } else if (activeItem.isOverridden) {
                    // Override deletion targets the specific level
                    if (options?.level === 'Wing') {
                        deletedScope = 'Wing';
                        hierarchyParams.entityType = 'W';
                        if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                        if (wingId !== undefined) hierarchyParams.wingDetailId = wingId;
                        if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                    } else if (options?.level === 'Unit') {
                        deletedScope = 'Unit';
                        hierarchyParams.entityType = 'P';
                        if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                        if (wingId !== undefined) hierarchyParams.wingDetailId = wingId;
                        if (selectedIds.length > 0) {
                            hierarchyParams.propertyIds = selectedIds;
                            if (selectedIds.length === 1) hierarchyParams.propertyId = selectedIds[0];
                        } else if (targetUnitId) {
                            hierarchyParams.propertyId = targetUnitId;
                            hierarchyParams.propertyIds = [targetUnitId];
                        }
                        if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                    }
                } else {
                    // Origin-aware deletion: delete from the level where it originated
                    const isApartmentOrigin = (activeItem.inheritedFrom || '').toUpperCase() === 'APARTMENT' ||
                                              (activeItem.inheritanceLevel || '').toUpperCase() === 'APARTMENT' ||
                                              ((activeItem.entityType || '').toUpperCase() === 'S' && activeItem.isInherited) ||
                                              (options?.level === 'Apartment') ||
                                              ((activeItem.entityType || '').toUpperCase() === 'S') ||
                                              (!isDirectSavedOnBackend && !wingRecord && !!apartmentRecord);

                    const isWingOrigin = !isApartmentOrigin && (
                                         (activeItem.inheritedFrom || '').toUpperCase() === 'WING' ||
                                         (activeItem.inheritanceLevel || '').toUpperCase() === 'WING' ||
                                         ((activeItem.entityType || '').toUpperCase() === 'W' && activeItem.isInherited) ||
                                         (options?.level === 'Wing') ||
                                         ((activeItem.entityType || '').toUpperCase() === 'W') ||
                                         (!isDirectSavedOnBackend && !!wingRecord));

                    if (isApartmentOrigin) {
                        deletedScope = 'Apartment';
                        hierarchyParams.entityType = 'S';
                        if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                        if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                    } else if (isWingOrigin) {
                        deletedScope = 'Wing';
                        hierarchyParams.entityType = 'W';
                        if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                        if (wingId !== undefined) hierarchyParams.wingDetailId = wingId;
                        if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                    } else {
                        // Unit level deletion
                        deletedScope = 'Unit';
                        hierarchyParams.entityType = 'P';
                        if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                        if (wingId !== undefined) hierarchyParams.wingDetailId = wingId;
                        if (selectedIds.length > 0) {
                            hierarchyParams.propertyIds = selectedIds;
                            if (selectedIds.length === 1) hierarchyParams.propertyId = selectedIds[0];
                        } else if (targetUnitId) {
                            hierarchyParams.propertyId = targetUnitId;
                            hierarchyParams.propertyIds = [targetUnitId];
                        } else if (propertyId && !isNaN(Number(propertyId))) {
                            hierarchyParams.propertyId = Number(propertyId);
                            hierarchyParams.propertyIds = [Number(propertyId)];
                        }
                        if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
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

            // Revert or clear local state recursively for this attribute and its children
            setFormState(prev => {
                const nextData = { ...prev.data };
                const nextErrors = { ...prev.errors };
                const wingId = options?.wingDetailId ? Number(options.wingDetailId) : undefined;

                const revertOrClearAttributeAndChildren = (attrs: Record<number, FlatSocialAttributeState>, targetId: number) => {
                    const item = attrs[targetId];
                    if (!item) return;

                    // Find wing record in savedPropertyDetails if available (only if wing was NOT what got deleted)
                    const wingRecord = deletedScope !== 'Wing' ? (options?.savedPropertyDetails || []).find((p) => {
                        const attrId = 'socialAttributeId' in p && p.socialAttributeId != null ? Number(p.socialAttributeId) : Number(p.id);
                        const entityType = 'entityType' in p ? p.entityType : undefined;
                        const rawPropId = 'propertyId' in p ? p.propertyId : undefined;
                        const itemPropId = rawPropId != null ? Number(rawPropId) : undefined;
                        const rawWingId = 'wingDetailId' in p ? p.wingDetailId : undefined;
                        const itemWingId = rawWingId != null ? Number(rawWingId) : undefined;
                        const isActive = 'isActive' in p ? p.isActive : true;

                        return (
                            attrId === targetId &&
                            (entityType === 'W' || (itemWingId && Number(itemWingId) === Number(wingId) && (!itemPropId || itemPropId === 0))) &&
                            isActive !== false
                        );
                    }) : undefined;

                    // Find apartment record in savedPropertyDetails if available (only if apartment was NOT what got deleted)
                    const apartmentRecord = deletedScope !== 'Apartment' ? (options?.savedPropertyDetails || []).find((p) => {
                        const attrId = 'socialAttributeId' in p && p.socialAttributeId != null ? Number(p.socialAttributeId) : Number(p.id);
                        const entityType = 'entityType' in p ? p.entityType : undefined;
                        const rawPropId = 'propertyId' in p ? p.propertyId : undefined;
                        const itemPropId = rawPropId != null ? Number(rawPropId) : undefined;
                        const rawWingId = 'wingDetailId' in p ? p.wingDetailId : undefined;
                        const itemWingId = rawWingId != null ? Number(rawWingId) : undefined;
                        const isActive = 'isActive' in p ? p.isActive : true;

                        return (
                            attrId === targetId &&
                            (entityType === 'S' || (!itemWingId && !itemPropId)) &&
                            isActive !== false
                        );
                    }) : undefined;

                    if (options?.level === 'Unit' && wingRecord) {
                        const wRec = wingRecord as unknown as Record<string, unknown>;
                        attrs[targetId] = {
                            ...item,
                            pendingFile: undefined,
                            documentGuid: (wRec.documentGuid as string) || null,
                            documentBindingId: (wRec.documentBindingId as number) || null,
                            documentUrl: (wRec.documentUrl as string) || getDocumentViewUrl(wRec.documentGuid as string),
                            photoGuid: (wRec.photoGuid as string) || null,
                            photoBindingId: (wRec.photoBindingId as number) || null,
                            intValue: wRec.intValue != null ? Number(wRec.intValue) : null,
                            decimalValue: wRec.decimalValue != null ? Number(wRec.decimalValue) : null,
                            textValue: (wRec.textValue as string) || null,
                            dateValue: (wRec.dateValue as string) || null,
                            remark: (wRec.remark as string) || null,
                            bitValue: wRec.bitValue !== false,
                            id: null,
                            propertyId: options?.editingUnitId || item.propertyId || null,
                            entityType: 'W',
                            isInherited: true,
                            inheritanceLevel: 'Wing',
                            inheritedFrom: 'Wing',
                            isOverridden: false,
                        };
                    } else if ((options?.level === 'Unit' || options?.level === 'Wing') && apartmentRecord) {
                        const aRec = apartmentRecord as unknown as Record<string, unknown>;
                        attrs[targetId] = {
                            ...item,
                            pendingFile: undefined,
                            documentGuid: (aRec.documentGuid as string) || null,
                            documentBindingId: (aRec.documentBindingId as number) || null,
                            documentUrl: (aRec.documentUrl as string) || getDocumentViewUrl(aRec.documentGuid as string),
                            photoGuid: (aRec.photoGuid as string) || null,
                            photoBindingId: (aRec.photoBindingId as number) || null,
                            intValue: aRec.intValue != null ? Number(aRec.intValue) : null,
                            decimalValue: aRec.decimalValue != null ? Number(aRec.decimalValue) : null,
                            textValue: (aRec.textValue as string) || null,
                            dateValue: (aRec.dateValue as string) || null,
                            remark: (aRec.remark as string) || null,
                            bitValue: aRec.bitValue !== false,
                            id: null,
                            propertyId: options?.editingUnitId || item.propertyId || null,
                            entityType: 'S',
                            isInherited: true,
                            inheritanceLevel: 'Apartment',
                            inheritedFrom: 'Apartment',
                            isOverridden: false,
                        };
                    } else {
                        attrs[targetId] = {
                            ...item,
                            pendingFile: undefined,
                            documentGuid: null,
                            documentBindingId: null,
                            documentUrl: null,
                            photoGuid: null,
                            photoBindingId: null,
                            intValue: null,
                            decimalValue: null,
                            textValue: null,
                            dateValue: null,
                            remark: null,
                            bitValue: false,
                            id: null,
                            propertyId: options?.editingUnitId || item.propertyId || null,
                            entityType: options?.level === 'Apartment' ? 'S' : options?.level === 'Wing' ? 'W' : 'P',
                            isInherited: false,
                            inheritanceLevel: 'Self',
                            inheritedFrom: null,
                            isOverridden: false,
                        };
                    }

                    delete nextErrors[targetId];

                    Object.values(attrs).forEach(attr => {
                        if (attr.parentAttributeId === targetId) {
                            revertOrClearAttributeAndChildren(attrs, attr.socialAttributeId);
                        }
                    });
                };

                revertOrClearAttributeAndChildren(nextData, id);
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
        options?.level,
        options?.editingUnitId,
        options?.savedPropertyDetails,
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

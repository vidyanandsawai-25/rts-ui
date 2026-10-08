"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import {
    updateDiscountDetailsAction,
    deletePropertySocialDetailsByHierarchyAction,
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/discount-actions";
import { DiscountState, DiscountAttributeState, PropertyDiscountInfoResponseDto } from "@/types/discount.types";
import { useTranslations } from "next-intl";
import { 
    mapApiToDiscountState, 
    mapDiscountStateToApi, 
    hasDiscountChangesComparedToInitial,
    buildUnitDiscountState 
} from "@/lib/utils/discount-helpers";
import { validateDiscountForm } from "@/lib/utils/validateDiscountForm";
import { SocialAttribute } from "@/types/social-attribute.types";
import { DeletePropertySocialDetailsByHierarchyParams, PropertySocialDetailsDto } from "@/types/property-social-details.types";

export const useDiscountForm = (
    initialDiscountData: PropertyDiscountInfoResponseDto | null,
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
        savedPropertyDetails?: PropertySocialDetailsDto[];
        editingUnitId?: number | null;
    }
) => {
    const t = useTranslations('quickDataEntry');
    const { isLoading: isSaving, startLoading: startSaveLoading, stopLoading: stopSaveLoading } = useLoading(false);
    const { isLoading: isDeleting, startLoading: startDeleteLoading, stopLoading: stopDeleteLoading } = useLoading(false);
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
    const [incompleteDiscounts, setIncompleteDiscounts] = useState<{ id: number; name: string }[]>([]);
    const params = useParams();
    const locale = params.locale as string;

    const initialMappedState = useMemo(() => {
        const base = mapApiToDiscountState(initialDiscountData, masterAttributes, options?.level);
        return buildUnitDiscountState(
            masterAttributes,
            base,
            options?.savedPropertyDetails,
            options?.editingUnitId,
            options?.level
        );
    }, [initialDiscountData, masterAttributes, options?.level, options?.savedPropertyDetails, options?.editingUnitId]);

    const [savedDiscountState, setSavedDiscountState] = useState<DiscountState>(() => initialMappedState);
    const [discountData, setDiscountData] = useState<DiscountState>(() => initialMappedState);

    const hasChanges = useMemo(() => {
        return hasDiscountChangesComparedToInitial(discountData, savedDiscountState);
    }, [discountData, savedDiscountState]);

    const editingUnitIdRef = useRef(options?.editingUnitId);
    const levelRef = useRef(options?.level);

    useEffect(() => {
        if (
            options?.editingUnitId !== editingUnitIdRef.current ||
            options?.level !== levelRef.current
        ) {
            editingUnitIdRef.current = options?.editingUnitId;
            levelRef.current = options?.level;
            setSavedDiscountState(initialMappedState);
            setDiscountData(initialMappedState);
        }
    }, [options?.editingUnitId, options?.level, initialMappedState]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as unknown as { __discountFormHasChanges?: boolean }).__discountFormHasChanges = hasChanges;
        }
        return () => {
            if (typeof window !== "undefined") {
                (window as unknown as { __discountFormHasChanges?: boolean }).__discountFormHasChanges = false;
            }
        };
    }, [hasChanges]);

    const clearError = useCallback((id: number) => {
        setValidationErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setIncompleteDiscounts((prev) => prev.filter((d) => d.id !== id));
    }, []);

    const handleToggleEnabled = useCallback((id: number, checked: boolean) => {
        setDiscountData((prev) => {
            const item = prev[id];
            if (!item) return prev;
            const isBitType = item.dataType?.toUpperCase() === "BIT";
            const isOverridden = item.isInherited ? true : item.isOverridden;

            if (!checked) {
                return {
                    ...prev,
                    [id]: {
                        ...item,
                        enabled: false,
                        bitValue: isBitType ? false : item.bitValue,
                        pendingFile: undefined,
                        documentGuid: null,
                        documentBindingId: null,
                        documentUrl: null,
                        fileName: undefined,
                        intValue: null,
                        decimalValue: null,
                        textValue: null,
                        dateValue: null,
                        remark: "",
                        isOverridden: false
                    }
                };
            }

            return {
                ...prev,
                [id]: {
                    ...item,
                    enabled: checked,
                    bitValue: isBitType ? checked : item.bitValue,
                    isOverridden
                }
            };
        });
        clearError(id);
    }, [clearError]);

    const handleInputChange = useCallback((id: number, field: "intValue" | "decimalValue" | "textValue" | "dateValue" | "remark", value: string) => {
        setDiscountData((prev) => {
            const item = prev[id];
            if (!item) return prev;
            const isBitType = item.dataType.toUpperCase() === "BIT";
            const isActive = isBitType ? item.bitValue === true : item.enabled;
            if (!isActive) return prev;
            const isOverridden = item.isInherited ? true : item.isOverridden;
            return {
                ...prev,
                [id]: {
                    ...item,
                    [field]: value,
                    isOverridden
                }
            };
        });
        clearError(id);
    }, [clearError]);

    const handleFileUpload = useCallback((id: number, file: File) => {
        if (file.size > 5 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
            toast.error(t("discount.uploadInvalidFile") || "Invalid file");
            return;
        }
        setDiscountData(prev => {
            const item = prev[id];
            if (!item) return prev;
            const isBitType = item.dataType.toUpperCase() === "BIT";
            const isActive = isBitType ? item.bitValue === true : item.enabled;
            if (!isActive) return prev;
            const isOverridden = item.isInherited ? true : item.isOverridden;
            return {
                ...prev,
                [id]: {
                    ...item,
                    pendingFile: file,
                    documentGuid: "pending",
                    fileName: file.name,
                    documentUrl: undefined,
                    isOverridden
                }
            };
        });
        clearError(id);
    }, [t, clearError]);

    const handleFileDelete = useCallback((id: number) => {
        setDiscountData(prev => {
            const item = prev[id];
            if (!item) return prev;
            if (item.isInherited && !item.isOverridden) return prev;
            const isOverridden = item.isInherited ? true : item.isOverridden;
            return {
                ...prev,
                [id]: {
                    ...item,
                    pendingFile: undefined,
                    documentGuid: null,
                    documentBindingId: null,
                    documentUrl: null,
                    fileName: undefined,
                    isOverridden
                }
            };
        });
        clearError(id);
        toast.success(t("discount.fileRemoved") || "File removed from form. Click Save Changes to apply.");
    }, [clearError, t]);

    const handleDeleteDiscount = useCallback(async (id: number) => {
        if (isSaving || isDeleting) return;
        const activeItem = discountData[id];
        if (!activeItem) return;

        const isDirectSavedOnBackend = typeof activeItem.propertySocialDetailId === "number" && activeItem.propertySocialDetailId > 0;
        const isInheritedSavedOnBackend = activeItem.isInherited || (options?.savedPropertyDetails || []).some(p => {
            const attrId = p.socialAttributeId ?? p.id;
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
                    const attrId = p.socialAttributeId ?? p.id;
                    return (
                        attrId === id &&
                        (p.entityType === 'W' || (p.wingDetailId && Number(p.wingDetailId) === Number(wingId) && (!p.propertyId || Number(p.propertyId) === 0))) &&
                        p.isActive !== false
                    );
                });

                const apartmentRecord = (options?.savedPropertyDetails || []).find((p) => {
                    const attrId = p.socialAttributeId ?? p.id;
                    return (
                        attrId === id &&
                        (p.entityType === 'S' || (!p.wingDetailId && !p.propertyId)) &&
                        p.isActive !== false
                    );
                });

                const docBindingId = activeItem.documentBindingId ?? wingRecord?.documentBindingId ?? apartmentRecord?.documentBindingId ?? undefined;

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
                    toast.error(response.error || "Failed to delete discount details");
                    return;
                }
            }

            // Revert or clear local state
            setDiscountData(prev => {
                const item = prev[id];
                if (!item) return prev;

                const wingId = options?.wingDetailId ? Number(options.wingDetailId) : undefined;

                // Find wing record in savedPropertyDetails if available (only if wing was NOT what got deleted)
                const wingRecord = deletedScope !== 'Wing' ? (options?.savedPropertyDetails || []).find((p) => {
                    const attrId = p.socialAttributeId ?? p.id;
                    return (
                        attrId === id &&
                        (p.entityType === 'W' || (p.wingDetailId && Number(p.wingDetailId) === Number(wingId) && (!p.propertyId || Number(p.propertyId) === 0))) &&
                        p.isActive !== false
                    );
                }) : undefined;

                // Find apartment record in savedPropertyDetails if available (only if apartment was NOT what got deleted)
                const apartmentRecord = deletedScope !== 'Apartment' ? (options?.savedPropertyDetails || []).find((p) => {
                    const attrId = p.socialAttributeId ?? p.id;
                    return (
                        attrId === id &&
                        (p.entityType === 'S' || (!p.wingDetailId && !p.propertyId)) &&
                        p.isActive !== false
                    );
                }) : undefined;

                let nextItem: DiscountAttributeState;

                if (options?.level === 'Unit' && wingRecord) {
                    nextItem = {
                        ...item,
                        pendingFile: undefined,
                        documentGuid: wingRecord.documentGuid || null,
                        documentBindingId: wingRecord.documentBindingId || null,
                        documentUrl: wingRecord.documentUrl || (wingRecord.documentGuid ? `/api/documents/${wingRecord.documentGuid}/view` : undefined),
                        fileName: wingRecord.fileName || undefined,
                        intValue: wingRecord.intValue != null ? String(wingRecord.intValue) : null,
                        decimalValue: wingRecord.decimalValue != null ? String(wingRecord.decimalValue) : null,
                        textValue: wingRecord.textValue || null,
                        dateValue: wingRecord.dateValue ? String(wingRecord.dateValue).split("T")[0] : null,
                        remark: wingRecord.remark || "",
                        enabled: wingRecord.bitValue !== false,
                        bitValue: wingRecord.bitValue ?? true,
                        propertySocialDetailId: null,
                        propertyId: options?.editingUnitId || item.propertyId || null,
                        entityType: 'W',
                        isInherited: true,
                        inheritanceLevel: 'Wing',
                        inheritedFrom: 'Wing',
                        isOverridden: false,
                    };
                } else if ((options?.level === 'Unit' || options?.level === 'Wing') && apartmentRecord) {
                    nextItem = {
                        ...item,
                        pendingFile: undefined,
                        documentGuid: apartmentRecord.documentGuid || null,
                        documentBindingId: apartmentRecord.documentBindingId || null,
                        documentUrl: apartmentRecord.documentUrl || (apartmentRecord.documentGuid ? `/api/documents/${apartmentRecord.documentGuid}/view` : undefined),
                        fileName: apartmentRecord.fileName || undefined,
                        intValue: apartmentRecord.intValue != null ? String(apartmentRecord.intValue) : null,
                        decimalValue: apartmentRecord.decimalValue != null ? String(apartmentRecord.decimalValue) : null,
                        textValue: apartmentRecord.textValue || null,
                        dateValue: apartmentRecord.dateValue ? String(apartmentRecord.dateValue).split("T")[0] : null,
                        remark: apartmentRecord.remark || "",
                        enabled: apartmentRecord.bitValue !== false,
                        bitValue: apartmentRecord.bitValue ?? true,
                        propertySocialDetailId: null,
                        propertyId: options?.editingUnitId || item.propertyId || null,
                        entityType: 'S',
                        isInherited: true,
                        inheritanceLevel: 'Apartment',
                        inheritedFrom: 'Apartment',
                        isOverridden: false,
                    };
                } else {
                    nextItem = {
                        ...item,
                        pendingFile: undefined,
                        documentGuid: null,
                        documentBindingId: null,
                        documentUrl: null,
                        fileName: undefined,
                        intValue: null,
                        decimalValue: null,
                        textValue: null,
                        dateValue: null,
                        remark: "",
                        enabled: false,
                        bitValue: false,
                        propertySocialDetailId: null,
                        propertyId: options?.editingUnitId || item.propertyId || null,
                        entityType: options?.level === 'Apartment' ? 'S' : options?.level === 'Wing' ? 'W' : 'P',
                        isInherited: false,
                        inheritanceLevel: 'Self',
                        inheritedFrom: null,
                        isOverridden: false,
                    };
                }

                const next = {
                    ...prev,
                    [id]: nextItem
                };
                setSavedDiscountState(next);
                return next;
            });
            clearError(id);

            toast.success(t("discount.deleteSuccess") || "Discount and associated data deleted successfully!");
        } catch (_error) {
            toast.error("An error occurred while deleting the discount details");
        } finally {
            stopDeleteLoading();
        }
    }, [
        discountData,
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
        clearError,
        startDeleteLoading,
        stopDeleteLoading,
        t
    ]);

    const handleSave = async () => {
        if (isSaving || isDeleting) return { success: false, isValid: true };
        try {
            const { isValid, errors, incompleteDiscounts: invalidDiscounts } = validateDiscountForm(discountData, translateCallback);
            if (!isValid) {
                setValidationErrors(errors);
                setIncompleteDiscounts(invalidDiscounts);
                const firstIncomplete = invalidDiscounts[0];
                if (firstIncomplete) {
                    toast.error(t("discount.validation.incomplete", { name: firstIncomplete.name }) || `Please complete: ${firstIncomplete.name}`);
                }
                return { success: false, isValid: false, incompleteDiscounts: invalidDiscounts };
            }
        } catch (validationError: unknown) {
            console.error("Validation error:", validationError);
            const errorMsg = validationError instanceof Error 
                ? validationError.message 
                : "Validation failed. Please refresh and try again.";
            toast.error(t("discount.socialValidation.correctErrors") || errorMsg);
            return { success: false, isValid: false };
        }
        setValidationErrors({});
        setIncompleteDiscounts([]);
        startSaveLoading();

        try {
            const formData = new FormData();
            const payload = mapDiscountStateToApi(discountData);
            formData.append("discountAttributes", JSON.stringify(payload));

            if (options?.level) formData.append("level", options.level);
            if (options?.societyDetailId) formData.append("societyDetailId", options.societyDetailId);
            if (options?.wingDetailId) formData.append("wingDetailId", options.wingDetailId);
            if (options?.propertyIds) formData.append("propertyIds", options.propertyIds);
            if (options?.isSociety !== undefined) formData.append("isSociety", String(options.isSociety));
            if (options?.selectedUnitCount !== undefined) formData.append("selectedUnitCount", String(options.selectedUnitCount));
            if (options?.totalUnitCount !== undefined) formData.append("totalUnitCount", String(options.totalUnitCount));

            // Append pending files
            Object.values(discountData).forEach(item => {
                if (item.enabled && item.pendingFile) {
                    formData.append(`file_${item.id}`, item.pendingFile);
                }
            });

            const response = await updateDiscountDetailsAction(locale, propertyId, formData);
            if (response.success) {
                setDiscountData(prev => {
                    const next = { ...prev };
                    const freshMap = new Map((response.data?.discountAttributes || []).map(a => [a.id, a]));

                    Object.keys(next).forEach(k => {
                        const id = Number(k);
                        const item = next[id];
                        if (!item) return;
                        const fresh = freshMap.get(id);

                        next[id] = {
                            ...item,
                            propertySocialDetailId: fresh?.propertySocialDetailId || item.propertySocialDetailId,
                            documentBindingId: fresh?.documentBindingId || item.documentBindingId || null,
                            documentGuid: fresh?.documentGuid || (item.documentGuid === "pending" ? null : item.documentGuid),
                            documentUrl: fresh?.documentUrl || item.documentUrl || (fresh?.documentGuid ? `/api/documents/${encodeURIComponent(fresh.documentGuid)}/view` : null),
                            fileName: fresh?.fileName || item.fileName,
                            pendingFile: undefined,
                            isOverridden: false
                        };
                    });

                    setSavedDiscountState(next);
                    return next;
                });

                toast.success(t("discount.saveSuccess") || "Discount details saved successfully!");
                return { success: true, isValid: true };
            }
            toast.error(response.error || t("discount.saveError") || "Failed to save");
            return { success: false, isValid: true };
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error));
            return { success: false, isValid: true };
        } finally { stopSaveLoading(); }
    };

    const revertDiscount = useCallback((id: number) => {
        setDiscountData((prev) => {
            const initialItem = savedDiscountState[id];
            if (!initialItem) return prev;
            const hasDbValues = typeof initialItem.propertySocialDetailId === "number" && initialItem.propertySocialDetailId > 0;
            if (!hasDbValues) return prev;
            return {
                ...prev,
                [id]: { ...initialItem }
            };
        });
        setValidationErrors((prev) => { const next = { ...prev }; delete next[id]; return next; });
        setIncompleteDiscounts((prev) => prev.filter((d) => d.id !== id));
    }, [savedDiscountState]);

    const translateCallback = useCallback((key: string, params?: Record<string, string | number>) => {
        return t(key, params);
    }, [t]);

    const isFormValid = useMemo(() => {
        try {
            const { isValid } = validateDiscountForm(discountData, translateCallback);
            return isValid;
        } catch (_error) {
            return false;
        }
    }, [discountData, translateCallback]);

    return { discountData, isSaving, isDeleting, hasChanges, isFormValid, validationErrors, incompleteDiscounts, handleToggleEnabled, handleInputChange, handleFileUpload, handleFileDelete, handleDeleteDiscount, handleSave, revertDiscount, t };
};

"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useLoading } from "@/hooks/useLoading";
import {
    updateDiscountDetailsAction,
    deletePropertySocialDetailsByHierarchyAction,
} from "@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/Discount/discount-actions";
import { DiscountState, PropertyDiscountInfoResponseDto } from "@/types/discount.types";
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
    const { isLoading: isSaving, startLoading, stopLoading } = useLoading(false);
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

    const [discountData, setDiscountData] = useState<DiscountState>(() => initialMappedState);

    const hasChanges = useMemo(() => {
        return hasDiscountChangesComparedToInitial(discountData, initialMappedState);
    }, [discountData, initialMappedState]);

    const [prevInitialDiscountData, setPrevInitialDiscountData] = useState(initialDiscountData);
    const [prevEditingUnitId, setPrevEditingUnitId] = useState(options?.editingUnitId);
    const [prevLevel, setPrevLevel] = useState(options?.level);

    if (
        initialDiscountData !== prevInitialDiscountData ||
        options?.editingUnitId !== prevEditingUnitId ||
        options?.level !== prevLevel
    ) {
        setPrevInitialDiscountData(initialDiscountData);
        setPrevEditingUnitId(options?.editingUnitId);
        setPrevLevel(options?.level);
        setDiscountData(initialMappedState);
    }

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
        const activeItem = discountData[id];
        if (!activeItem) return;

        const isSavedOnBackend = typeof activeItem.propertySocialDetailId === "number" && activeItem.propertySocialDetailId > 0;

        startLoading();
        try {
            if (isSavedOnBackend) {
                const isSocietyMode = options?.isSociety === true && !!options?.societyDetailId;
                const socId = options?.societyDetailId ? Number(options.societyDetailId) : undefined;
                const wingId = options?.wingDetailId ? Number(options.wingDetailId) : undefined;
                const docBindingId = activeItem.documentBindingId ?? undefined;

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
                    // Apartment Level: societyDetailsId, socialAttributeId, documentBindingId (propertyId not passed or 0/null)
                    hierarchyParams.entityType = 'S';
                    if (socId !== undefined) hierarchyParams.societyDetailsId = socId;
                    if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                } else if (options?.level === 'Wing') {
                    // Wing Level: societyDetailsId, wingDetailId, socialAttributeId, documentBindingId (propertyId not passed or 0/null)
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
                        // Case 2 (All units): socialAttributeId, societyDetailsId, wingDetailId, documentBindingId, propertyIds
                        if (docBindingId !== undefined) hierarchyParams.documentBindingId = docBindingId;
                        if (selectedIds.length > 0) hierarchyParams.propertyIds = selectedIds;
                    } else {
                        // Case 1 (Specific units): societyDetailsId, wingDetailId, socialAttributeId, propertyIds
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
                    toast.error(response.error || "Failed to delete discount details");
                    return;
                }
            }

            // Clear local state and disable toggle
            setDiscountData(prev => {
                const item = prev[id];
                if (!item) return prev;
                return {
                    ...prev,
                    [id]: {
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
                        propertySocialDetailId: null // Reset backend ID
                    }
                };
            });
            clearError(id);

            toast.success(t("discount.deleteSuccess") || "Discount and associated data deleted successfully!");
        } catch (_error) {
            toast.error("An error occurred while deleting the discount details");
        } finally {
            stopLoading();
        }
    }, [discountData, propertyId, locale, options, clearError, startLoading, stopLoading, t]);

    const handleSave = async () => {
        if (isSaving) return { success: false, isValid: true };
        const { isValid, errors, incompleteDiscounts: invalidDiscounts } = validateDiscountForm(discountData, (key, params) => t(key, params));
        if (!isValid) {
            setValidationErrors(errors);
            setIncompleteDiscounts(invalidDiscounts);
            return { success: false, isValid: false, incompleteDiscounts: invalidDiscounts };
        }
        setValidationErrors({});
        setIncompleteDiscounts([]);
        startLoading();

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
                if (response.data) {
                    const freshMapped = mapApiToDiscountState(response.data, masterAttributes, options?.level);
                    setDiscountData(freshMapped);
                    setPrevInitialDiscountData(response.data);
                } else {
                    // Fallback: clear pendingFile on all attributes and reset temporary 'pending' documentGuid
                    setDiscountData(prev => {
                        const next = { ...prev };
                        Object.keys(next).forEach(k => {
                            const id = Number(k);
                            if (next[id]) {
                                next[id] = {
                                    ...next[id],
                                    pendingFile: undefined,
                                    documentGuid: next[id].documentGuid === "pending" ? null : next[id].documentGuid,
                                };
                            }
                        });
                        return next;
                    });
                }

                toast.success(t("discount.saveSuccess") || "Discount details saved successfully!");
                return { success: true, isValid: true };
            }
            toast.error(response.error || t("discount.saveError") || "Failed to save");
            return { success: false, isValid: true };
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : String(error));
            return { success: false, isValid: true };
        } finally { stopLoading(); }
    };

    const revertDiscount = useCallback((id: number) => {
        setDiscountData((prev) => {
            const initialItem = initialMappedState[id];
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
    }, [initialMappedState]);

    return { discountData, isSaving, hasChanges, validationErrors, incompleteDiscounts, handleToggleEnabled, handleInputChange, handleFileUpload, handleFileDelete, handleDeleteDiscount, handleSave, revertDiscount, t };
};

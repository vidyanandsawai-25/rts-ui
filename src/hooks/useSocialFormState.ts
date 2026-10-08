import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { FlatSocialAttributeState, flattenAttributes } from "@/lib/utils/social-details";
import { hasSocialChangesComparedToInitial } from "@/lib/utils/social-changes";
import { getDocumentViewUrl } from "@/lib/utils/document-utils";
import { PropertySocialInfoResponseDto, PropertySocialDetailsDto, SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
import { SocialAttribute } from "@/types/social-attribute.types";

export function buildUnitSocialState(
    initialSocialData: PropertySocialInfoResponseDto | null,
    masterAttributes: SocialAttribute[] | undefined,
    savedPropertyDetails: (PropertySocialDetailsDto | SocialAttributeHierarchyDto)[] | undefined,
    editingUnitId: number | null | undefined,
    level: 'Apartment' | 'Wing' | 'Unit' | undefined
): Record<number, FlatSocialAttributeState> {
    const flatData = flattenAttributes(initialSocialData?.socialAttributes || []);
    if (masterAttributes && masterAttributes.length > 0) {
        masterAttributes.forEach(attr => {
            if (!flatData[attr.id]) {
                const isBitType = attr.dataType.toUpperCase() === "BIT";
                const isRootAttr = attr.parentAttributeId === null || attr.parentAttributeId === undefined;
                flatData[attr.id] = {
                    id: null,
                    socialAttributeId: attr.id,
                    socialAttributeCode: attr.socialAttributeCode,
                    socialAttributeName: attr.socialAttributeName,
                    dataType: attr.dataType,
                    parentAttributeId: attr.parentAttributeId,
                    isRequiredWhenParentTrue: attr.isRequiredWhenParentTrue,
                    bitValue: (isBitType || isRootAttr) ? false : null,
                    intValue: null,
                    decimalValue: null,
                    textValue: null,
                    dateValue: null,
                    documentBindingId: null,
                    remark: null,
                    isUploading: false,
                    isPhotoRequired: attr.isPhotoRequired,
                    isDocumentRequired: attr.isDocumentRequired,
                    documentGuid: null,
                    documentUrl: null,
                    photoBindingId: null,
                    photoGuid: null
                };
            }
        });
    }

    if (level !== 'Unit' || !editingUnitId) {
        return flatData;
    }

    const result = { ...flatData };
    const attrIds = masterAttributes && masterAttributes.length > 0
        ? masterAttributes.map(a => a.id)
        : Object.keys(flatData).map(Number);
    const masterById = new Map((masterAttributes || []).map(a => [a.id, a]));

    attrIds.forEach((attrId) => {
        const base = flatData[attrId];
        const master = masterById.get(attrId);

        // Find direct unit record in savedPropertyDetails
        const directRecord = (savedPropertyDetails || []).find((item) => {
            const itemAttrId = 'socialAttributeId' in item && item.socialAttributeId != null
                ? Number(item.socialAttributeId)
                : Number(item.id);
            const rawPropId = 'propertyId' in item ? item.propertyId : undefined;
            const itemPropId = rawPropId != null ? Number(rawPropId) : undefined;
            const entityType = 'entityType' in item ? item.entityType : undefined;
            const isActive = 'isActive' in item ? item.isActive : true;

            return (
                itemAttrId === attrId &&
                itemPropId === editingUnitId &&
                (entityType === 'P' || (!('wingDetailId' in item && item.wingDetailId) && !('societyDetailId' in item && item.societyDetailId)) || (itemPropId && itemPropId > 0)) &&
                isActive !== false
            );
        });

        if (directRecord) {
            const recId = ('propertySocialDetailId' in directRecord && directRecord.propertySocialDetailId)
                ? Number(directRecord.propertySocialDetailId)
                : Number(directRecord.id);
            const isBitType = (master?.dataType || base?.dataType || '').toUpperCase() === 'BIT';
            const docUrl = ('documentUrl' in directRecord && directRecord.documentUrl)
                ? (directRecord.documentUrl as string)
                : getDocumentViewUrl(directRecord.documentGuid);

            result[attrId] = {
                id: recId > 0 ? recId : null,
                socialAttributeId: attrId,
                socialAttributeCode: master?.socialAttributeCode || base?.socialAttributeCode || '',
                socialAttributeName: master?.socialAttributeName || base?.socialAttributeName || '',
                dataType: master?.dataType || base?.dataType || 'BIT',
                parentAttributeId: master?.parentAttributeId ?? base?.parentAttributeId ?? null,
                isRequiredWhenParentTrue: master?.isRequiredWhenParentTrue ?? base?.isRequiredWhenParentTrue ?? false,
                bitValue: directRecord.bitValue ?? (isBitType ? true : false),
                intValue: directRecord.intValue != null ? Number(directRecord.intValue) : null,
                decimalValue: directRecord.decimalValue != null ? Number(directRecord.decimalValue) : null,
                textValue: directRecord.textValue || null,
                dateValue: directRecord.dateValue || null,
                documentBindingId: directRecord.documentBindingId || null,
                documentGuid: directRecord.documentGuid || null,
                documentUrl: docUrl,
                photoBindingId: directRecord.photoBindingId || null,
                photoGuid: directRecord.photoGuid || null,
                remark: directRecord.remark || null,
                isUploading: false,
                isPhotoRequired: master?.isPhotoRequired ?? base?.isPhotoRequired,
                isDocumentRequired: master?.isDocumentRequired ?? base?.isDocumentRequired,
                entityType: 'P',
                propertyId: ('propertyId' in directRecord && directRecord.propertyId) ? Number(directRecord.propertyId) : (editingUnitId || null),
                isInherited: false,
                inheritanceLevel: 'Self',
                inheritedFrom: null,
                isOverridden: false,
            };
        } else {
            // Find wing record in savedPropertyDetails if available
            const wingRecord = (savedPropertyDetails || []).find((item) => {
                const itemAttrId = 'socialAttributeId' in item && item.socialAttributeId != null
                    ? Number(item.socialAttributeId)
                    : Number(item.id);
                const entityType = 'entityType' in item ? item.entityType : undefined;
                const rawPropId = 'propertyId' in item ? item.propertyId : undefined;
                const itemPropId = rawPropId != null ? Number(rawPropId) : undefined;
                const rawWingId = 'wingDetailId' in item ? item.wingDetailId : undefined;
                const itemWingId = rawWingId != null ? Number(rawWingId) : undefined;
                const isActive = 'isActive' in item ? item.isActive : true;

                return (
                    itemAttrId === attrId &&
                    (entityType === 'W' || (itemWingId && itemWingId > 0 && (!itemPropId || itemPropId === 0))) &&
                    isActive !== false
                );
            });

            // Find apartment record in savedPropertyDetails if available
            const apartmentRecord = (savedPropertyDetails || []).find((item) => {
                const itemAttrId = 'socialAttributeId' in item && item.socialAttributeId != null
                    ? Number(item.socialAttributeId)
                    : Number(item.id);
                const entityType = 'entityType' in item ? item.entityType : undefined;
                const rawPropId = 'propertyId' in item ? item.propertyId : undefined;
                const itemPropId = rawPropId != null ? Number(rawPropId) : undefined;
                const rawWingId = 'wingDetailId' in item ? item.wingDetailId : undefined;
                const itemWingId = rawWingId != null ? Number(rawWingId) : undefined;
                const isActive = 'isActive' in item ? item.isActive : true;

                return (
                    itemAttrId === attrId &&
                    (entityType === 'S' || (!itemWingId && !itemPropId)) &&
                    isActive !== false
                );
            });

            const wRec = wingRecord ? (wingRecord as unknown as Record<string, unknown>) : null;
            const aRec = apartmentRecord ? (apartmentRecord as unknown as Record<string, unknown>) : null;

            const inheritedDocGuid = base?.documentGuid || (wRec?.documentGuid as string | undefined) || (aRec?.documentGuid as string | undefined) || null;
            const inheritedDocUrl = base?.documentUrl || (wRec?.documentUrl as string | undefined) || getDocumentViewUrl(inheritedDocGuid);
            const inheritedPhotoGuid = base?.photoGuid || (wRec?.photoGuid as string | undefined) || (aRec?.photoGuid as string | undefined) || null;
            const inheritedPhotoBindingId = base?.photoBindingId || (wRec?.photoBindingId as number | undefined) || (aRec?.photoBindingId as number | undefined) || null;
            const inheritedDocBindingId = base?.documentBindingId || (wRec?.documentBindingId as number | undefined) || (aRec?.documentBindingId as number | undefined) || null;
            const inheritedRemark = base?.remark || (wRec?.remark as string | undefined) || (aRec?.remark as string | undefined) || null;
            const inheritedIntValue = base?.intValue ?? (wRec?.intValue != null ? Number(wRec.intValue) : (aRec?.intValue != null ? Number(aRec.intValue) : null));
            const inheritedDecimalValue = base?.decimalValue ?? (wRec?.decimalValue != null ? Number(wRec.decimalValue) : (aRec?.decimalValue != null ? Number(aRec.decimalValue) : null));
            const inheritedTextValue = base?.textValue ?? (wRec?.textValue as string | undefined || aRec?.textValue as string | undefined || null);
            const inheritedDateValue = base?.dateValue ?? (wRec?.dateValue as string | undefined || aRec?.dateValue as string | undefined || null);

            const isInheritedFromWing = Boolean(wingRecord || (base?.isInherited && base?.inheritanceLevel === 'Wing'));
            const isInheritedFromApt = Boolean(apartmentRecord || (base?.isInherited && base?.inheritanceLevel === 'Apartment'));
            const isInherited = isInheritedFromWing || isInheritedFromApt || (base?.isInherited ?? false);
            const resolvedInheritanceLevel = isInheritedFromWing ? 'Wing' : (isInheritedFromApt ? 'Apartment' : (base?.inheritanceLevel || 'Self'));
            const resolvedInheritedFrom = isInherited ? resolvedInheritanceLevel : null;
            const bitValue = Boolean(base?.bitValue || (wRec && wRec.bitValue !== false) || (aRec && aRec.bitValue !== false));

            result[attrId] = {
                ...base,
                id: null,
                bitValue,
                intValue: inheritedIntValue,
                decimalValue: inheritedDecimalValue,
                textValue: inheritedTextValue,
                dateValue: inheritedDateValue,
                documentBindingId: inheritedDocBindingId,
                documentGuid: inheritedDocGuid,
                documentUrl: inheritedDocUrl,
                photoBindingId: inheritedPhotoBindingId,
                photoGuid: inheritedPhotoGuid,
                remark: inheritedRemark,
                entityType: isInheritedFromWing ? 'W' : (isInheritedFromApt ? 'S' : (base?.entityType || 'P')),
                propertyId: editingUnitId,
                isInherited,
                inheritanceLevel: resolvedInheritanceLevel,
                inheritedFrom: resolvedInheritedFrom,
                isOverridden: false,
            };
        }
    });

    return result;
}

export const useSocialFormState = (
    initialSocialData: PropertySocialInfoResponseDto | null,
    masterAttributes?: SocialAttribute[],
    options?: {
        level?: 'Apartment' | 'Wing' | 'Unit';
        savedPropertyDetails?: (PropertySocialDetailsDto | SocialAttributeHierarchyDto)[];
        editingUnitId?: number | null;
    }
) => {
    const buildInitialData = useCallback(() => {
        return buildUnitSocialState(
            initialSocialData,
            masterAttributes,
            options?.savedPropertyDetails,
            options?.editingUnitId,
            options?.level
        );
    }, [initialSocialData, masterAttributes, options?.savedPropertyDetails, options?.editingUnitId, options?.level]);

    const [savedFlatData, setSavedFlatData] = useState<Record<number, FlatSocialAttributeState>>(() => buildInitialData());

    const [formState, setFormState] = useState<{
        data: Record<number, FlatSocialAttributeState>;
        errors: Record<number, string>;
    }>(() => ({
        data: buildInitialData(),
        errors: {}
    }));

    const hasChanges = useMemo(() => {
        return hasSocialChangesComparedToInitial(formState.data, savedFlatData);
    }, [formState.data, savedFlatData]);

    const editingUnitIdRef = useRef(options?.editingUnitId);
    const levelRef = useRef(options?.level);

    useEffect(() => {
        if (
            options?.editingUnitId !== editingUnitIdRef.current ||
            options?.level !== levelRef.current
        ) {
            editingUnitIdRef.current = options?.editingUnitId;
            levelRef.current = options?.level;
            const nextInitial = buildInitialData();
            setSavedFlatData(nextInitial);
            setFormState({
                data: nextInitial,
                errors: {}
            });
        }
    }, [options?.editingUnitId, options?.level, buildInitialData]);

    const resetWithFreshData = useCallback((freshData?: PropertySocialInfoResponseDto | null) => {
        setFormState((prev) => {
            const nextData = { ...prev.data };
            const freshMap = freshData?.socialAttributes && freshData.socialAttributes.length > 0
                ? flattenAttributes(freshData.socialAttributes)
                : {};

            Object.keys(nextData).forEach((k) => {
                const id = Number(k);
                const currentItem = nextData[id];
                if (!currentItem) return;
                const freshItem = freshMap[id];

                nextData[id] = {
                    ...currentItem,
                    id: freshItem?.id ?? currentItem.id,
                    bitValue: freshItem ? (freshItem.bitValue ?? currentItem.bitValue) : currentItem.bitValue,
                    intValue: freshItem ? (freshItem.intValue ?? currentItem.intValue) : currentItem.intValue,
                    decimalValue: freshItem ? (freshItem.decimalValue ?? currentItem.decimalValue) : currentItem.decimalValue,
                    textValue: freshItem ? (freshItem.textValue ?? currentItem.textValue) : currentItem.textValue,
                    dateValue: freshItem ? (freshItem.dateValue ?? currentItem.dateValue) : currentItem.dateValue,
                    remark: freshItem ? (freshItem.remark ?? currentItem.remark) : currentItem.remark,
                    documentBindingId: freshItem?.documentBindingId || currentItem.documentBindingId || null,
                    documentGuid: freshItem?.documentGuid || (currentItem.documentGuid === "pending" ? null : currentItem.documentGuid),
                    documentUrl: freshItem?.documentUrl || currentItem.documentUrl || (freshItem?.documentGuid ? `/api/documents/${encodeURIComponent(freshItem.documentGuid)}/view` : null),
                    photoBindingId: freshItem?.photoBindingId || currentItem.photoBindingId || null,
                    photoGuid: freshItem?.photoGuid || (currentItem.photoGuid === "pending" ? null : currentItem.photoGuid),
                    fileName: freshItem?.fileName || currentItem.fileName || null,
                    pendingFile: undefined,
                    isOverridden: false,
                };
            });

            setSavedFlatData(nextData);
            return {
                data: nextData,
                errors: {}
            };
        });
    }, []);

    const clearPendingFiles = useCallback(() => {
        setFormState((prev) => {
            const nextData = { ...prev.data };
            Object.keys(nextData).forEach((k) => {
                const id = Number(k);
                const item = nextData[id];
                if (item && (item.pendingFile || item.documentGuid === "pending")) {
                    nextData[id] = {
                        ...item,
                        pendingFile: undefined,
                        documentGuid: item.documentGuid === "pending" ? null : item.documentGuid,
                        isOverridden: false,
                    };
                }
            });
            setSavedFlatData(nextData);
            return {
                data: nextData,
                errors: {}
            };
        });
    }, []);

    const handleInputChange = useCallback((
        attributeId: number,
        field: keyof FlatSocialAttributeState,
        value: string | number | boolean | null | undefined
    ) => {
        setFormState((prev) => {
            const nextData = { ...prev.data };
            const currentAttr = nextData[attributeId];
            if (!currentAttr) return prev;

            const isOverridden = currentAttr.isInherited ? true : currentAttr.isOverridden;
            nextData[attributeId] = { ...currentAttr, [field]: value, isOverridden };

            // When user enters data on an attribute or child, automatically activate bitValue: true
            const findAndEnableRoot = (item: FlatSocialAttributeState) => {
                if (item.parentAttributeId && nextData[item.parentAttributeId]) {
                    const parent = nextData[item.parentAttributeId]!;
                    if (parent.bitValue !== true) {
                        nextData[parent.socialAttributeId] = {
                            ...parent,
                            bitValue: true,
                            isOverridden: parent.isInherited ? true : parent.isOverridden
                        };
                    }
                    findAndEnableRoot(parent);
                } else if (!item.parentAttributeId && (item.dataType || '').toUpperCase() === 'BIT' && field !== 'bitValue') {
                    if (item.bitValue !== true && value !== null && value !== undefined && String(value).trim() !== '') {
                        nextData[item.socialAttributeId] = {
                            ...item,
                            bitValue: true,
                            isOverridden: item.isInherited ? true : item.isOverridden
                        };
                    }
                }
            };
            findAndEnableRoot(currentAttr);
            
            const nextErrors = { ...prev.errors };
            delete nextErrors[attributeId];

            return {
                data: nextData,
                errors: nextErrors
            };
        });
    }, []);

    const handleToggleEnabled = useCallback((attributeId: number, checked: boolean) => {
        setFormState((prev) => {
            const nextData = { ...prev.data };
            const currentAttr = nextData[attributeId];
            if (!currentAttr) return prev;

            const isOverridden = currentAttr.isInherited ? true : currentAttr.isOverridden;
            const nextErrors = { ...prev.errors };
            delete nextErrors[attributeId];

            if (!checked) {
                const resetAttributeData = (attr: FlatSocialAttributeState): FlatSocialAttributeState => ({
                    ...attr,
                    bitValue: false,
                    intValue: null,
                    decimalValue: null,
                    textValue: null,
                    dateValue: null,
                    documentBindingId: null,
                    documentGuid: null,
                    documentUrl: null,
                    photoBindingId: null,
                    photoGuid: null,
                    uploadedGuid: undefined,
                    fileName: null,
                    pendingFile: undefined,
                    remark: null,
                    isOverridden: false
                });

                nextData[attributeId] = resetAttributeData(currentAttr);

                const resetChildren = (parentId: number, visited = new Set<number>()) => {
                    if (visited.has(parentId)) return;
                    visited.add(parentId);

                    Object.values(nextData).forEach((attr) => {
                        if (attr.parentAttributeId === parentId) {
                            delete nextErrors[attr.socialAttributeId];
                            nextData[attr.socialAttributeId] = resetAttributeData(attr);
                            resetChildren(attr.socialAttributeId, visited);
                        }
                    });
                };
                resetChildren(attributeId);
            } else {
                nextData[attributeId] = { ...currentAttr, bitValue: checked, isOverridden };
            }

            return {
                data: nextData,
                errors: nextErrors
            };
        });
    }, []);

    return {
        socialData: formState.data,
        validationErrors: formState.errors,
        setFormState,
        hasChanges,
        initialFlatData: savedFlatData,
        setSavedFlatData,
        handleInputChange,
        handleToggleEnabled,
        resetWithFreshData,
        clearPendingFiles
    };
};

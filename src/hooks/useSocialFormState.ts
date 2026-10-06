import { useState, useMemo, useCallback } from "react";
import { FlatSocialAttributeState, flattenAttributes } from "@/lib/utils/social-details";
import { hasSocialChangesComparedToInitial } from "@/lib/utils/social-changes";
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
                : (directRecord.documentGuid ? `/api/documents/${directRecord.documentGuid}/view` : null);

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
            const inheritedDocUrl = base?.documentUrl || (wRec?.documentUrl as string | undefined) || (inheritedDocGuid ? `/api/documents/${inheritedDocGuid}/view` : null);
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

    const [prevInitialSocialData, setPrevInitialSocialData] = useState(initialSocialData);
    const [prevEditingUnitId, setPrevEditingUnitId] = useState(options?.editingUnitId);
    const [prevLevel, setPrevLevel] = useState(options?.level);

    if (
        initialSocialData !== prevInitialSocialData ||
        options?.editingUnitId !== prevEditingUnitId ||
        options?.level !== prevLevel
    ) {
        setPrevInitialSocialData(initialSocialData);
        setPrevEditingUnitId(options?.editingUnitId);
        setPrevLevel(options?.level);
        const nextInitial = buildInitialData();
        setSavedFlatData(nextInitial);
        setFormState({
            data: nextInitial,
            errors: {}
        });
    }

    const resetWithFreshData = useCallback((freshData: PropertySocialInfoResponseDto) => {
        const flatData = flattenAttributes(freshData?.socialAttributes || []);
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
        setSavedFlatData(flatData);
        setFormState({
            data: flatData,
            errors: {}
        });
        setPrevInitialSocialData(freshData);
    }, [masterAttributes]);

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
                    };
                }
            });
            return {
                ...prev,
                data: nextData
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
            nextData[attributeId] = { ...currentAttr, bitValue: checked, isOverridden };
            
            const nextErrors = { ...prev.errors };
            delete nextErrors[attributeId];

            if (!checked) {
                Object.values(nextData).forEach((attr) => {
                    if (attr.parentAttributeId === attributeId) {
                        delete nextErrors[attr.socialAttributeId];
                    }
                });
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
        handleInputChange,
        handleToggleEnabled,
        resetWithFreshData,
        clearPendingFiles
    };
};

import { 
    DiscountState, 
    PropertyDiscountInfoResponseDto,
    DiscountAttributeItemDto
} from "@/types/discount.types";
import { getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttribute } from "@/types/social-attribute.types";
import { PropertySocialDetailsDto } from "@/types/property-social-details.types";

/**
 * Maps the API response DTO to the dynamic local form state.
 * All document metadata (documentGuid, documentUrl) comes directly from the
 * server response — no client-side caching or fallback is used.
 */
export const mapApiToDiscountState = (
    data: PropertyDiscountInfoResponseDto | null,
    masterAttributes?: SocialAttribute[],
    currentLevel?: 'Apartment' | 'Wing' | 'Unit'
): DiscountState => {
    const state: DiscountState = {} as DiscountState;

    if (masterAttributes && masterAttributes.length > 0) {
        masterAttributes.forEach(attr => {
            const isBitType = attr.dataType.toUpperCase() === "BIT";
            state[attr.id] = {
                id: attr.id,
                socialAttributeCode: attr.socialAttributeCode,
                socialAttributeName: attr.socialAttributeName,
                dataType: attr.dataType,
                unit: attr.unit,
                displayOrder: attr.displayOrder,
                isDiscountApplicable: attr.isDiscountApplicable,
                isPhotoRequired: attr.isPhotoRequired,
                isDocumentRequired: attr.isDocumentRequired,
                isActive: attr.isActive,
                propertySocialDetailId: null,
                entityType: currentLevel === 'Apartment' ? 'S' : currentLevel === 'Wing' ? 'W' : 'P',
                bitValue: isBitType ? false : null,
                intValue: null,
                decimalValue: null,
                textValue: null,
                dateValue: null,
                documentBindingId: null,
                documentGuid: null,
                documentUrl: null,
                remark: null,
                enabled: false,
                isUploading: false,
            };
        });
    }

    if (data?.discountAttributes) {
        data.discountAttributes.forEach((attr) => {
            const isBitType = attr.dataType.toUpperCase() === "BIT";
            const bitValue = attr.bitValue ?? false;
            const docGuid = attr.documentGuid || null;
            const docUrl = attr.documentUrl || (docGuid ? `/api/documents/${docGuid}/view` : null);
            const fileName = attr.fileName || undefined;

            const inheritedFromUpper = (attr.inheritedFrom || '').toUpperCase();
            const entityTypeUpper = (attr.entityType || '').toUpperCase();
            const inheritanceLevelUpper = (attr.inheritanceLevel || '').toUpperCase();

            const isFromApartment = inheritanceLevelUpper === 'APARTMENT' || inheritedFromUpper === 'APARTMENT' || inheritedFromUpper === 'SOCIETY' || entityTypeUpper === 'S';
            const isFromWing = inheritanceLevelUpper === 'WING' || inheritedFromUpper === 'WING' || entityTypeUpper === 'W';
            const isInherited = (currentLevel === 'Wing' && isFromApartment) ||
                                (currentLevel === 'Unit' && (isFromApartment || isFromWing));

            const resolvedInheritanceLevel: 'Self' | 'Wing' | 'Apartment' = 
                isInherited
                    ? (isFromWing && currentLevel === 'Unit' ? 'Wing' : 'Apartment')
                    : 'Self';
            const resolvedInheritedFrom: string | null = isInherited ? resolvedInheritanceLevel : null;

            const effectiveBitValue = isInherited ? true : bitValue;
            const effectiveEnabled = isInherited
                ? true
                : (isBitType
                    ? bitValue
                    : (attr.bitValue != null 
                        ? bitValue 
                        : (
                            (attr.intValue !== null && attr.intValue !== 0) || 
                            (attr.decimalValue !== null && attr.decimalValue !== 0) || 
                            attr.textValue !== null || 
                            attr.dateValue !== null
                        )));
            
            state[attr.id] = {
                ...state[attr.id], // preserve master data fields if they exist
                ...attr,
                dataType: attr.dataType,
                intValue: attr.intValue ?? null,
                decimalValue: attr.decimalValue ?? null,
                bitValue: effectiveBitValue,
                enabled: effectiveEnabled,
                dateValue: attr.dateValue ? attr.dateValue.split("T")[0] : null,
                documentGuid: docGuid,
                documentUrl: docUrl,
                fileName: fileName,
                entityType: attr.entityType || (currentLevel === 'Apartment' ? 'S' : currentLevel === 'Wing' ? 'W' : 'P'),
                isInherited: isInherited,
                inheritedFrom: resolvedInheritedFrom,
                inheritanceLevel: resolvedInheritanceLevel,
                isOverridden: false,
                isUploading: false,
            };
        });
    }

    return state;
};

/**
 * Maps the local form state back to the PUT payload structure
 */
export const mapDiscountStateToApi = (state: DiscountState): DiscountAttributeItemDto[] => {
    const discountAttributes: DiscountAttributeItemDto[] = [];

    Object.values(state).forEach((item) => {
        // If an item is inherited and NOT overridden, do not send it — it is dynamically inherited top-down!
        if (item.isInherited && !item.isOverridden) {
            return;
        }

        const isBitType = item.dataType.toUpperCase() === "BIT";
        const enabled = isBitType ? (item.bitValue ?? false) : item.enabled;
        const hasBeenSavedAtThisLevel = !item.isInherited && item.propertySocialDetailId != null;

        if (item.id && item.isDiscountApplicable && (enabled || hasBeenSavedAtThisLevel || item.isOverridden)) {
            
            // Format numeric values safely
            let intValue = null;
            if (enabled && item.intValue !== undefined && item.intValue !== null && String(item.intValue).trim() !== "") {
                const parsed = parseInt(String(item.intValue), 10);
                intValue = isNaN(parsed) ? null : parsed;
            }

            let decimalValue = null;
            if (enabled && item.decimalValue !== undefined && item.decimalValue !== null && String(item.decimalValue).trim() !== "") {
                const parsed = parseFloat(String(item.decimalValue));
                decimalValue = isNaN(parsed) ? null : parsed;
            }

            const textValue = enabled ? (item.textValue || null) : null;
            const dateValue = enabled ? (item.dateValue ? new Date(item.dateValue).toISOString() : null) : null;

            // When updating a direct record, preserve its ID. When overriding an inherited attribute, pass null to create a new direct record.
            const targetDetailId = (!item.isInherited && item.propertySocialDetailId && Number(item.propertySocialDetailId) > 0)
                ? Number(item.propertySocialDetailId)
                : null;

            discountAttributes.push({
                propertySocialDetailId: targetDetailId,
                socialAttributeId: item.id,
                dataType: item.dataType,
                bitValue: enabled,
                intValue,
                decimalValue,
                textValue,
                dateValue,
                documentBindingId: enabled ? (item.documentBindingId ?? null) : null,
                remark: enabled ? (item.remark || null) : null,
                isActive: true,
                entityType: item.entityType || (item.inheritanceLevel === 'Apartment' ? 'S' : item.inheritanceLevel === 'Wing' ? 'W' : 'P'),
                inheritedFrom: item.inheritedFrom,
                inheritanceLevel: item.inheritanceLevel,
            });
        }
    });

    return discountAttributes;
};

/**
 * Filters and sorts discount attributes based on search term and show-active-first option.
 */
export const getFilteredDiscounts = (
    discountData: DiscountState,
    searchTerm: string,
    showActiveFirst: boolean,
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    }
) => {
    let list = Object.values(discountData).sort(
        (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        list = list.filter((discount) => {
            const displayName = getLocalizedName(
                discount.socialAttributeCode,
                discount.socialAttributeName,
                t
            );
            return displayName.toLowerCase().includes(term);
        });
    }
    if (showActiveFirst) {
        list = [...list].sort((a, b) => {
            const aActive = a.dataType.toUpperCase() === "BIT" ? a.bitValue === true : a.enabled;
            const bActive = b.dataType.toUpperCase() === "BIT" ? b.bitValue === true : b.enabled;
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            return (a.displayOrder || 0) - (b.displayOrder || 0);
        });
    }
    return list;
};

/**
 * Checks if the current discount state has changes compared to the initial state.
 */
export const hasDiscountChangesComparedToInitial = (
    current: DiscountState,
    initial: DiscountState
): boolean => {
    const currentKeys = Object.keys(current);
    const initialKeys = Object.keys(initial);
    if (currentKeys.length !== initialKeys.length) return true;

    for (const keyStr of currentKeys) {
        const key = Number(keyStr);
        const currItem = current[key];
        const initItem = initial[key];
        if (!initItem) return true;

        if (currItem.isOverridden) return true;
        if ((currItem.enabled ?? false) !== (initItem.enabled ?? false)) return true;
        if ((currItem.bitValue ?? false) !== (initItem.bitValue ?? false)) return true;

        const currInt = currItem.intValue === "" || currItem.intValue === undefined ? null : currItem.intValue;
        const initInt = initItem.intValue === "" || initItem.intValue === undefined ? null : initItem.intValue;
        if (String(currInt ?? "") !== String(initInt ?? "")) return true;

        const currDec = currItem.decimalValue === "" || currItem.decimalValue === undefined ? null : currItem.decimalValue;
        const initDec = initItem.decimalValue === "" || initItem.decimalValue === undefined ? null : initItem.decimalValue;
        if (String(currDec ?? "") !== String(initDec ?? "")) return true;

        if ((currItem.textValue ?? "") !== (initItem.textValue ?? "")) return true;
        if ((currItem.dateValue ?? "") !== (initItem.dateValue ?? "")) return true;
        if ((currItem.remark ?? "") !== (initItem.remark ?? "")) return true;
        if (currItem.pendingFile !== undefined) return true;
        if ((currItem.documentGuid ?? "") !== (initItem.documentGuid ?? "")) return true;
    }

    return false;
};

/**
 * Hydrates discount state with direct unit-level details from savedPropertyDetails when editing a specific unit.
 */
export const buildUnitDiscountState = (
    masterAttributes: SocialAttribute[] | undefined,
    baseState: DiscountState,
    savedPropertyDetails: PropertySocialDetailsDto[] | undefined,
    editingUnitId: number | null | undefined,
    level: 'Apartment' | 'Wing' | 'Unit' | undefined
): DiscountState => {
    if (level !== 'Unit' || !editingUnitId) {
        return baseState;
    }

    const result: DiscountState = {};
    const attrs = masterAttributes && masterAttributes.length > 0
        ? masterAttributes
        : Object.values(baseState);

    attrs.forEach((attr) => {
        const base = baseState[attr.id];
        // Find direct unit record in savedPropertyDetails
        const directRecord = (savedPropertyDetails || []).find((item) => {
            const attrId = item.socialAttributeId ?? item.id;
            const itemPropId = item.propertyId;
            return (
                attrId === attr.id &&
                itemPropId === editingUnitId &&
                (item.entityType === 'P' || (item.propertyId && item.propertyId > 0)) &&
                item.isActive !== false
            );
        });

        if (directRecord) {
            const isBitType = (attr.dataType || base?.dataType || 'BIT').toUpperCase() === 'BIT';
            result[attr.id] = {
                id: attr.id,
                socialAttributeCode: attr.socialAttributeCode || base?.socialAttributeCode || '',
                socialAttributeName: attr.socialAttributeName || base?.socialAttributeName || '',
                dataType: attr.dataType || base?.dataType || 'BIT',
                unit: attr.unit ?? base?.unit,
                displayOrder: attr.displayOrder ?? base?.displayOrder,
                isPhotoRequired: attr.isPhotoRequired ?? base?.isPhotoRequired,
                isDocumentRequired: attr.isDocumentRequired ?? base?.isDocumentRequired,
                isDiscountApplicable: attr.isDiscountApplicable ?? base?.isDiscountApplicable ?? true,
                propertySocialDetailId: directRecord.id,
                bitValue: directRecord.bitValue ?? (isBitType ? true : false),
                enabled: directRecord.bitValue !== false,
                intValue: directRecord.intValue != null ? String(directRecord.intValue) : null,
                decimalValue: directRecord.decimalValue != null ? String(directRecord.decimalValue) : null,
                textValue: directRecord.textValue || null,
                dateValue: directRecord.dateValue ? String(directRecord.dateValue).split("T")[0] : null,
                documentBindingId: directRecord.documentBindingId || null,
                documentGuid: directRecord.documentGuid || null,
                fileName: directRecord.fileName || undefined,
                documentUrl: directRecord.documentUrl || (directRecord.documentGuid ? `/api/documents/${directRecord.documentGuid}/view` : undefined),
                remark: directRecord.remark || '',
                isInherited: false,
                inheritanceLevel: 'Self',
                inheritedFrom: null,
                isOverridden: false,
                pendingFile: undefined,
            };
        } else {
            // Find wing record in savedPropertyDetails if available
            const wingRecord = (savedPropertyDetails || []).find((item) => {
                const attrId = item.socialAttributeId ?? item.id;
                return (
                    attrId === attr.id &&
                    (item.entityType === 'W' || (item.wingDetailId && item.wingDetailId > 0 && (!item.propertyId || item.propertyId === 0))) &&
                    item.isActive !== false
                );
            });

            // Find apartment record in savedPropertyDetails if available
            const apartmentRecord = (savedPropertyDetails || []).find((item) => {
                const attrId = item.socialAttributeId ?? item.id;
                return (
                    attrId === attr.id &&
                    (item.entityType === 'S' || (!item.wingDetailId && !item.propertyId)) &&
                    item.isActive !== false
                );
            });

            const inheritedDocGuid = base?.documentGuid || wingRecord?.documentGuid || apartmentRecord?.documentGuid || null;
            const inheritedFileName = base?.fileName || wingRecord?.fileName || apartmentRecord?.fileName || undefined;
            const inheritedDocUrl = base?.documentUrl || wingRecord?.documentUrl || (inheritedDocGuid ? `/api/documents/${inheritedDocGuid}/view` : undefined);
            const inheritedRemark = base?.remark || wingRecord?.remark || apartmentRecord?.remark || '';
            const inheritedDocBindingId = base?.documentBindingId || wingRecord?.documentBindingId || apartmentRecord?.documentBindingId || null;
            const inheritedIntValue = base?.intValue ?? (wingRecord?.intValue != null ? String(wingRecord.intValue) : (apartmentRecord?.intValue != null ? String(apartmentRecord.intValue) : null));
            const inheritedDecimalValue = base?.decimalValue ?? (wingRecord?.decimalValue != null ? String(wingRecord.decimalValue) : (apartmentRecord?.decimalValue != null ? String(apartmentRecord.decimalValue) : null));
            const inheritedTextValue = base?.textValue ?? (wingRecord?.textValue || apartmentRecord?.textValue || null);
            const inheritedDateValue = base?.dateValue ?? (wingRecord?.dateValue ? String(wingRecord.dateValue).split("T")[0] : (apartmentRecord?.dateValue ? String(apartmentRecord.dateValue).split("T")[0] : null));

            const isInheritedFromWing = Boolean(wingRecord || (base?.isInherited && base?.inheritanceLevel === 'Wing'));
            const isInheritedFromApt = Boolean(apartmentRecord || (base?.isInherited && base?.inheritanceLevel === 'Apartment'));
            const isInherited = isInheritedFromWing || isInheritedFromApt || (base?.isInherited ?? false);
            const resolvedInheritanceLevel = isInheritedFromWing ? 'Wing' : (isInheritedFromApt ? 'Apartment' : (base?.inheritanceLevel || 'Self'));
            const resolvedInheritedFrom = isInherited ? resolvedInheritanceLevel : null;
            const isEnabled = Boolean(base?.enabled || (wingRecord && wingRecord.bitValue !== false) || (apartmentRecord && apartmentRecord.bitValue !== false));
            const bitValue = Boolean(base?.bitValue || (wingRecord && wingRecord.bitValue !== false) || (apartmentRecord && apartmentRecord.bitValue !== false));

            result[attr.id] = {
                ...base,
                id: attr.id,
                socialAttributeCode: attr.socialAttributeCode || base?.socialAttributeCode || '',
                socialAttributeName: attr.socialAttributeName || base?.socialAttributeName || '',
                dataType: attr.dataType || base?.dataType || 'BIT',
                unit: attr.unit ?? base?.unit,
                displayOrder: attr.displayOrder ?? base?.displayOrder,
                isPhotoRequired: attr.isPhotoRequired ?? base?.isPhotoRequired,
                isDocumentRequired: attr.isDocumentRequired ?? base?.isDocumentRequired,
                isDiscountApplicable: attr.isDiscountApplicable ?? base?.isDiscountApplicable ?? true,
                propertySocialDetailId: null,
                bitValue,
                enabled: isEnabled,
                intValue: inheritedIntValue,
                decimalValue: inheritedDecimalValue,
                textValue: inheritedTextValue,
                dateValue: inheritedDateValue,
                documentBindingId: inheritedDocBindingId,
                documentGuid: inheritedDocGuid,
                fileName: inheritedFileName,
                documentUrl: inheritedDocUrl,
                remark: inheritedRemark,
                isInherited,
                inheritanceLevel: resolvedInheritanceLevel,
                inheritedFrom: resolvedInheritedFrom,
                isOverridden: false,
                pendingFile: undefined,
            };
        }
    });

    return result;
};



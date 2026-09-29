import { 
    DiscountState, 
    PropertyDiscountInfoResponseDto,
    DiscountAttributeItemDto
} from "@/types/discount.types";
import { getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttribute } from "@/types/social-attribute.types";

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

            // When creating an override for an inherited attribute, never pass the parent's database ID!
            const targetDetailId = (item.isInherited || item.isOverridden) ? null : (item.propertySocialDetailId ?? null);

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



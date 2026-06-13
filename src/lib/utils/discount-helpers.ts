import { 
    DiscountState, 
    PropertyDiscountInfoResponseDto,
    DiscountAttributeItemDto
} from "@/types/discount.types";
import { getLocalizedName } from "@/lib/utils/social-details";

/**
 * Maps the API response DTO to the dynamic local form state.
 * All document metadata (documentGuid, documentUrl) comes directly from the
 * server response — no client-side caching or fallback is used.
 */
export const mapApiToDiscountState = (
    data: PropertyDiscountInfoResponseDto | null,
): DiscountState => {
    const state: DiscountState = {} as DiscountState;

    if (!data?.discountAttributes) {
        return state;
    }

    data.discountAttributes.forEach((attr) => {
        state[attr.id] = {
            ...attr,
            dataType: attr.dataType,
            intValue: attr.intValue ?? null,
            decimalValue: attr.decimalValue ?? null,
            enabled: attr.dataType.toUpperCase() === "BIT" ? !!attr.bitValue : (attr.isActive ?? !!attr.bitValue),
            dateValue: attr.dateValue ? attr.dateValue.split("T")[0] : null,
            isUploading: false,
        };
    });

    return state;
};

/**
 * Maps the local form state back to the PUT payload structure
 */
export const mapDiscountStateToApi = (state: DiscountState): DiscountAttributeItemDto[] => {
    const discountAttributes: DiscountAttributeItemDto[] = [];

    Object.values(state).forEach((item) => {
        // Include only discount-applicable items that are either:
        // 1. Currently enabled (need to be saved/updated), OR
        // 2. Previously saved (have propertySocialDetailId) — may need status toggled off
        // Skip never-saved disabled items (propertySocialDetailId is null + bitValue false)
        // as the backend cannot process upserts for non-existent disabled records.
        const hasBeenSaved = item.propertySocialDetailId != null;
        if (item.id && item.isDiscountApplicable && (item.enabled || hasBeenSaved)) {
            const enabled = item.enabled;
            
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

            discountAttributes.push({
                propertySocialDetailId: item.propertySocialDetailId ?? null,
                socialAttributeId: item.id,
                bitValue: enabled,
                intValue,
                decimalValue,
                textValue,
                dateValue,
                documentBindingId: item.documentBindingId ?? null,
                remark: enabled ? (item.remark || null) : null
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
            if (a.enabled && !b.enabled) return -1;
            if (!a.enabled && b.enabled) return 1;
            return (a.displayOrder || 0) - (b.displayOrder || 0);
        });
    }
    return list;
};


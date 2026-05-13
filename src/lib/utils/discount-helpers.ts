import { 
    DiscountApiResponse, 
    DiscountState, 
    DiscountKey, 
    API_MAPPING, 
    DiscountDetailsItem 
} from "@/types/discount.types";

/**
 * Maps API response data to the internal form state for discounts.
 */
export const mapApiToDiscountState = (data: DiscountApiResponse | null): DiscountState => {
    const items = data?.items || {} as DiscountDetailsItem;
    const state = {} as DiscountState;

    const checkEnabled = (pref: string) => {
        return !!items[`${pref}Enabled`];
    };

    (Object.keys(API_MAPPING) as DiscountKey[]).forEach((key) => {
        const prefix = API_MAPPING[key];
        state[key] = {
            enabled: checkEnabled(prefix),
            amount: String(items[`${prefix}Amount`] ?? ""),
            percentage: String(items[`${prefix}Percentage`] ?? ""),
            documentGuid: items[`${prefix}DocumentGuid`] as string || undefined,
        };
    });

    return state;
};

/**
 * Maps the internal form state back to the API payload format.
 */
export const mapDiscountStateToApi = (state: DiscountState): Partial<DiscountDetailsItem> => {
    const payload: Record<string, string | number | boolean | null | undefined> = {};
    (Object.keys(API_MAPPING) as DiscountKey[]).forEach((key) => {
        const prefix = API_MAPPING[key];
        const data = state[key];
        payload[`${prefix}Enabled`] = data.enabled;
        payload[`${prefix}Amount`] = data.amount ? parseFloat(data.amount) : 0;
        payload[`${prefix}Percentage`] = data.percentage ? parseFloat(data.percentage) : 0;
        payload[`${prefix}DocumentGuid`] = data.documentGuid || null;
    });
    return payload as Partial<DiscountDetailsItem>;
};

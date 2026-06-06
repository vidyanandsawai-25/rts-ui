import { FlatSocialAttributeState, isAttributeEnabled, getLocalizedName } from "@/lib/utils/social-details";

/**
 * Validates social details flat attributes state according to backend requirements and data types.
 */
export function validateSocialDetails(
    data: Record<number, FlatSocialAttributeState>,
    t?: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has: (key: string) => boolean;
    }
): Record<number, string> {
    const errors: Record<number, string> = {};

    const getErr = (key: string, defaultMsg: string, values?: Record<string, string | number | Date>) => {
        const fullKey = `discount.socialValidation.${key}`;
        if (t && typeof t.has === 'function' && t.has(fullKey)) {
            return t(fullKey, values);
        }
        if (values) {
            let msg = defaultMsg;
            Object.entries(values).forEach(([k, v]) => {
                msg = msg.replace(`{${k}}`, String(v));
            });
            return msg;
        }
        return defaultMsg;
    };

    Object.values(data).forEach((attr) => {
        const isEnabled = isAttributeEnabled(attr, data);
        if (!isEnabled) return; // skip validation if parent is disabled

        const isSpecialToggle = 
            attr.socialAttributeCode.toUpperCase() === "ROAD_WIDTH" || 
            attr.socialAttributeCode.toUpperCase() === "WATER_CONN_YEAR" || 
            attr.socialAttributeCode.toUpperCase().includes("TREE");

        // 1. Required Check (only for required fields or toggled-on special attributes)
        // Root BIT attributes (feature toggles) should not be required on load.
        const isRequired = 
            (attr.isRequiredWhenParentTrue && !(attr.dataType === "BIT" && !attr.parentAttributeId)) || 
            (isSpecialToggle && attr.bitValue === true);
        if (isRequired) {
            let isEmpty = false;
            if (attr.dataType === "INT" && (attr.intValue === null || attr.intValue === undefined || String(attr.intValue) === "")) {
                isEmpty = true;
            } else if (attr.dataType === "DECIMAL" && (attr.decimalValue === null || attr.decimalValue === undefined || String(attr.decimalValue) === "")) {
                isEmpty = true;
            } else if (attr.dataType === "DATE" && (!attr.dateValue || attr.dateValue.trim() === "")) {
                isEmpty = true;
            } else if (attr.dataType === "TEXT" && (!attr.textValue || attr.textValue.trim() === "")) {
                isEmpty = true;
            } else if (attr.dataType === "BIT" && (attr.bitValue === null || attr.bitValue === undefined)) {
                isEmpty = true;
            }

            if (isEmpty) {
                const fieldName = getLocalizedName(attr.socialAttributeCode, attr.socialAttributeName, t);
                errors[attr.socialAttributeId] = getErr("required", "{fieldName} is required.", { fieldName });
                return;
            }
        }

        // 2. Data Type specific value range check (Only if values are present)
        if (attr.dataType === "INT" && attr.intValue !== null && attr.intValue !== undefined && String(attr.intValue) !== "") {
            const val = Number(attr.intValue);
            const code = attr.socialAttributeCode.toUpperCase();

            if (isNaN(val) || !Number.isInteger(val)) {
                errors[attr.socialAttributeId] = getErr("invalidInteger", "Value must be a valid integer.");
            } else if (val < 0) {
                errors[attr.socialAttributeId] = getErr("negativeNotAllowed", "Value cannot be negative.");
            } else if (attr.isRequiredWhenParentTrue && val < 1) {
                errors[attr.socialAttributeId] = getErr("countMin", "Count must be at least 1.");
            } else {
                const { min, max } = getMinMaxValues(code);
                if (val < min) {
                    if (code === "GREEN_PROPERTY_STAR" || code === "GREEN_PROPERTY_STAR_RATING" || code.includes("STAR_RATING") || code.includes("STAR_RAT")) {
                        errors[attr.socialAttributeId] = getErr("ratingRange", "Rating must be between 1 and 5.");
                    } else if (code === "WATER_CONN_YEAR") {
                        errors[attr.socialAttributeId] = getErr("yearRange", `Year must be between 1900 and ${max}.`, { max: max ?? new Date().getFullYear() });
                    } else {
                        errors[attr.socialAttributeId] = getErr("minVal", `Value cannot be less than ${min}.`, { min });
                    }
                } else if (max !== undefined && val > max) {
                    if (code.includes("BOREWELL")) {
                        errors[attr.socialAttributeId] = getErr("maxBorewell", "Number of borewells cannot exceed 50.");
                    } else if (code.includes("WELL") && !code.includes("BOREWELL")) {
                        errors[attr.socialAttributeId] = getErr("maxWell", "Number of wells cannot exceed 50.");
                    } else if (code.includes("LIFT")) {
                        errors[attr.socialAttributeId] = getErr("maxLift", "Number of lifts cannot exceed 100.");
                    } else if (code.includes("SOLAR")) {
                        errors[attr.socialAttributeId] = getErr("maxSolar", "Number of solar units cannot exceed 5000.");
                    } else if (code.includes("SWIMMING")) {
                        errors[attr.socialAttributeId] = getErr("maxSwimming", "Number of swimming pools cannot exceed 20.");
                    } else if (code.includes("TREE")) {
                        errors[attr.socialAttributeId] = getErr("maxTree", "Number of trees cannot exceed 100,000.");
                    } else if (code === "GREEN_PROPERTY_STAR" || code === "GREEN_PROPERTY_STAR_RATING" || code.includes("STAR_RATING") || code.includes("STAR_RAT")) {
                        errors[attr.socialAttributeId] = getErr("ratingRange", "Rating must be between 1 and 5.");
                    } else if (code === "WATER_CONN_YEAR") {
                        errors[attr.socialAttributeId] = getErr("yearRange", `Year must be between 1900 and ${max}.`, { max: max ?? new Date().getFullYear() });
                    } else {
                        errors[attr.socialAttributeId] = getErr("maxVal", `Value cannot exceed ${max.toLocaleString()}.`, { max: max.toLocaleString() });
                    }
                }
            }
        }

        if (attr.dataType === "DECIMAL" && attr.decimalValue !== null && attr.decimalValue !== undefined && String(attr.decimalValue) !== "") {
            const val = Number(attr.decimalValue);
            const code = attr.socialAttributeCode.toUpperCase();

            if (isNaN(val)) {
                errors[attr.socialAttributeId] = getErr("invalidDecimal", "Value must be a valid number.");
            } else if (val < 0) {
                errors[attr.socialAttributeId] = getErr("negativeNotAllowed", "Value cannot be negative.");
            } else if (attr.isRequiredWhenParentTrue && val <= 0) {
                errors[attr.socialAttributeId] = getErr("countMin", "Value must be greater than 0.");
            } else {
                const { min, max } = getMinMaxValues(code);
                if (val < min) {
                    errors[attr.socialAttributeId] = getErr("minVal", `Value cannot be less than ${min}.`, { min });
                } else if (max !== undefined && val > max) {
                    if (code === "ROAD_WIDTH") {
                        errors[attr.socialAttributeId] = getErr("maxRoad", "Road width cannot exceed 500.");
                    } else if (code.includes("CAPACITY")) {
                        errors[attr.socialAttributeId] = getErr("maxCapacity", "Capacity cannot exceed 100,000.");
                    } else {
                        errors[attr.socialAttributeId] = getErr("maxVal", `Value cannot exceed ${max.toLocaleString()}.`, { max: max.toLocaleString() });
                    }
                }
            }
        }

        if (attr.dataType === "TEXT" && attr.textValue !== null && attr.textValue !== undefined && String(attr.textValue) !== "") {
            const val = attr.textValue.trim();
            const code = attr.socialAttributeCode.toUpperCase();
            if (code.includes("WATER_CONN") || code.includes("STATUS")) {
                if (val.length < 3) {
                    errors[attr.socialAttributeId] = getErr("minWaterConnStatus", "Water Connection Status must be at least 3 characters long.");
                } else if (val.length > 30) {
                    errors[attr.socialAttributeId] = getErr("maxWaterConnStatus", "Water Connection Status cannot exceed 30 characters.");
                }
            } else {
                if (val.length < 2) {
                    errors[attr.socialAttributeId] = getErr("minTextLength", "Value must be at least 2 characters long.");
                } else if (val.length > 100) {
                    errors[attr.socialAttributeId] = getErr("maxTextLength", "Value cannot exceed 100 characters.");
                }
            }
        }
    });

    return errors;
}

/**
 * Determines min and max values dynamically based on attribute code.
 */
export function getMinMaxValues(socialAttributeCode: string) {
    const code = socialAttributeCode.toUpperCase();
    let min = 0;
    let max: number | undefined = undefined;

    if (code === "GREEN_PROPERTY_STAR" || code === "GREEN_PROPERTY_STAR_RATING" || code.includes("STAR_RATING") || code.includes("STAR_RAT")) {
        min = 1;
        max = 5;
    } else if (code.includes("BOREWELL") || (code.includes("WELL") && !code.includes("BOREWELL"))) {
        max = 50;
    } else if (code.includes("LIFT")) {
        max = 100;
    } else if (code.includes("SOLAR")) {
        max = 5000;
    } else if (code.includes("SWIMMING")) {
        max = 20;
    } else if (code.includes("TREE")) {
        max = 100000;
    } else if (code === "WATER_CONN_YEAR") {
        min = 1900;
        max = new Date().getFullYear();
    } else if (code === "ROAD_WIDTH") {
        max = 500;
    } else if (code.includes("CAPACITY")) {
        max = 100000;
    }

    return { min, max };
}

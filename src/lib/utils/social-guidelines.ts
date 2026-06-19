import { FlatSocialAttributeState, isAttributeEnabled } from "./social-details";
import { PropertySocialInfoItemDto } from "@/types/property-social-details.types";

export const getFieldGuideline = (
    code: string,
    dataType: string,
    t: {
        (key: string, values?: Record<string, string | number>): string;
        has?: (key: string) => boolean;
    }
): string | null => {
    const codeUpper = (code || "").toUpperCase();
    const dataTypeUpper = (dataType || "").toUpperCase();
    const currentYear = new Date().getFullYear();

    const safeT = (key: string, fallback: string, values?: Record<string, string | number>): string => {
        if (t && typeof t.has === "function" && t.has(key)) {
            return t(key, values);
        }
        let res = fallback;
        if (values) {
            Object.entries(values).forEach(([k, v]) => {
                res = res.replace(`{${k}}`, String(v));
            });
        }
        return res;
    };

    if (codeUpper === "WATER_CONN_YEAR") {
        return safeT("discount.socialGuidelines.waterConnYear", "Year must be between 1900 and {year}.", { year: currentYear });
    }
    if (codeUpper.includes("STAR_RATING") || codeUpper.includes("STAR_RAT") || codeUpper === "GREEN_PROPERTY_STAR") {
        return safeT("discount.socialGuidelines.starRating", "Rating must be between 1 and 5.");
    }
    if (codeUpper.includes("BOREWELL")) {
        return safeT("discount.socialGuidelines.borewellCount", "Count must be between 1 and 50.");
    }
    if (codeUpper.includes("WELL") && !codeUpper.includes("BOREWELL")) {
        return safeT("discount.socialGuidelines.wellCount", "Count must be between 1 and 50.");
    }
    if (codeUpper.includes("LIFT")) {
        return safeT("discount.socialGuidelines.liftCount", "Count must be between 1 and 100.");
    }
    if (codeUpper.includes("SWIMMING")) {
        return safeT("discount.socialGuidelines.swimmingCount", "Count must be between 1 and 20.");
    }
    if (codeUpper.includes("TREE")) {
        return safeT("discount.socialGuidelines.treeCount", "Count must be between 1 and 100,000.");
    }
    if (codeUpper.includes("ROAD_WIDTH")) {
        return safeT("discount.socialGuidelines.roadWidth", "Width must be between 0.01 and 500.");
    }
    if (codeUpper.includes("SOLAR")) {
        return dataTypeUpper === "DECIMAL"
            ? safeT("discount.socialGuidelines.solarCapacity", "Capacity must be between 0.01 and 100,000.")
            : safeT("discount.socialGuidelines.solarCount", "Count must be between 1 and 5,000.");
    }
    if (codeUpper.includes("CAPACITY")) {
        return safeT("discount.socialGuidelines.capacity", "Capacity must be between 0.01 and 100,000.");
    }

    // Generic types guidelines
    if (dataTypeUpper === "INT") {
        return safeT("discount.socialGuidelines.genericInt", "Value must be a valid positive whole number.");
    }
    if (dataTypeUpper === "DECIMAL") {
        return safeT("discount.socialGuidelines.genericDecimal", "Value must be a valid decimal number (max 2 decimal places).");
    }
    if (dataTypeUpper === "VARCHAR" || dataTypeUpper === "TEXT") {
        return safeT("discount.socialGuidelines.genericText", "Value must be between 2 and 100 characters.");
    }
    if (dataTypeUpper === "DATE") {
        return safeT("discount.socialGuidelines.genericDate", "Date must be a valid date (cannot be in the future).");
    }

    return null;
};

export const checkCompleteness = (
    item: FlatSocialAttributeState,
    socialData: Record<number, FlatSocialAttributeState>
): boolean => {
    const isEnabled = isAttributeEnabled(item, socialData);
    if (!isEnabled) return true;

    const dataTypeUpper = (item.dataType || "").toUpperCase();
    const isSpecialToggle = 
        item.socialAttributeCode.toUpperCase() === "ROAD_WIDTH" || 
        item.socialAttributeCode.toUpperCase().includes("WATER_CONN") || 
        item.socialAttributeCode.toUpperCase().includes("TREE");

    const isRequired = 
        (item.isRequiredWhenParentTrue && !(item.dataType === "BIT" && !item.parentAttributeId)) || 
        (isSpecialToggle && item.bitValue === true);

    if (isRequired) {
        if (dataTypeUpper === "INT" && (item.intValue === null || item.intValue === undefined || String(item.intValue).trim() === "")) {
            return false;
        }
        if (dataTypeUpper === "DECIMAL" && (item.decimalValue === null || item.decimalValue === undefined || String(item.decimalValue).trim() === "")) {
            return false;
        }
        if (dataTypeUpper === "VARCHAR" && (!item.textValue || item.textValue.trim() === "")) {
            return false;
        }
        if (dataTypeUpper === "DATE" && (!item.dateValue || item.dateValue.trim() === "")) {
            return false;
        }
    }

    if (item.isPhotoRequired) {
        const hasPhoto = (item.documentGuid && item.documentGuid.trim() !== "") || !!item.documentBindingId;
        if (!hasPhoto) return false;
    }

    const children = Object.values(socialData).filter(x => x.parentAttributeId === item.socialAttributeId);
    for (const child of children) {
        if (!checkCompleteness(child, socialData)) {
            return false;
        }
    }

    return true;
};

export const hasAnyError = (
    item: FlatSocialAttributeState,
    socialData: Record<number, FlatSocialAttributeState>,
    validationErrors?: Record<number, string>
): string | null => {
    if (validationErrors?.[item.socialAttributeId]) {
        return validationErrors[item.socialAttributeId];
    }
    const children = Object.values(socialData).filter(x => x.parentAttributeId === item.socialAttributeId);
    for (const child of children) {
        const childErr = hasAnyError(child, socialData, validationErrors);
        if (childErr) return childErr;
    }
    return null;
};

/**
 * Maps the flat state of social attributes back to the API request payload format.
 */
export function mapSocialStateToApi(
    socialData: Record<number, FlatSocialAttributeState>,
    initialFlatData: Record<number, FlatSocialAttributeState>
): {
    socialAttributes: PropertySocialInfoItemDto[];
    socialAttributeIdsToRemove: number[];
} {
    const socialAttributes: PropertySocialInfoItemDto[] = [];
    const socialAttributeIdsToRemove: number[] = [];

    Object.values(socialData).forEach((attr) => {
        const isBitType = attr.dataType.toUpperCase() === "BIT";
        const isEnabled = isAttributeEnabled(attr, socialData);

        const apiBitValue = isBitType ? (isEnabled ? (attr.bitValue ?? false) : false) : null;
        const apiIntValue = isEnabled && attr.intValue !== null && attr.intValue !== undefined && String(attr.intValue) !== "" ? Number(attr.intValue) : null;
        const apiDecimalValue = isEnabled && attr.decimalValue !== null && attr.decimalValue !== undefined && String(attr.decimalValue) !== "" ? Number(attr.decimalValue) : null;
        const apiTextValue = isEnabled ? attr.textValue : null;
        const apiDateValue = isEnabled ? attr.dateValue : null;
        const apiDocumentBindingId = isEnabled ? (attr.documentBindingId ?? null) : null;
        const apiRemark = isEnabled ? attr.remark : null;

        const init = initialFlatData[attr.socialAttributeId];
        const isDirty = !init ||
            apiBitValue !== init.bitValue ||
            apiIntValue !== init.intValue ||
            apiDecimalValue !== init.decimalValue ||
            apiTextValue !== init.textValue ||
            apiDateValue !== init.dateValue ||
            apiDocumentBindingId !== init.documentBindingId ||
            apiRemark !== init.remark;

        if (isDirty) {
            socialAttributes.push({
                id: attr.id,
                socialAttributeId: attr.socialAttributeId,
                bitValue: apiBitValue,
                intValue: apiIntValue,
                decimalValue: apiDecimalValue,
                textValue: apiTextValue,
                dateValue: apiDateValue,
                documentBindingId: apiDocumentBindingId,
                remark: apiRemark,
                isActive: true
            });
        }
    });

    return { socialAttributes, socialAttributeIdsToRemove };
}

import { DiscountState, DiscountAttributeState } from "@/types/discount.types";

interface IncompleteDiscount {
    id: number;
    name: string;
    code: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: Record<number, string>;
    incompleteDiscounts: IncompleteDiscount[];
}

const TEXT_PATTERN = /^[a-zA-Z0-9\s\-()&'\./,]*$/;

/**
 * Validates the discount form state.
 * For every enabled discount attribute:
 * - Checks for document attachment (documentGuid or documentBindingId).
 * - Checks for required values depending on its dataType (INT, DECIMAL, VARCHAR, DATE).
 * - Implements basic length, whitespace, and special character checks.
 */
export const validateDiscountForm = (
    state: DiscountState,
    t: (key: string, params?: Record<string, string | number>) => string
): ValidationResult => {
    const errors: Record<number, string> = {};
    const incompleteDiscounts: IncompleteDiscount[] = [];
    let isValid = true;

    Object.values(state).forEach((item: DiscountAttributeState) => {
        if (!item.enabled) return;

        const missingFields: string[] = [];
        const displayName = item.socialAttributeName || `Discount #${item.id}`;

        // 1. Validate based on data type
        const dataTypeUpper = (item.dataType || "").toUpperCase();

        if (dataTypeUpper === "INT") {
            const strVal = item.intValue !== null && item.intValue !== undefined ? String(item.intValue).trim() : "";
            if (strVal === "") {
                missingFields.push(t("discount.socialValidation.required", { fieldName: displayName }) || `${displayName} is required.`);
            } else {
                if (/\s/.test(strVal)) {
                    missingFields.push(t("common.validation.numberNoSpaces") || "Spaces are not allowed in numbers.");
                } else if (!/^\d+$/.test(strVal)) {
                    missingFields.push(t("discount.socialValidation.invalidInteger") || "Value must be a valid integer.");
                } else {
                    const val = Number(strVal);
                    const code = (item.socialAttributeCode || "").toUpperCase();
                    const isYear = code === "WATER_CONN_YEAR";
                    const isTree = code.includes("TREE") || code === "TREE_COUNT";
                    const isSolar = code.includes("SOLAR");
                    const digitsLimit = isYear ? 4 : isTree ? 6 : isSolar ? 4 : 3;

                    if (strVal.length > digitsLimit) {
                        missingFields.push(
                            code === "WATER_CONN_YEAR"
                                ? (t("discount.socialValidation.yearMaxDigits") || "Year cannot exceed 4 digits.")
                                : (t("discount.socialValidation.maxDigits", { digits: digitsLimit }) || `Value cannot exceed ${digitsLimit} digits.`)
                        );
                    } else if (val <= 0) {
                        missingFields.push(t("discount.socialValidation.countMin") || "Value must be at least 1.");
                    } else if (val > 2147483647) {
                        missingFields.push(t("discount.socialValidation.maxVal", { max: 2147483647 }) || "Value cannot exceed 2147483647.");
                    }

                    // Attribute-specific rules
                    if (item.socialAttributeCode === "GREEN_PROPERTY_STAR" && (val < 1 || val > 5)) {
                        missingFields.push(t("discount.socialValidation.ratingRange") || "Rating must be between 1 and 5.");
                    }
                    if (item.socialAttributeCode === "TREE_COUNT" && val > 100000) {
                        missingFields.push(t("discount.socialValidation.maxTree") || "Number of trees cannot exceed 100,000.");
                    }
                    if (item.socialAttributeCode === "BOREWELL_COUNT" && val > 50) {
                        missingFields.push(t("discount.socialValidation.maxBorewell") || "Number of borewells cannot exceed 50.");
                    }
                }
            }
        } else if (dataTypeUpper === "DECIMAL") {
            const strVal = item.decimalValue !== null && item.decimalValue !== undefined ? String(item.decimalValue).trim() : "";
            if (strVal === "") {
                missingFields.push(t("discount.socialValidation.required", { fieldName: displayName }) || `${displayName} is required.`);
            } else {
                const parts = strVal.split(".");
                const hasMoreThanTwoDecimals = parts[1] && parts[1].length > 2;

                if (/\s/.test(strVal)) {
                    missingFields.push(t("common.validation.numberNoSpaces") || "Spaces are not allowed in numbers.");
                } else if (!/^\d+(\.\d+)?$/.test(strVal)) {
                    missingFields.push(t("discount.socialValidation.invalidDecimal") || "Value must be a valid decimal number.");
                } else if (hasMoreThanTwoDecimals) {
                    missingFields.push(t("discount.socialValidation.maxTwoDecimals") || "Maximum 2 decimal places allowed.");
                } else {
                    const val = Number(strVal);
                    if (val <= 0) {
                        missingFields.push(t("discount.socialValidation.minVal", { min: 0.01 }) || "Value must be greater than zero.");
                    }

                    // Attribute-specific rules
                    if (item.socialAttributeCode === "GREEN_PROPERTY_STAR" && (val < 1 || val > 5)) {
                        missingFields.push(t("discount.socialValidation.ratingRange") || "Rating must be between 1 and 5.");
                    }
                    if (item.socialAttributeCode === "SOLAR_ELECTRIC_CAPACITY" && val > 100000) {
                        missingFields.push(t("discount.socialValidation.maxCapacity") || "Capacity cannot exceed 100,000.");
                    }
                }
            }
        } else if (dataTypeUpper === "VARCHAR") {
            const trimmedText = (item.textValue || "").trim();
            if (trimmedText === "") {
                missingFields.push(t("discount.socialValidation.required", { fieldName: displayName }) || `${displayName} is required.`);
            } else {
                if (trimmedText.length < 2) {
                    missingFields.push(t("discount.socialValidation.minTextLength") || "Value must be at least 2 characters long.");
                } else if (trimmedText.length > 100) {
                    missingFields.push(t("discount.socialValidation.maxTextLength") || "Value cannot exceed 100 characters.");
                }

                if (!TEXT_PATTERN.test(item.textValue || "")) {
                    missingFields.push(t("property.validation.invalidCharacters") || "Contains invalid characters.");
                }
            }
        } else if (dataTypeUpper === "DATE") {
            const strVal = (item.dateValue || "").trim();
            if (strVal === "") {
                missingFields.push(t("common.validation.dateRequired") || "Date is required.");
            } else {
                const dateVal = new Date(strVal);
                if (isNaN(dateVal.getTime())) {
                    missingFields.push(t("common.validation.invalidDate") || "Please enter a valid date.");
                } else {
                    const now = new Date();
                    now.setHours(23, 59, 59, 999);
                    if (dateVal > now) {
                        missingFields.push(t("building.errors.futureDate") || "Date cannot be in the future.");
                    }
                }
            }
        }

        // 2. Validate document attachment (accept documentGuid OR documentBindingId as proof)
        const isDocReq = item.isDocumentRequired === true;
        const hasDocument = (item.documentGuid && item.documentGuid.trim() !== "") || !!item.documentBindingId;
        if (isDocReq && !hasDocument) {
            missingFields.push(t("common.validation.documentRequired") || "Document is required.");
        }

        // 3. Validate optional remark field
        if (item.remark && item.remark.trim() !== "") {
            if (item.remark.length > 500) {
                missingFields.push(t("discount.socialValidation.maxVal", { max: 500 }) || "Remark cannot exceed 500 characters.");
            }
            if (!TEXT_PATTERN.test(item.remark)) {
                missingFields.push(t("property.validation.invalidCharacters") || "Remark contains invalid characters.");
            }
        }

        if (missingFields.length > 0) {
            errors[item.id] = missingFields[0];
            incompleteDiscounts.push({
                id: item.id,
                name: displayName,
                code: item.socialAttributeCode || "",
            });
            isValid = false;
        }
    });

    return { isValid, errors, incompleteDiscounts };
};


import { describe, it, expect } from "vitest";
import { validateDiscountForm } from "@/lib/utils/validateDiscountForm";
import { DiscountAttributeState } from "@/types/discount.types";

describe("validateDiscountForm", () => {
    const tMock = (key: string, params?: Record<string, string | number>) => {
        if (key === "discount.socialValidation.required") {
            return `${params?.fieldName || "Field"} is required.`;
        }
        if (key === "common.validation.numberNoSpaces") {
            return "Spaces are not allowed in numbers.";
        }
        if (key === "discount.socialValidation.invalidInteger") {
            return "Value must be a valid integer.";
        }
        if (key === "discount.socialValidation.countMin") {
            return "Value must be at least 1.";
        }
        if (key === "discount.socialValidation.maxVal") {
            return `Value cannot exceed ${params?.max || ""}.`;
        }
        if (key === "discount.socialValidation.ratingRange") {
            return "Rating must be between 1 and 5.";
        }
        if (key === "discount.socialValidation.maxTree") {
            return "Number of trees cannot exceed 100,000.";
        }
        if (key === "discount.socialValidation.maxBorewell") {
            return "Number of borewells cannot exceed 50.";
        }
        if (key === "discount.socialValidation.invalidDecimal") {
            return "Value must be a valid decimal number.";
        }
        if (key === "discount.socialValidation.maxTwoDecimals") {
            return "Maximum 2 decimal places allowed.";
        }
        if (key === "discount.socialValidation.minVal") {
            return "Value must be greater than zero.";
        }
        if (key === "discount.socialValidation.maxCapacity") {
            return "Capacity cannot exceed 100,000.";
        }
        if (key === "discount.socialValidation.minTextLength") {
            return "Value must be at least 2 characters long.";
        }
        if (key === "discount.socialValidation.maxTextLength") {
            return "Value cannot exceed 100 characters.";
        }
        if (key === "property.validation.invalidCharacters") {
            return "Contains invalid characters.";
        }
        if (key === "common.validation.dateRequired") {
            return "Date is required.";
        }
        if (key === "building.errors.futureDate") {
            return "Date cannot be in the future.";
        }
        if (key === "common.validation.documentRequired") {
            return "Document is required.";
        }
        if (key === "discount.socialValidation.maxDigits") {
            return `Value cannot exceed ${params?.digits || ""} digits.`;
        }
        if (key === "discount.socialValidation.yearMaxDigits") {
            return "Year cannot exceed 4 digits.";
        }
        return key;
    };

    const createBaseAttr = (overrides: Partial<DiscountAttributeState> = {}): DiscountAttributeState => ({
        id: 1,
        socialAttributeCode: "ATTR_CODE",
        socialAttributeName: "Test Attribute",
        dataType: "BIT",
        unit: null,
        displayOrder: 1,
        isDiscountApplicable: true,
        propertySocialDetailId: null,
        bitValue: null,
        intValue: null,
        decimalValue: null,
        textValue: null,
        dateValue: null,
        documentBindingId: null,
        remark: null,
        enabled: true,
        ...overrides
    });

    it("should skip validation if the attribute is disabled", () => {
        const item = createBaseAttr({ enabled: false });
        const result = validateDiscountForm({ 1: item }, tMock);
        expect(result.isValid).toBe(true);
        expect(Object.keys(result.errors).length).toBe(0);
    });

    describe("DataType: INT validation", () => {
        it("should fail if value is empty", () => {
            const item = createBaseAttr({ dataType: "INT", intValue: "", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Test Attribute is required.");
        });

        it("should fail if value contains spaces", () => {
            const item = createBaseAttr({ dataType: "INT", intValue: "1 2", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Spaces are not allowed in numbers.");
        });

        it("should fail if value is not an integer", () => {
            const item = createBaseAttr({ dataType: "INT", intValue: "12.3", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value must be a valid integer.");
        });

        it("should fail if value is less than or equal to 0", () => {
            const item = createBaseAttr({ dataType: "INT", intValue: "0", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value must be at least 1.");
        });

        it("should fail if value exceeds max digits limit (large value)", () => {
            const item = createBaseAttr({ dataType: "INT", intValue: "3000000000", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value cannot exceed 3 digits.");
        });

        it("should fail if value exceeds dynamic digits limit", () => {
            const item = createBaseAttr({ dataType: "INT", intValue: "1234", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value cannot exceed 3 digits.");
        });

        it("should validate rating range (1-5) for GREEN_PROPERTY_STAR", () => {
            const item = createBaseAttr({
                socialAttributeCode: "GREEN_PROPERTY_STAR",
                dataType: "INT",
                intValue: "6",
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Rating must be between 1 and 5.");
        });

        it("should validate max tree count (100,000) for TREE_COUNT", () => {
            const item = createBaseAttr({
                socialAttributeCode: "TREE_COUNT",
                dataType: "INT",
                intValue: "100001",
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Number of trees cannot exceed 100,000.");
        });

        it("should validate max borewell count (50) for BOREWELL_COUNT", () => {
            const item = createBaseAttr({
                socialAttributeCode: "BOREWELL_COUNT",
                dataType: "INT",
                intValue: "51",
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Number of borewells cannot exceed 50.");
        });
    });

    describe("DataType: DECIMAL validation", () => {
        it("should fail if value is empty", () => {
            const item = createBaseAttr({ dataType: "DECIMAL", decimalValue: "", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Test Attribute is required.");
        });

        it("should fail if value contains spaces", () => {
            const item = createBaseAttr({ dataType: "DECIMAL", decimalValue: "12 .3", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Spaces are not allowed in numbers.");
        });

        it("should fail if value is not a valid decimal", () => {
            const item = createBaseAttr({ dataType: "DECIMAL", decimalValue: "abc", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value must be a valid decimal number.");
        });

        it("should fail if value is less than or equal to 0", () => {
            const item = createBaseAttr({ dataType: "DECIMAL", decimalValue: "-0.5", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value must be a valid decimal number."); // regex check fails first for minus
        });

        it("should fail if value is exactly 0", () => {
            const item = createBaseAttr({ dataType: "DECIMAL", decimalValue: "0.0", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value must be greater than zero.");
        });

        it("should validate max capacity (100,000) for SOLAR_ELECTRIC_CAPACITY", () => {
            const item = createBaseAttr({
                socialAttributeCode: "SOLAR_ELECTRIC_CAPACITY",
                dataType: "DECIMAL",
                decimalValue: "100000.5",
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Capacity cannot exceed 100,000.");
        });

        it("should reject decimal value for GREEN_PROPERTY_STAR as it must be an integer", () => {
            const item = createBaseAttr({
                socialAttributeCode: "GREEN_PROPERTY_STAR",
                dataType: "INT",
                intValue: "4.2",
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value must be a valid integer.");
        });

        it("should fail if decimal value has more than 2 decimal places", () => {
            const item = createBaseAttr({
                dataType: "DECIMAL",
                decimalValue: "12.345",
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Maximum 2 decimal places allowed.");
        });
    });

    describe("DataType: VARCHAR validation", () => {
        it("should fail if value is empty", () => {
            const item = createBaseAttr({ dataType: "VARCHAR", textValue: "", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Test Attribute is required.");
        });

        it("should fail if value is too short (< 2 characters)", () => {
            const item = createBaseAttr({ dataType: "VARCHAR", textValue: "a", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value must be at least 2 characters long.");
        });

        it("should fail if value is too long (> 100 characters)", () => {
            const item = createBaseAttr({ dataType: "VARCHAR", textValue: "a".repeat(101), documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value cannot exceed 100 characters.");
        });

        it("should fail if value contains invalid characters", () => {
            const item = createBaseAttr({ dataType: "VARCHAR", textValue: "invalid@char", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Contains invalid characters.");
        });
    });

    describe("DataType: DATE validation", () => {
        it("should fail if date is empty", () => {
            const item = createBaseAttr({ dataType: "DATE", dateValue: "", documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Date is required.");
        });

        it("should fail if date is in the future", () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const item = createBaseAttr({
                dataType: "DATE",
                dateValue: tomorrow.toISOString().split("T")[0],
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Date cannot be in the future.");
        });
    });

    describe("Document Attachment", () => {
        it("should pass if documentGuid is present", () => {
            const item = createBaseAttr({ documentGuid: "some-guid" });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(true);
        });

        it("should pass if documentBindingId is present", () => {
            const item = createBaseAttr({ documentBindingId: 123 });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(true);
        });

        it("should fail if neither documentGuid nor documentBindingId is present", () => {
            const item = createBaseAttr({ documentGuid: "", documentBindingId: null });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Document is required.");
        });
    });

    describe("Remark validation", () => {
        it("should fail if remark is too long (> 500 characters)", () => {
            const item = createBaseAttr({
                remark: "a".repeat(501),
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Value cannot exceed 500.");
        });

        it("should fail if remark contains invalid characters", () => {
            const item = createBaseAttr({
                remark: "invalid@remark!",
                documentGuid: "some-guid"
            });
            const result = validateDiscountForm({ 1: item }, tMock);
            expect(result.isValid).toBe(false);
            expect(result.errors[1]).toBe("Contains invalid characters.");
        });
    });
});

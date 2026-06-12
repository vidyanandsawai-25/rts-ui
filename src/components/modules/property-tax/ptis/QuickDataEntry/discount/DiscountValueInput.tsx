"use client";

import React from "react";
import { Input, ValidationMessage, Label } from "@/components/common";
import { DiscountAttributeState } from "@/types/discount.types";

interface DiscountValueInputProps {
    data: DiscountAttributeState;
    isDisabled: boolean;
    inputClassName: string;
    onInputChange: (field: "intValue" | "decimalValue" | "textValue" | "dateValue" | "remark", value: string) => void;
    isValueInvalid: boolean;
    validationError?: string;
    t: (key: string, values?: Record<string, string | number>) => string;
}

export const DiscountValueInput: React.FC<DiscountValueInputProps> = ({
    data,
    isDisabled,
    inputClassName,
    onInputChange,
    isValueInvalid,
    validationError,
    t,
}) => {
    const dataTypeUpper = (data.dataType || "").toUpperCase();

    return (
        <div className="space-y-1.5 w-full">
            <Label className="text-sm font-bold text-blue-800">
                {t("discount.amount") || "Value"}
                {data.unit ? ` (${t("discount.unitLabel", { unit: data.unit }) || `Unit: ${data.unit}`})` : ""}
                <span className="text-red-500 ml-0.5">*</span>
            </Label>
            
            {dataTypeUpper === "INT" && (
                <Input
                    type="number"
                    step="1"
                    value={data.intValue !== null && data.intValue !== undefined ? String(data.intValue) : ""}
                    onChange={(e) => onInputChange("intValue", e.target.value)}
                    placeholder={t("discount.amountPlaceholder") || "Enter value"}
                    disabled={isDisabled}
                    className={inputClassName}
                />
            )}

            {dataTypeUpper === "DECIMAL" && (
                <Input
                    type="number"
                    step="any"
                    value={data.decimalValue !== null && data.decimalValue !== undefined ? String(data.decimalValue) : ""}
                    onChange={(e) => onInputChange("decimalValue", e.target.value)}
                    placeholder={t("discount.amountPlaceholder") || "Enter value"}
                    disabled={isDisabled}
                    className={inputClassName}
                />
            )}

            {dataTypeUpper === "VARCHAR" && (
                <Input
                    value={data.textValue || ""}
                    onChange={(e) => onInputChange("textValue", e.target.value)}
                    placeholder={t("discount.amountPlaceholder") || "Enter text"}
                    disabled={isDisabled}
                    className={inputClassName}
                />
            )}

            {dataTypeUpper === "DATE" && (
                <Input
                    type="date"
                    value={data.dateValue || ""}
                    onChange={(e) => onInputChange("dateValue", e.target.value)}
                    disabled={isDisabled}
                    className={inputClassName}
                />
            )}

            {isValueInvalid && <ValidationMessage message={validationError} />}
        </div>
    );
};

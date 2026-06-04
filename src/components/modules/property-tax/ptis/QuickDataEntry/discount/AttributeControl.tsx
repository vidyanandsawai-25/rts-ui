"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Input, ToggleSwitch } from "@/components/common";
import { FlatSocialAttributeState } from "@/lib/utils/social-details";
import { getMinMaxValues } from "@/lib/validations/social-details.validation";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";

interface AttributeControlProps {
    attr: SocialAttributeHierarchyDto;
    state: FlatSocialAttributeState;
    isEnabled: boolean;
    hasError: boolean;
    handleValueChange: (
        attributeId: number,
        field: keyof FlatSocialAttributeState,
        value: string | number | boolean | null
    ) => void;
}

export const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "-" || e.key === "e" || e.key === "E") e.preventDefault();
};

export const AttributeControl: React.FC<AttributeControlProps> = ({
    attr,
    state,
    isEnabled,
    hasError,
    handleValueChange
}) => {
    const t = useTranslations("quickDataEntry");
    const disabled = !isEnabled;

    switch (attr.dataType.toUpperCase()) {
        case "BIT":
            return (
                <div className="cursor-pointer [&_button]:cursor-pointer [&_span]:cursor-pointer flex items-center">
                    <ToggleSwitch
                        checked={!!state.bitValue}
                        onChange={(checked) => handleValueChange(attr.id, "bitValue", checked)}
                        disabled={disabled}
                        showPopup={false}
                    />
                </div>
            );
        case "INT": {
            const { min, max } = getMinMaxValues(attr.socialAttributeCode);
            return (
                <Input
                    type="number"
                    step="1"
                    min={min}
                    max={max}
                    onKeyDown={preventNegativeInput}
                    placeholder={t("discount.socialPlaceholders.enterValue") || "Enter value"}
                    value={state.intValue ?? ""}
                    disabled={disabled}
                    error={hasError ? " " : undefined}
                    onChange={(e) => {
                        const raw = e.target.value;
                        handleValueChange(attr.id, "intValue", raw === "" ? null : Number(raw));
                    }}
                    className="h-8 w-full font-semibold"
                />
            );
        }
        case "DECIMAL": {
            const { min, max } = getMinMaxValues(attr.socialAttributeCode);
            return (
                <Input
                    type="number"
                    step="any"
                    min={min}
                    max={max}
                    onKeyDown={preventNegativeInput}
                    placeholder={t("discount.socialPlaceholders.enterDecimal") || "Enter decimal"}
                    value={state.decimalValue ?? ""}
                    disabled={disabled}
                    error={hasError ? " " : undefined}
                    onChange={(e) =>
                        handleValueChange(
                            attr.id,
                            "decimalValue",
                            e.target.value ? parseFloat(e.target.value) : null
                        )
                    }
                    className="h-8 w-full font-semibold"
                />
            );
        }
        case "DATE":
            return (
                <Input
                    type="date"
                    value={state.dateValue ? state.dateValue.split("T")[0] : ""}
                    disabled={disabled}
                    error={hasError ? " " : undefined}
                    onChange={(e) => handleValueChange(attr.id, "dateValue", e.target.value || null)}
                    className="h-8 w-full font-semibold"
                />
            );
        default: {
            const code = attr.socialAttributeCode.toUpperCase();
            const isStatus = code.includes("WATER_CONN") || code.includes("STATUS");
            return (
                <Input
                    type="text"
                    placeholder={t("discount.socialPlaceholders.enterText") || "Enter text"}
                    value={state.textValue ?? ""}
                    disabled={disabled}
                    error={hasError ? " " : undefined}
                    onChange={(e) => handleValueChange(attr.id, "textValue", e.target.value || null)}
                    className="h-8 w-full font-semibold"
                    minLength={isStatus ? 3 : 2}
                    maxLength={isStatus ? 30 : 100}
                />
            );
        }
    }
};

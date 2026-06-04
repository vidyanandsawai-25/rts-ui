"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
import { FlatSocialAttributeState } from "@/lib/utils/social-details";
import { AttributeControl } from "./AttributeControl";
import { ToggleSwitch } from "@/components/common";

interface SpecialToggleCardProps {
    attr: SocialAttributeHierarchyDto;
    state: FlatSocialAttributeState;
    errors: Record<number, string>;
    isEnabled: boolean;
    handleValueChange: (
        attributeId: number,
        field: keyof FlatSocialAttributeState,
        value: string | number | boolean | null
    ) => void;
    displayName: string;
    cardBorderClass: string;
}

export const SpecialToggleCard: React.FC<SpecialToggleCardProps> = ({
    attr,
    state,
    errors,
    isEnabled,
    handleValueChange,
    displayName,
    cardBorderClass
}) => {
    const t = useTranslations("quickDataEntry");

    return (
        <div className={`flex flex-col gap-2 p-3 border rounded-lg transition-all duration-[250ms] justify-between min-h-[92px] ${cardBorderClass}`}>
            <div 
                className="flex items-center justify-between w-full cursor-pointer"
                role="button"
                aria-pressed={!!state.bitValue}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleValueChange(attr.id, "bitValue", !state.bitValue);
                    }
                }}
                onClick={() => {
                    handleValueChange(attr.id, "bitValue", !state.bitValue);
                }}
            >
                <span className="text-xs font-semibold select-none text-slate-800">
                    {displayName}
                </span>
                <div onClick={(e) => e.stopPropagation()} className="[&_button:not(:disabled)]:cursor-pointer">
                    <ToggleSwitch
                        checked={!!state.bitValue}
                        onChange={(checked) => {
                            handleValueChange(attr.id, "bitValue", checked);
                        }}
                        showPopup={false}
                    />
                </div>
            </div>
            
            <div className="flex flex-col gap-1 w-full">
                <span className={`text-[10px] font-semibold ${isEnabled ? "text-slate-600" : "text-slate-400"}`}>
                    {displayName}
                    {isEnabled && <span className="text-red-500 ml-0.5">*</span>}
                </span>
                {attr.unit && !displayName.toLowerCase().includes(attr.unit.toLowerCase()) && !attr.socialAttributeName.toLowerCase().includes(attr.unit.toLowerCase()) && (
                    <span className="text-[10px] text-slate-400">
                        {t("discount.unitLabel", { unit: attr.unit })}
                    </span>
                )}
                <AttributeControl
                    attr={attr}
                    state={state}
                    isEnabled={isEnabled}
                    hasError={!!errors[attr.id]}
                    handleValueChange={handleValueChange}
                />
                <div className="min-h-[16px] mt-0.5">
                    {errors[attr.id] ? (
                        <span className="text-red-500 text-[10px] block leading-none font-semibold">
                            {errors[attr.id]}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

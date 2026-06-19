"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
import { FlatSocialAttributeState, isCardInvalid, getLocalizedName } from "@/lib/utils/social-details";
import { AttributeControl } from "./AttributeControl";
import { NestedAttributes } from "./NestedAttributes";
import { SpecialToggleCard } from "./SpecialToggleCard";

interface AttributeCardProps {
    attr: SocialAttributeHierarchyDto;
    state: FlatSocialAttributeState;
    socialData: Record<number, FlatSocialAttributeState>;
    errors: Record<number, string>;
    isEnabled: boolean;
    isAttributeEnabled: (attr: FlatSocialAttributeState) => boolean;
    handleValueChange: (
        attributeId: number,
        field: keyof FlatSocialAttributeState,
        value: string | number | boolean | null
    ) => void;
}

export const AttributeCard: React.FC<AttributeCardProps> = ({
    attr,
    state,
    socialData,
    errors,
    isEnabled,
    isAttributeEnabled,
    handleValueChange,
}) => {
    const t = useTranslations("quickDataEntry");
    const isInvalid = isCardInvalid(attr, errors);

    const cardBorderClass = isInvalid
        ? "border-red-300 bg-red-50/5 hover:border-red-400"
        : isEnabled
            ? "border-blue-200/80 bg-white hover:border-blue-300 hover:shadow-xs"
            : "border-slate-100 bg-slate-50/40 opacity-65";

    const displayName = getLocalizedName(attr.socialAttributeCode, attr.socialAttributeName, t);

    const isSpecialToggle = 
        attr.socialAttributeCode.toUpperCase() === "ROAD_WIDTH" || 
        attr.socialAttributeCode.toUpperCase().includes("WATER_CONN") || 
        attr.socialAttributeCode.toUpperCase().includes("TREE");

    if (attr.dataType.toUpperCase() === "BIT") {
        return (
            <div className={`flex flex-col gap-2 p-3 border rounded-lg transition-all duration-[250ms] justify-between min-h-[92px] ${cardBorderClass}`}>
                <div 
                    className="flex items-center justify-between w-full cursor-pointer"
                    role="button"
                    aria-pressed={!!state.bitValue}
                    tabIndex={isEnabled ? 0 : -1}
                    aria-disabled={!isEnabled}
                    onKeyDown={(e) => {
                        if (!isEnabled) return;
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleValueChange(attr.id, "bitValue", !state.bitValue);
                        }
                    }}
                    onClick={() => {
                        if (isEnabled) {
                            handleValueChange(attr.id, "bitValue", !state.bitValue);
                        }
                    }}
                >
                    <span className={`text-xs font-semibold select-none ${isEnabled ? "text-slate-800" : "text-slate-400"}`}>
                        {displayName}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                        <AttributeControl
                            attr={attr}
                            state={state}
                            isEnabled={isEnabled}
                            hasError={!!errors[attr.id]}
                            handleValueChange={handleValueChange}
                        />
                    </div>
                </div>
                {attr.children && attr.children.length > 0 && (
                    <NestedAttributes
                        attrs={attr.children}
                        socialData={socialData}
                        errors={errors}
                        isAttributeEnabled={isAttributeEnabled}
                        handleValueChange={handleValueChange}
                    />
                )}
            </div>
        );
    }

    if (isSpecialToggle) {
        const specialBorderClass = isInvalid
            ? "border-red-300 bg-red-50/5 hover:border-red-400"
            : "border-blue-200/80 bg-white hover:border-blue-300 hover:shadow-xs";

        return (
            <SpecialToggleCard
                attr={attr}
                state={state}
                errors={errors}
                isEnabled={state.bitValue === true}
                handleValueChange={handleValueChange}
                displayName={displayName}
                cardBorderClass={specialBorderClass}
            />
        );
    }

    return (
        <div className={`flex flex-col gap-1.5 p-3 border rounded-lg transition-all duration-[250ms] min-h-[92px] justify-between ${cardBorderClass}`}>
            <div className="flex flex-col w-full">
                <span className="text-xs font-semibold text-slate-800">
                    {displayName}
                    {attr.isRequiredWhenParentTrue && <span className="text-red-500 ml-0.5">*</span>}
                </span>
                {attr.unit && !displayName.toLowerCase().includes(attr.unit.toLowerCase()) && !attr.socialAttributeName.toLowerCase().includes(attr.unit.toLowerCase()) && (
                    <span className="text-[10px] text-slate-400">
                        {t("discount.unitLabel", { unit: attr.unit })}
                    </span>
                )}
            </div>
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
    );
};

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FlatSocialAttributeState, isCardInvalid, getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
import { AttributeControl } from "./AttributeControl";

interface ComplexNumericSectionProps {
    fields: SocialAttributeHierarchyDto[];
    socialData: Record<number, FlatSocialAttributeState>;
    errors: Record<number, string>;
    isAttributeEnabled: (attr: FlatSocialAttributeState) => boolean;
    handleValueChange: (
        attributeId: number,
        field: keyof FlatSocialAttributeState,
        value: string | number | boolean | null
    ) => void;
    title: string;
}

export const ComplexNumericSection: React.FC<ComplexNumericSectionProps> = ({
    fields,
    socialData,
    errors,
    isAttributeEnabled,
    handleValueChange,
    title
}) => {
    const t = useTranslations("quickDataEntry");

    const renderNestedAttributes = (attrs: SocialAttributeHierarchyDto[], depth: number = 1): React.ReactNode => {
        return (
            <div className={depth === 1 
                ? "space-y-2 mt-1 border-t border-slate-100/70 pt-2 transition-all duration-300 ease-in-out" 
                : "space-y-2 pl-3 border-l border-slate-100/70 mt-2 ml-1"
            }>
                {attrs.map((child) => {
                    const childState = socialData[child.id];
                    if (!childState) return null;
                    const isChildEnabled = isAttributeEnabled(childState);
                    const childDisplayName = getLocalizedName(child.socialAttributeCode, child.socialAttributeName, t);

                    return (
                        <div key={child.id} className="flex flex-col gap-1">
                            <span className={`text-[10px] font-semibold ${isChildEnabled ? "text-slate-600" : "text-slate-400"}`}>
                                {childDisplayName}
                                {child.isRequiredWhenParentTrue && <span className="text-red-500 ml-0.5">*</span>}
                                {child.unit && !childDisplayName.toLowerCase().includes(child.unit.toLowerCase()) && !child.socialAttributeName.toLowerCase().includes(child.unit.toLowerCase()) && (
                                    <span className="text-slate-400 font-normal ml-1">({child.unit})</span>
                                )}
                            </span>
                            <AttributeControl
                                attr={child}
                                state={childState}
                                isEnabled={isChildEnabled}
                                hasError={!!errors[child.id]}
                                handleValueChange={handleValueChange}
                            />
                            <div className="min-h-[16px] mt-0.5">
                                {errors[child.id] ? (
                                    <span className="text-red-500 text-[10px] block leading-none font-semibold">
                                        {errors[child.id]}
                                    </span>
                                ) : null}
                            </div>
                            {child.children && child.children.length > 0 && (
                                renderNestedAttributes(child.children, depth + 1)
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderAttributeCard = (attr: SocialAttributeHierarchyDto) => {
        const state = socialData[attr.id];
        if (!state) return null;
        const isEnabled = isAttributeEnabled(state);
        const isInvalid = isCardInvalid(attr, errors);

        const cardBorderClass = isInvalid
            ? "border-red-300 bg-red-50/5 hover:border-red-400"
            : isEnabled
                ? "border-blue-200/80 bg-white hover:border-blue-300 hover:shadow-xs"
                : "border-slate-100 bg-slate-50/40 opacity-65";

        const displayName = getLocalizedName(attr.socialAttributeCode, attr.socialAttributeName, t);

        if (attr.dataType.toUpperCase() === "BIT") {
            return (
                <div
                    key={attr.id}
                    className={`flex flex-col gap-2 p-3 border rounded-lg transition-all duration-[250ms] justify-between min-h-[92px] ${cardBorderClass}`}
                >
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
                        renderNestedAttributes(attr.children, 1)
                    )}
                </div>
            );
        }

        return (
            <div
                key={attr.id}
                className={`flex flex-col gap-1.5 p-3 border rounded-lg transition-all duration-[250ms] min-h-[92px] justify-between ${cardBorderClass}`}
            >
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

    return (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {fields.map((attr) => renderAttributeCard(attr))}
            </div>
        </div>
    );
};

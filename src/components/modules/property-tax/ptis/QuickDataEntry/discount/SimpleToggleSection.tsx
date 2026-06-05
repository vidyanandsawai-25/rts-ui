"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ToggleSwitch } from "@/components/common";
import { FlatSocialAttributeState, isCardInvalid, getLocalizedName } from "@/lib/utils/social-details";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";

interface SimpleToggleSectionProps {
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

export const SimpleToggleSection: React.FC<SimpleToggleSectionProps> = ({
    fields,
    socialData,
    errors,
    isAttributeEnabled,
    handleValueChange,
    title
}) => {
    const t = useTranslations("quickDataEntry");

    return (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {fields.map((attr) => {
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

                    return (
                        <div
                            key={attr.id}
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
                            className={`flex items-center justify-between py-3.5 px-4 border rounded-xl transition-all duration-200 cursor-pointer ${cardBorderClass}`}
                        >
                            <span className={`text-xs font-semibold select-none pr-2 ${isEnabled ? "text-slate-800" : "text-slate-400"}`}>
                                {displayName}
                            </span>
                            <div 
                                className="flex-shrink-0 cursor-pointer [&_button:not(:disabled)]:cursor-pointer [&_span]:cursor-pointer flex items-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ToggleSwitch
                                    checked={!!state.bitValue}
                                    onChange={(checked) => handleValueChange(attr.id, "bitValue", checked)}
                                    disabled={!isEnabled}
                                    showPopup={false}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

"use client";

import React from "react";
import { FlatSocialAttributeState } from "@/lib/utils/social-details";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";
import { AttributeCard } from "./AttributeCard";

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
    return (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {fields.map((attr) => {
                    const state = socialData[attr.id];
                    if (!state) return null;
                    const isEnabled = isAttributeEnabled(state);

                    return (
                        <AttributeCard
                            key={attr.id}
                            attr={attr}
                            state={state}
                            socialData={socialData}
                            errors={errors}
                            isEnabled={isEnabled}
                            isAttributeEnabled={isAttributeEnabled}
                            handleValueChange={handleValueChange}
                        />
                    );
                })}
            </div>
        </div>
    );
};

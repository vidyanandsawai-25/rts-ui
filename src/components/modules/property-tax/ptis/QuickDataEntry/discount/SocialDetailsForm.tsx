"use client";

import React from "react";
import { SaveButton } from "@/components/common";
import { useSocialDetailsForm } from "@/hooks/useSocialDetailsForm";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { useTranslations } from "next-intl";
import { SimpleToggleSection } from "./SimpleToggleSection";
import { ComplexNumericSection } from "./ComplexNumericSection";

interface SocialDetailsFormProps {
    initialSocialData: PropertySocialInfoResponseDto | null;
    propertyId: string;
}

export const SocialDetailsForm: React.FC<SocialDetailsFormProps> = ({
    initialSocialData,
    propertyId
}) => {
    const t = useTranslations("quickDataEntry");
    const {
        socialData,
        isSaving,
        hasChanges,
        errors,
        isAttributeEnabled,
        handleValueChange,
        handleSave
    } = useSocialDetailsForm(initialSocialData, propertyId);

    // 1. Data Segregation: Simple Yes/No Toggles
    const simpleToggleFields = React.useMemo(() => {
        if (!initialSocialData?.socialAttributes) return [];
        return initialSocialData.socialAttributes.filter(
            (attr) =>
                attr.dataType.toUpperCase() === "BIT" &&
                (!attr.children || attr.children.length === 0)
        ).sort((a, b) => (a.displayOrder ?? a.id) - (b.displayOrder ?? b.id));
    }, [initialSocialData]);

    // 2. Data Segregation: Complex numeric fields and toggles with child inputs
    const complexNumericFields = React.useMemo(() => {
        if (!initialSocialData?.socialAttributes) return [];
        const fields = initialSocialData.socialAttributes.filter(
            (attr) =>
                attr.dataType.toUpperCase() !== "BIT" ||
                (attr.children && attr.children.length > 0)
        ).sort((a, b) => (a.displayOrder ?? a.id) - (b.displayOrder ?? b.id));

        const wellIndex = fields.findIndex(
            (attr) => {
                const code = attr.socialAttributeCode.toUpperCase();
                return code.includes("WELL") && !code.includes("BOREWELL");
            }
        );
        const treesIndex = fields.findIndex(
            (attr) => attr.socialAttributeCode.toUpperCase().includes("TREE")
        );

        if (wellIndex !== -1 && treesIndex !== -1) {
            const temp = fields[wellIndex];
            fields[wellIndex] = fields[treesIndex];
            fields[treesIndex] = temp;
        }

        return fields;
    }, [initialSocialData]);

    return (
        <div className="w-full">
            <div className="space-y-6 max-h-[calc(100vh-360px)] overflow-y-auto pr-1 no-scrollbar p-0.5">
                {/* Section 1: Compact Toggles */}
                {simpleToggleFields.length > 0 && (
                    <SimpleToggleSection
                        fields={simpleToggleFields}
                        socialData={socialData}
                        errors={errors}
                        isAttributeEnabled={isAttributeEnabled}
                        handleValueChange={handleValueChange}
                        title={t("discount.simpleTogglesTitle") || "General Attributes"}
                    />
                )}

                {/* Section 2: Numeric / Complex Fields */}
                {complexNumericFields.length > 0 && (
                    <ComplexNumericSection
                        fields={complexNumericFields}
                        socialData={socialData}
                        errors={errors}
                        isAttributeEnabled={isAttributeEnabled}
                        handleValueChange={handleValueChange}
                        title={t("discount.complexFieldsTitle") || "Detailed Attributes"}
                    />
                )}
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                <SaveButton
                    onClick={handleSave}
                    disabled={!hasChanges}
                    isLoading={isSaving}
                    label={t("common.saveChanges") || "Save Changes"}
                />
            </div>
        </div>
    );
};

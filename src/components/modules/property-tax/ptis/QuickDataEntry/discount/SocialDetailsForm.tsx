"use client";

import React from "react";
import { SaveButton } from "@/components/common";
import { useSocialDetailsForm } from "@/hooks/useSocialDetailsForm";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { useTranslations } from "next-intl";
import { SocialSidebar } from "./SocialSidebar";
import { SocialDetailPane } from "./SocialDetailPane";
import { SocialValidationErrorBanner } from "./SocialValidationErrorBanner";
import { getLocalizedName } from "@/lib/utils/social-details";

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
        validationErrors,
        incompleteAttributes,
        isAttributeEnabled,
        handleInputChange,
        handleToggleEnabled,
        handlePhotoUpload,
        handlePhotoDelete,
        handleSave
    } = useSocialDetailsForm(initialSocialData, propertyId);

    const [selectedId, setSelectedId] = React.useState<number | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showActiveFirst, setShowActiveFirst] = React.useState(false);

    // List of root attributes
    const rootAttributes = React.useMemo(() => {
        if (!initialSocialData?.socialAttributes) return [];
        return initialSocialData.socialAttributes.map((attr) => socialData[attr.id]).filter(Boolean);
    }, [initialSocialData, socialData]);

    const filteredAttributes = React.useMemo(() => {
        let list = [...rootAttributes];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter((attr) => {
                const displayName = getLocalizedName(attr.socialAttributeCode, attr.socialAttributeName, t);
                return displayName.toLowerCase().includes(term);
            });
        }
        if (showActiveFirst) {
            list = [...list].sort((a, b) => {
                const aEnabled = a.bitValue === true;
                const bEnabled = b.bitValue === true;
                if (aEnabled && !bEnabled) return -1;
                if (!aEnabled && bEnabled) return 1;
                return 0;
            });
        }
        return list;
    }, [rootAttributes, searchTerm, showActiveFirst, t]);

    const activeSelectedId = React.useMemo(() => {
        if (selectedId !== null) {
            const exists = filteredAttributes.some(d => d.socialAttributeId === selectedId);
            if (exists) return selectedId;
        }
        return filteredAttributes.length > 0 ? filteredAttributes[0].socialAttributeId : null;
    }, [filteredAttributes, selectedId]);

    const selectedAttribute = activeSelectedId !== null ? socialData[activeSelectedId] : null;
    
    const selectedHierarchy = React.useMemo(() => {
        if (activeSelectedId === null || !initialSocialData?.socialAttributes) return null;
        return initialSocialData.socialAttributes.find(attr => attr.id === activeSelectedId);
    }, [initialSocialData, activeSelectedId]);

    const handleErrorTagClick = React.useCallback((id: number) => {
        if (showActiveFirst) {
            setShowActiveFirst(false);
        }
        setSearchTerm("");
        setSelectedId(id);

        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-certificate-id="${id}"]`);
            if (card && typeof card.scrollIntoView === "function") {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }, [showActiveFirst]);

    const handleSaveClick = React.useCallback(async () => {
        const result = await handleSave();
        if (result && !result.isValid && result.errors) {
            const firstInvalidIdStr = Object.keys(result.errors)[0];
            if (firstInvalidIdStr) {
                const firstInvalidId = Number(firstInvalidIdStr);
                const findRootParentId = (attrId: number): number => {
                    const attr = socialData[attrId];
                    if (attr && attr.parentAttributeId) {
                        return findRootParentId(attr.parentAttributeId);
                    }
                    return attrId;
                };
                const rootParentId = findRootParentId(firstInvalidId);
                setSelectedId(rootParentId);
                requestAnimationFrame(() => {
                    const card = document.querySelector(`[data-certificate-id="${rootParentId}"]`);
                    if (card && typeof card.scrollIntoView === "function") {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                });
            }
        }
    }, [handleSave, socialData]);

    const activeIncompleteAttributes = React.useMemo(() => {
        return incompleteAttributes.filter(d => socialData[d.id]?.bitValue === true);
    }, [incompleteAttributes, socialData]);

    return (
        <div className="w-full">
            {/* Validation Error Banner */}
            {activeIncompleteAttributes.length > 0 && (
                <SocialValidationErrorBanner
                    incompleteAttributes={activeIncompleteAttributes}
                    onTagClick={handleErrorTagClick}
                    t={t as unknown as (key: string) => string}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                {/* Left Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4">
                    <SocialSidebar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        showActiveFirst={showActiveFirst}
                        onShowActiveChange={setShowActiveFirst}
                        attributes={filteredAttributes}
                        socialData={socialData}
                        selectedId={activeSelectedId}
                        onSelect={setSelectedId}
                        onToggleEnabled={handleToggleEnabled}
                        validationErrors={validationErrors}
                        t={t as unknown as {
                            (key: string, values?: Record<string, string | number | Date>): string;
                            has?: (key: string) => boolean;
                        }}
                    />
                </div>

                {/* Right Detail Pane */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <SocialDetailPane
                        data={selectedAttribute}
                        hierarchyData={selectedHierarchy}
                        socialData={socialData}
                        onInputChange={handleInputChange}
                        onPhotoUpload={handlePhotoUpload}
                        onPhotoDelete={handlePhotoDelete}
                        validationErrors={validationErrors}
                        isAttributeEnabled={isAttributeEnabled}
                        t={t as unknown as {
                            (key: string, values?: Record<string, string | number | Date>): string;
                            has?: (key: string) => boolean;
                        }}
                    />
                </div>
            </div>

            {/* Save Button Section */}
            <div className="flex justify-end mt-3 pt-2 border-t border-blue-100">
                <SaveButton
                    onClick={handleSaveClick}
                    disabled={!hasChanges || isSaving}
                    isLoading={isSaving}
                    label={t("common.saveChanges") || "Save Changes"}
                />
            </div>
        </div>
    );
};

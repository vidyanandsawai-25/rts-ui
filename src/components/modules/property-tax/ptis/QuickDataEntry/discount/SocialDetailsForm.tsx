"use client";

import React from "react";
import { useSocialDetailsForm } from "@/hooks/useSocialDetailsForm";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { useTranslations } from "next-intl";
import { SocialSidebar } from "./SocialSidebar";
import { SocialDetailPane } from "./SocialDetailPane";
import { SocialValidationErrorBanner } from "./SocialValidationErrorBanner";
import { getLocalizedName } from "@/lib/utils/social-details";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { SocialAttributeHierarchyDto } from "@/types/property-social-details.types";

const checkIfSocialAttributeActiveInInitial = (
    attributes: SocialAttributeHierarchyDto[] | undefined,
    targetId: number
): boolean => {
    if (!attributes) return false;
    for (const attr of attributes) {
        if (attr.id === targetId) {
            return typeof attr.propertySocialDetailId === "number" && attr.propertySocialDetailId > 0 && attr.bitValue === true;
        }
        if (attr.children && attr.children.length > 0) {
            const found = checkIfSocialAttributeActiveInInitial(attr.children, targetId);
            if (found) return true;
        }
    }
    return false;
};

interface SocialDetailsFormProps {
    initialSocialData: PropertySocialInfoResponseDto | null;
    propertyId: string;
}

export const SocialDetailsForm: React.FC<SocialDetailsFormProps> = ({
    initialSocialData,
    propertyId
}) => {
    const t = useTranslations("quickDataEntry");
    const { confirm } = useConfirm();
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
        handleDeleteSocialDetail,
        handleSave,
        revertSocialAttribute
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

    const handleSelectAttribute = React.useCallback((id: number) => {
        if (activeSelectedId !== null && activeSelectedId !== id) {
            revertSocialAttribute(activeSelectedId);
        }
        setSelectedId(id);
    }, [activeSelectedId, revertSocialAttribute]);

    const handleToggleEnabledWrapped = React.useCallback((id: number, checked: boolean) => {
        const item = socialData[id];
        const existsAndActiveInDb = checkIfSocialAttributeActiveInInitial(initialSocialData?.socialAttributes, id);

        if (!checked && existsAndActiveInDb) {
            const displayName = getLocalizedName(item.socialAttributeCode, item.socialAttributeName, t as unknown as Parameters<typeof getLocalizedName>[2]);
            confirm({
                title: t("discount.confirmDeleteAttributeTitle") || "Delete Social Detail & Data",
                description: `${t("discount.confirmToggleOffWarning") || "You have active details:"}\n${displayName}\n\n${t("discount.confirmDeleteAttributeDesc") || "Are you sure you want to delete this social detail and all its associated data?"}`,
                confirmText: t("discount.confirmDeleteAttributeOk") || "Yes, Delete",
                cancelText: t("discount.confirmDeleteAttributeCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: async () => {
                    await handleDeleteSocialDetail(id);
                    handleSelectAttribute(id);
                },
                onCancel: () => {
                    // Leaves toggle state active/unchanged
                }
            });
        } else {
            handleToggleEnabled(id, checked);
            handleSelectAttribute(id);
        }
    }, [handleToggleEnabled, socialData, handleDeleteSocialDetail, confirm, t, initialSocialData?.socialAttributes, handleSelectAttribute]);

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
        handleSelectAttribute(id);

        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-certificate-id="${id}"]`);
            if (card && typeof card.scrollIntoView === "function") {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }, [showActiveFirst, handleSelectAttribute]);

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
                handleSelectAttribute(rootParentId);
                requestAnimationFrame(() => {
                    const card = document.querySelector(`[data-certificate-id="${rootParentId}"]`);
                    if (card && typeof card.scrollIntoView === "function") {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                });
            }
        }
    }, [handleSave, socialData, handleSelectAttribute]);

    const activeIncompleteAttributes = React.useMemo(() => {
        return incompleteAttributes.filter(d => socialData[d.id]?.bitValue === true);
    }, [incompleteAttributes, socialData]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col flex-1 min-h-0 overflow-hidden relative p-2.5 md:p-3 w-full h-full">
            {/* Validation Error Banner */}
            {activeIncompleteAttributes.length > 0 && (
                <SocialValidationErrorBanner
                    incompleteAttributes={activeIncompleteAttributes}
                    onTagClick={handleErrorTagClick}
                    t={t as unknown as (key: string) => string}
                />
            )}

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:overflow-hidden">
                {/* Left Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4 h-auto lg:h-full lg:overflow-hidden">
                    <SocialSidebar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        showActiveFirst={showActiveFirst}
                        onShowActiveChange={setShowActiveFirst}
                        attributes={filteredAttributes}
                        socialData={socialData}
                        selectedId={activeSelectedId}
                        onSelect={handleSelectAttribute}
                        onToggleEnabled={handleToggleEnabledWrapped}
                        validationErrors={validationErrors}
                        t={t as unknown as {
                            (key: string, values?: Record<string, string | number | Date>): string;
                            has?: (key: string) => boolean;
                        }}
                    />
                </div>

                {/* Right Detail Pane */}
                <div className="lg:col-span-7 xl:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-1">
                    <SocialDetailPane
                        data={selectedAttribute}
                        hierarchyData={selectedHierarchy}
                        socialData={socialData}
                        onInputChange={handleInputChange}
                        onPhotoUpload={handlePhotoUpload}
                        onPhotoDelete={handlePhotoDelete}
                        onDeleteSocialDetail={() => {
                            if (activeSelectedId !== null) {
                                handleDeleteSocialDetail(activeSelectedId);
                            }
                        }}
                        isSaving={isSaving}
                        hasChanges={hasChanges}
                        onSave={handleSaveClick}
                        validationErrors={validationErrors}
                        isAttributeEnabled={isAttributeEnabled}
                        t={t as unknown as {
                            (key: string, values?: Record<string, string | number | Date>): string;
                            has?: (key: string) => boolean;
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

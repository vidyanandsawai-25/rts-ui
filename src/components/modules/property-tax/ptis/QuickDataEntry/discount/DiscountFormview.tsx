"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, SaveButton } from "@/components/common";
import { useTranslations } from "next-intl";
import { useDiscountForm } from "@/hooks/useDiscountForm";
import { DiscountPane } from "./DiscountPane";
import { SocialDetailsForm } from "./SocialDetailsForm";
import { PropertyDiscountInfoResponseDto } from "@/types/discount.types";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { getFilteredDiscounts } from "@/lib/utils/discount-helpers";
import { useConfirm } from "@/components/common/ConfirmProvider";
import { getLocalizedName } from "@/lib/utils/social-details";

interface DiscountFormProps {
    initialDiscountData: PropertyDiscountInfoResponseDto | null;
    initialSocialData: PropertySocialInfoResponseDto | null;
    propertyId: string;
}

const DiscountFormview: React.FC<DiscountFormProps> = ({
    initialDiscountData,
    initialSocialData,
    propertyId
}) => {
    const t = useTranslations('quickDataEntry');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { confirm } = useConfirm();

    const activeTab = searchParams.get("view") || "discount";

    const handleTabChange = useCallback((value: string | number) => {
        const win = typeof window !== 'undefined' ? (window as unknown as { __discountFormHasChanges?: boolean; __socialFormHasChanges?: boolean }) : {};
        const hasChanges = activeTab === "discount" ? !!win.__discountFormHasChanges : !!win.__socialFormHasChanges;

        if (hasChanges) {
            confirm({
                variant: 'warning',
                title: t('discount.unsavedChangesTitle') || 'Unsaved Changes',
                description: t('discount.unsavedChangesDesc') || 'You have unsaved changes in the Discount & Social Data tab. Do you want to discard them, or continue editing?',
                confirmText: t('discount.continueButton') || 'Continue Editing',
                cancelText: t('discount.discardConfirmButton') || 'Discard Changes',
                onConfirm: () => {
                    // Do nothing, stays on the current tab
                },
                onCancel: () => {
                    const localWin = typeof window !== 'undefined' ? (window as unknown as { __discountFormHasChanges?: boolean; __socialFormHasChanges?: boolean }) : null;
                    if (localWin) {
                        localWin.__discountFormHasChanges = false;
                        localWin.__socialFormHasChanges = false;
                    }
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("view", String(value));
                    router.push(`${pathname}?${params.toString()}`);
                }
            });
        } else {
            const params = new URLSearchParams(searchParams.toString());
            params.set("view", String(value));
            router.push(`${pathname}?${params.toString()}`);
        }
    }, [searchParams, router, pathname, activeTab, confirm, t]);

    const {
        discountData,
        isSaving,
        hasChanges,
        validationErrors,
        incompleteDiscounts,
        handleToggleEnabled,
        handleInputChange,
        handleFileUpload,
        handleFileDelete,
        handleDeleteDiscount,
        handleSave,
        revertDiscount
    } = useDiscountForm(initialDiscountData, propertyId);

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveFirst, setShowActiveFirst] = useState(false);

    const activeSelectedId = useMemo(() => {
        if (selectedId !== null) {
            const exists = discountData[selectedId];
            if (exists) return selectedId;
        }
        const rootDiscounts = initialDiscountData?.discountAttributes || [];
        return rootDiscounts.length > 0 ? rootDiscounts[0].id : null;
    }, [discountData, selectedId, initialDiscountData?.discountAttributes]);

    const handleSelectDiscount = useCallback((id: number) => {
        if (activeSelectedId !== null && activeSelectedId !== id) {
            revertDiscount(activeSelectedId);
        }
        setSelectedId(id);
    }, [activeSelectedId, revertDiscount]);

    const handleToggleEnabledWrapped = useCallback((id: number, checked: boolean) => {
        const item = discountData[id];
        const initialItem = initialDiscountData?.discountAttributes?.find(x => x.id === id);
        const existsAndActiveInDb = initialItem && typeof initialItem.propertySocialDetailId === "number" && initialItem.propertySocialDetailId > 0 && initialItem.bitValue === true;

        if (!checked && existsAndActiveInDb) {
            const displayName = getLocalizedName(item.socialAttributeCode, item.socialAttributeName, t as unknown as Parameters<typeof getLocalizedName>[2]);
            confirm({
                title: t("discount.confirmDeleteDiscountTitle") || "Delete Discount & Data",
                description: `${t("discount.confirmToggleOffWarning") || "You have active details:"}\n${displayName}\n\n${t("discount.confirmDeleteDiscountDesc") || "Are you sure you want to delete this discount and all its associated data?"}`,
                confirmText: t("discount.confirmDeleteDiscountOk") || "Yes, Delete",
                cancelText: t("discount.confirmDeleteDiscountCancel") || "No, Cancel",
                variant: "delete",
                onConfirm: async () => {
                    await handleDeleteDiscount(id);
                    handleSelectDiscount(id);
                },
                onCancel: () => {
                    // Leaves toggle state active/unchanged
                }
            });
        } else {
            handleToggleEnabled(id, checked);
            handleSelectDiscount(id);
        }
    }, [handleToggleEnabled, discountData, handleDeleteDiscount, confirm, t, initialDiscountData?.discountAttributes, handleSelectDiscount]);

    const filteredDiscounts = useMemo(() => {
        return getFilteredDiscounts(discountData, searchTerm, showActiveFirst, t);
    }, [discountData, searchTerm, showActiveFirst, t]);

    const selectedDiscount = activeSelectedId !== null ? discountData[activeSelectedId] : null;

    const handleErrorTagClick = useCallback((id: number) => {
        if (showActiveFirst) {
            setShowActiveFirst(false);
        }
        setSearchTerm("");
        handleSelectDiscount(id);

        requestAnimationFrame(() => {
            const card = document.querySelector(`[data-certificate-id="${id}"]`);
            if (card && typeof card.scrollIntoView === "function") {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }, [showActiveFirst, handleSelectDiscount]);

    const handleSaveClick = useCallback(async () => {
        const result = await handleSave();
        if (result && !result.isValid && result.incompleteDiscounts) {
            const activeIncomplete = result.incompleteDiscounts.filter(
                (d) => {
                    const item = discountData[d.id];
                    return item ? (item.dataType.toUpperCase() === "BIT" ? item.bitValue === true : item.enabled) : false;
                }
            );
            if (activeIncomplete.length > 0) {
                const firstInvalidId = activeIncomplete[0].id;
                handleSelectDiscount(firstInvalidId);
                requestAnimationFrame(() => {
                    const card = document.querySelector(`[data-certificate-id="${firstInvalidId}"]`);
                    if (card && typeof card.scrollIntoView === "function") {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                });
            }
        }
    }, [handleSave, discountData, handleSelectDiscount]);

    return (
        <>
        <Tabs value={activeTab} onChange={handleTabChange} variant="pills" size="sm" className="w-full p-4">
            <Tabs.TabList className="mb-4 bg-slate-100 p-1.5 rounded-xl max-w-md border border-slate-200">
                <Tabs.Tab value="discount" className="w-1/2 justify-center py-2 text-xs font-bold cursor-pointer">
                    {t("discount.title")}
                </Tabs.Tab>
                <Tabs.Tab value="social" className="w-1/2 justify-center py-2 text-xs font-bold cursor-pointer">
                    {t("discount.socialTitle")}
                </Tabs.Tab>
            </Tabs.TabList>

            {/* Discount Information Tab */}
            <Tabs.TabPanel value="discount" className="h-[calc(100vh-275px)] min-h-[500px] flex flex-col mt-0">
                <DiscountPane
                    discountData={discountData}
                    incompleteDiscounts={incompleteDiscounts}
                    handleErrorTagClick={handleErrorTagClick}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showActiveFirst={showActiveFirst}
                    setShowActiveFirst={setShowActiveFirst}
                    filteredDiscounts={filteredDiscounts}
                    activeSelectedId={activeSelectedId}
                    setSelectedId={handleSelectDiscount}
                    handleToggleEnabled={handleToggleEnabledWrapped}
                    validationErrors={validationErrors}
                    selectedDiscount={selectedDiscount}
                    handleInputChange={handleInputChange}
                    handleFileUpload={handleFileUpload}
                    handleFileDelete={handleFileDelete}
                    handleDeleteDiscount={handleDeleteDiscount}
                    isSaving={isSaving}
                    t={t}
                />
            </Tabs.TabPanel>

            {/* Social Information Tab */}
            <Tabs.TabPanel value="social" className="h-[calc(100vh-275px)] min-h-[500px] flex flex-col mt-0">
                <SocialDetailsForm
                    initialSocialData={initialSocialData}
                    propertyId={propertyId}
                />
            </Tabs.TabPanel>
        </Tabs>

        {/* Fixed Save Button - bottom right */}
        {activeTab === "discount" && (
            <div className="fixed bottom-4 right-6 z-50">
                <SaveButton
                    onClick={handleSaveClick}
                    disabled={!hasChanges || isSaving}
                    isLoading={isSaving}
                    label={t("common.saveChanges") || "Save Changes"}
                />
            </div>
        )}
        </>
    );
};

export default DiscountFormview;

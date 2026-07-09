"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/common";
import { useTranslations } from "next-intl";
import { useDiscountForm } from "@/hooks/useDiscountForm";
import { DiscountPane } from "./DiscountPane";
import { SocialDetailsForm } from "./SocialDetailsForm";
import { PropertyDiscountInfoResponseDto } from "@/types/discount.types";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { getFilteredDiscounts } from "@/lib/utils/discount-helpers";
import { useConfirm } from "@/components/common/ConfirmProvider";

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
        handleSave
    } = useDiscountForm(initialDiscountData, propertyId);

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveFirst, setShowActiveFirst] = useState(false);

    const filteredDiscounts = useMemo(() => {
        return getFilteredDiscounts(discountData, searchTerm, showActiveFirst, t);
    }, [discountData, searchTerm, showActiveFirst, t]);

    const activeSelectedId = useMemo(() => {
        if (selectedId !== null) {
            const exists = filteredDiscounts.some(d => d.id === selectedId);
            if (exists) return selectedId;
        }
        return filteredDiscounts.length > 0 ? filteredDiscounts[0].id : null;
    }, [filteredDiscounts, selectedId]);

    const selectedDiscount = activeSelectedId !== null ? discountData[activeSelectedId] : null;

    const handleErrorTagClick = useCallback((id: number) => {
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
                setSelectedId(firstInvalidId);
                requestAnimationFrame(() => {
                    const card = document.querySelector(`[data-certificate-id="${firstInvalidId}"]`);
                    if (card && typeof card.scrollIntoView === "function") {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                });
            }
        }
    }, [handleSave, discountData]);

    return (
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
            <Tabs.TabPanel value="discount" className="mt-0">
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
                    setSelectedId={setSelectedId}
                    handleToggleEnabled={handleToggleEnabled}
                    validationErrors={validationErrors}
                    selectedDiscount={selectedDiscount}
                    handleInputChange={handleInputChange}
                    handleFileUpload={handleFileUpload}
                    handleFileDelete={handleFileDelete}
                    handleSaveClick={handleSaveClick}
                    hasChanges={hasChanges}
                    isSaving={isSaving}
                    t={t}
                />
            </Tabs.TabPanel>

            {/* Social Information Tab */}
            <Tabs.TabPanel value="social" className="mt-0">
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 md:p-3">
                    <h3 className="text-base font-bold text-blue-800 mb-3 pb-1.5 border-b border-blue-200">
                        {t("discount.socialTitle")}
                    </h3>
                    <SocialDetailsForm
                        initialSocialData={initialSocialData}
                        propertyId={propertyId}
                    />
                </div>
            </Tabs.TabPanel>
        </Tabs>
    );
};

export default DiscountFormview;

"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, SaveButton } from "@/components/common";
import { useTranslations } from "next-intl";
import { useDiscountForm } from "@/hooks/useDiscountForm";
import { DiscountSidebar } from "./DiscountSidebar";
import { DiscountDetailPane } from "./DiscountDetailPane";
import { ValidationErrorBanner } from "./ValidationErrorBanner";
import { SocialDetailsForm } from "./SocialDetailsForm";
import { PropertyDiscountInfoResponseDto } from "@/types/discount.types";
import { PropertySocialInfoResponseDto } from "@/types/property-social-details.types";
import { getFilteredDiscounts } from "@/lib/utils/discount-helpers";

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

    const activeTab = searchParams.get("view") || "discount";

    const handleTabChange = useCallback((value: string | number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", String(value));
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    const {
        discountData,
        isSaving,
        hasChanges,
        validationErrors,
        incompleteDiscounts,
        handleToggleEnabled,
        handleInputChange,
        handleFileUpload,
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
                (d) => discountData[d.id]?.enabled
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
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 md:p-3">
                    <h3 className="text-base font-bold text-blue-800 mb-3 pb-1.5 border-b border-blue-200">
                        {t("discount.title")}
                    </h3>

                    {/* Validation Error Banner */}
                    {incompleteDiscounts.filter(d => discountData[d.id]?.enabled).length > 0 && (
                        <ValidationErrorBanner
                            incompleteDiscounts={incompleteDiscounts.filter(d => discountData[d.id]?.enabled)}
                            onTagClick={handleErrorTagClick}
                            t={t}
                        />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                        {/* Left Sidebar */}
                        <div className="lg:col-span-5 xl:col-span-4">
                            <DiscountSidebar
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                showActiveFirst={showActiveFirst}
                                onShowActiveChange={setShowActiveFirst}
                                discounts={filteredDiscounts}
                                selectedId={activeSelectedId}
                                onSelect={setSelectedId}
                                onToggleEnabled={handleToggleEnabled}
                                validationErrors={validationErrors}
                                t={t}
                            />
                        </div>

                        {/* Right Detail Pane */}
                        <div className="lg:col-span-7 xl:col-span-8">
                            <DiscountDetailPane
                                data={selectedDiscount}
                                onInputChange={(field, value) => {
                                    if (activeSelectedId !== null) {
                                        handleInputChange(activeSelectedId, field, value);
                                    }
                                }}
                                onFileUpload={(file) => {
                                    if (activeSelectedId !== null) {
                                        handleFileUpload(activeSelectedId, file);
                                    }
                                }}
                                validationError={activeSelectedId !== null ? validationErrors[activeSelectedId] : undefined}
                                t={t}
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
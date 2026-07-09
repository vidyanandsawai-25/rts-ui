"use client";

import React from "react";
import { SaveButton } from "@/components/common";
import { ValidationErrorBanner } from "./ValidationErrorBanner";
import { DiscountSidebar } from "./DiscountSidebar";
import { DiscountDetailPane } from "./DiscountDetailPane";
import { DiscountAttributeState, DiscountState } from "@/types/discount.types";

interface DiscountPaneProps {
    discountData: DiscountState;
    incompleteDiscounts: { id: number; name: string }[];
    handleErrorTagClick: (id: number) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    showActiveFirst: boolean;
    setShowActiveFirst: (val: boolean) => void;
    filteredDiscounts: DiscountAttributeState[];
    activeSelectedId: number | null;
    setSelectedId: (id: number) => void;
    handleToggleEnabled: (id: number, checked: boolean) => void;
    validationErrors: Record<number, string>;
    selectedDiscount: DiscountAttributeState | null | undefined;
    handleInputChange: (id: number, field: "intValue" | "decimalValue" | "textValue" | "dateValue" | "remark", value: string) => void;
    handleFileUpload: (id: number, file: File) => void;
    handleFileDelete: (id: number) => void;
    handleSaveClick: () => Promise<void>;
    hasChanges: boolean;
    isSaving: boolean;
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    };
}

export const DiscountPane: React.FC<DiscountPaneProps> = ({
    discountData,
    incompleteDiscounts,
    handleErrorTagClick,
    searchTerm,
    setSearchTerm,
    showActiveFirst,
    setShowActiveFirst,
    filteredDiscounts,
    activeSelectedId,
    setSelectedId,
    handleToggleEnabled,
    validationErrors,
    selectedDiscount,
    handleInputChange,
    handleFileUpload,
    handleFileDelete,
    handleSaveClick,
    hasChanges,
    isSaving,
    t
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-2 md:p-3">
            <h3 className="text-base font-bold text-blue-800 mb-3 pb-1.5 border-b border-blue-200">
                {t("discount.title")}
            </h3>

            {/* Validation Error Banner */}
            {incompleteDiscounts.filter(d => {
                const item = discountData[d.id];
                return item ? (item.dataType.toUpperCase() === "BIT" ? item.bitValue === true : item.enabled) : false;
            }).length > 0 && (
                <ValidationErrorBanner
                    incompleteDiscounts={incompleteDiscounts.filter(d => {
                        const item = discountData[d.id];
                        return item ? (item.dataType.toUpperCase() === "BIT" ? item.bitValue === true : item.enabled) : false;
                    })}
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
                        onFileDelete={() => {
                            if (activeSelectedId !== null) {
                                handleFileDelete(activeSelectedId);
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
    );
};

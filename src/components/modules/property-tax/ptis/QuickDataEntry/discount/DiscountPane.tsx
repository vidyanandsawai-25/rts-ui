"use client";

import React from "react";
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
    handleDeleteDiscount: (id: number) => void;
    isSaving: boolean;
    hasChanges?: boolean;
    onSave?: () => void;

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
    handleDeleteDiscount,
    isSaving,
    hasChanges,
    onSave,

    t
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col flex-1 min-h-0 overflow-hidden relative p-2.5 md:p-3 w-full h-full">
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

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:overflow-hidden">
                {/* Left Sidebar */}
                <div className="lg:col-span-5 xl:col-span-4 h-auto lg:h-full lg:overflow-hidden">
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
                <div className="lg:col-span-7 xl:col-span-8 h-auto lg:h-full lg:overflow-y-auto pr-1">
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
                        onDeleteDiscount={() => {
                            if (activeSelectedId !== null) {
                                handleDeleteDiscount(activeSelectedId);
                            }
                        }}
                        isSaving={isSaving}
                        hasChanges={hasChanges}
                        onSave={onSave}
                        validationError={activeSelectedId !== null ? validationErrors[activeSelectedId] : undefined}
                        t={t}
                    />
                </div>
            </div>
        </div>
    );
};

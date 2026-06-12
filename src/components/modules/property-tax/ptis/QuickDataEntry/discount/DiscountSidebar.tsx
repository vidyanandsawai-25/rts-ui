"use client";

import React from "react";
import { Filter, ShieldCheck, AlertCircle, EyeOff } from "lucide-react";
import { ToggleSwitch, SearchInput, Badge } from "@/components/common";
import { DiscountAttributeState } from "@/types/discount.types";
import { getLocalizedName } from "@/lib/utils/social-details";

interface DiscountSidebarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    showActiveFirst: boolean;
    onShowActiveChange: (checked: boolean) => void;
    discounts: DiscountAttributeState[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    onToggleEnabled: (id: number, checked: boolean) => void;
    validationErrors?: Record<number, string>;
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    };
}

export const DiscountSidebar: React.FC<DiscountSidebarProps> = ({
    searchTerm,
    onSearchChange,
    showActiveFirst,
    onShowActiveChange,
    discounts,
    selectedId,
    onToggleEnabled,
    onSelect,
    validationErrors,
    t,
}) => {
    const getStatusBadge = (discount: DiscountAttributeState) => {
        if (!discount.enabled) {
            return (
                <Badge variant="secondary" size="sm" icon={EyeOff}>
                    {t("discount.statusDisabled") || "Disabled"}
                </Badge>
            );
        }

        const errorMsg = validationErrors?.[discount.id];
        if (errorMsg) {
            return (
                <Badge
                    variant="destructive"
                    size="sm"
                    icon={AlertCircle}
                    className="bg-red-50 text-red-700 border-red-200 animate-pulse font-bold"
                >
                    {errorMsg}
                </Badge>
            );
        }

        const hasDoc = (discount.documentGuid?.trim() ?? "") !== "" || !!discount.documentBindingId;
        const dataTypeUpper = (discount.dataType || "").toUpperCase();

        // Check if value is filled when required
        let hasValue = true;
        if (dataTypeUpper === "INT" && (discount.intValue === null || discount.intValue === undefined || String(discount.intValue).trim() === "")) {
            hasValue = false;
        } else if (dataTypeUpper === "DECIMAL" && (discount.decimalValue === null || discount.decimalValue === undefined || String(discount.decimalValue).trim() === "")) {
            hasValue = false;
        } else if (dataTypeUpper === "VARCHAR" && (!discount.textValue || discount.textValue.trim() === "")) {
            hasValue = false;
        } else if (dataTypeUpper === "DATE" && (!discount.dateValue || discount.dateValue.trim() === "")) {
            hasValue = false;
        }

        if (hasDoc && hasValue) {
            return (
                <Badge
                    variant="success"
                    size="sm"
                    icon={ShieldCheck}
                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                    {t("discount.statusActiveUploaded") || "Active & Uploaded"}
                </Badge>
            );
        }

        return (
            <Badge
                variant="warning"
                size="sm"
                icon={AlertCircle}
                className="bg-amber-50 text-amber-700 border-amber-200"
            >
                {t("discount.statusIncomplete") || "Incomplete"}
            </Badge>
        );
    };

    return (
        <div className="flex flex-col min-h-[300px] lg:h-[calc(100vh-340px)] border-r border-blue-100 pr-2">
            {/* Search and Filters */}
            <div className="space-y-3 mb-4">
                <SearchInput
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder={t("discount.searchPlaceholder") || "Search discount attributes..."}
                    className="w-full mb-0 shadow-sm"
                />

                <div 
                    className="flex items-center justify-between px-1.5 py-1 bg-blue-50/40 rounded-lg border border-blue-50 cursor-pointer select-none"
                    onClick={() => onShowActiveChange(!showActiveFirst)}
                >
                    <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                        <Filter size={12} className="text-blue-600" />
                        {t("discount.showActiveFirst") || "Show Active First"}
                    </span>
                    <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                        <ToggleSwitch
                            checked={showActiveFirst}
                            onChange={onShowActiveChange}
                            showPopup={false}
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-blue-100">
                {discounts.length === 0 ? (
                    <div className="text-center py-8 text-sm font-semibold text-gray-400">
                        {t("discount.noDiscountsFound") || "No attributes found"}
                    </div>
                ) : (
                    discounts.map((discount) => {
                        const isSelected = selectedId === discount.id;
                        const hasError = discount.enabled && !!validationErrors?.[discount.id];
                        const displayName = getLocalizedName(
                            discount.socialAttributeCode,
                            discount.socialAttributeName,
                            t
                        );


                        const cardClass = isSelected
                            ? hasError
                                ? "bg-red-50/60 border-red-600 shadow-sm ring-1 ring-red-600/30"
                                : "bg-blue-50/60 border-blue-600 shadow-sm ring-1 ring-blue-600/30"
                            : hasError
                                ? "bg-red-50/10 border-red-200 hover:border-red-300"
                                : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/10";

                        return (
                            <div
                                key={discount.id}
                                data-certificate-id={discount.id}
                                onClick={() => onSelect(discount.id)}
                                className={`group p-3 border rounded-xl cursor-pointer transition-all duration-200 flex flex-col gap-2 relative ${cardClass}`}
                            >
                                {/* Active Selection Border Indicator */}
                                {isSelected && (
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${
                                        hasError ? "bg-red-600" : "bg-blue-600"
                                    }`} />
                                )}

                                <div className="flex justify-between items-start gap-2 pl-1.5">
                                    <span
                                        className={`text-sm font-bold transition-colors line-clamp-2 flex-1 cursor-pointer select-none ${
                                            isSelected 
                                                ? hasError ? "text-red-900" : "text-blue-900" 
                                                : hasError ? "text-red-800 hover:text-red-900" : "text-gray-700 group-hover:text-blue-800"
                                        }`}
                                    >
                                        {displayName}
                                    </span>
                                    <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                                        <ToggleSwitch
                                            checked={discount.enabled}
                                            onChange={(checked) => onToggleEnabled(discount.id, checked)}
                                            showPopup={false}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pl-1.5">
                                    {getStatusBadge(discount)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

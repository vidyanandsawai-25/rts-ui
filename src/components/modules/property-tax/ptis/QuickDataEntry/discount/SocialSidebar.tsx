"use client";

import React from "react";
import { Filter, ShieldCheck, AlertCircle, EyeOff } from "lucide-react";
import { ToggleSwitch, SearchInput, Badge } from "@/components/common";
import { FlatSocialAttributeState } from "@/lib/utils/social-details";
import { getLocalizedName } from "@/lib/utils/social-details";

import { checkCompleteness, hasAnyError } from "@/lib/utils/social-guidelines";

interface SocialSidebarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    showActiveFirst: boolean;
    onShowActiveChange: (checked: boolean) => void;
    attributes: FlatSocialAttributeState[];
    socialData: Record<number, FlatSocialAttributeState>;
    selectedId: number | null;
    onSelect: (id: number) => void;
    onToggleEnabled: (id: number, checked: boolean) => void;
    validationErrors?: Record<number, string>;
    t: {
        (key: string, values?: Record<string, string | number | Date>): string;
        has?: (key: string) => boolean;
    };
}

export const SocialSidebar: React.FC<SocialSidebarProps> = ({
    searchTerm,
    onSearchChange,
    showActiveFirst,
    onShowActiveChange,
    attributes,
    socialData,
    selectedId,
    onToggleEnabled,
    onSelect,
    validationErrors,
    t,
}) => {
    const getStatusBadge = (attr: FlatSocialAttributeState) => {
        const isEnabled = attr.bitValue === true;
        if (!isEnabled) {
            return (
                <Badge variant="secondary" size="sm" icon={EyeOff}>
                    {t("discount.statusDisabled") || "Disabled"}
                </Badge>
            );
        }

        const errorMsg = hasAnyError(attr, socialData, validationErrors);
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

        const isComplete = checkCompleteness(attr, socialData);
        if (isComplete) {
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
                    placeholder={t("discount.searchPlaceholder") || "Search social attributes..."}
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
                {attributes.length === 0 ? (
                    <div className="text-center py-8 text-sm font-semibold text-gray-400">
                        {t("discount.noDiscountsFound") || "No attributes found"}
                    </div>
                ) : (
                    attributes.map((attr) => {
                        const isSelected = selectedId === attr.socialAttributeId;
                        const errorMsg = hasAnyError(attr, socialData, validationErrors);
                        const hasError = attr.bitValue === true && !!errorMsg;
                        const displayName = getLocalizedName(
                            attr.socialAttributeCode,
                            attr.socialAttributeName,
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
                                key={attr.socialAttributeId}
                                data-certificate-id={attr.socialAttributeId}
                                onClick={() => onSelect(attr.socialAttributeId)}
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
                                            checked={attr.bitValue === true}
                                            onChange={(checked) => onToggleEnabled(attr.socialAttributeId, checked)}
                                            showPopup={false}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pl-1.5">
                                    {getStatusBadge(attr)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

"use client";

import React from "react";
import { Option, Select } from "@/components/common/select";
import { Input } from "@/components/common/Input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ApplyButton, ClearButton, UpdateButton, AddButton } from "@/components/common/ActionButtons";
import { CancelButton } from "@/components/common";

interface FloorCvHeaderExtraProps {
    // Translations
    t: ReturnType<typeof import("next-intl").useTranslations>;
    tW: ReturnType<typeof import("next-intl").useTranslations>;
    // Options
    assessmentYearOptions: Option[];
    floorOptions: Option[];
    liftStatusOptions: Option[];
    // Filter state
    selectedYear: string;
    fromFloor: string;
    toFloor: string;
    liftStatus: string;
    factorValue: string;
    // Derived flags
    isApplyDisabled: boolean;
    isBulkUpdateDisabled: boolean;
    isGeneratingAll: boolean;
    isBulkUpdating: boolean;
    isUpdating: boolean;
    hasNewRecords: boolean;
    newRecordsCount: number;
    // Handlers
    handleAssessmentYearChange: (value: string) => void;
    setFromFloor: (value: string) => void;
    setToFloor: (value: string) => void;
    setLiftStatus: (value: string) => void;
    setFactorValue: (value: string) => void;
    handleApplyFilter: () => void;
    handleClearAll: () => void;
    handleBulkUpdate: () => void;
    handleGenerateAll: () => void;
    addToast: (type: "success" | "error" | "info" | "warning", message: string) => void;
}

export const FloorCvHeaderExtra: React.FC<FloorCvHeaderExtraProps> = ({
    t,
    tW,
    assessmentYearOptions,
    floorOptions,
    liftStatusOptions,
    selectedYear,
    fromFloor,
    toFloor,
    liftStatus,
    factorValue,
    isApplyDisabled,
    isBulkUpdateDisabled,
    isGeneratingAll,
    isBulkUpdating,
    isUpdating,
    hasNewRecords,
    newRecordsCount,
    handleAssessmentYearChange,
    setFromFloor,
    setToFloor,
    setLiftStatus,
    setFactorValue,
    handleApplyFilter,
    handleClearAll,
    handleBulkUpdate,
    handleGenerateAll,
    addToast,
}) => {
    return (
        <div className="w-full">
            <div className="flex items-end gap-4 mb-3 flex-wrap">

                <div className="min-w-[140px]">
                    <Select
                        options={assessmentYearOptions}
                        value={selectedYear}
                        onChange={handleAssessmentYearChange}
                        label={t("filters.assessmentYear")}
                        selectSize="sm"
                    />
                </div>

                <div className="min-w-[180px]">
                    <Select
                        options={floorOptions}
                        value={fromFloor}
                        onChange={setFromFloor}
                        label={t("filters.fromFloor")}
                        selectSize="sm"
                    />
                </div>

                <div className="min-w-[180px]">
                    <Select
                        options={floorOptions}
                        value={toFloor}
                        onChange={setToFloor}
                        label={t("filters.toFloor")}
                        selectSize="sm"
                    />
                </div>

                <div className="min-w-[120px]">
                    <Select
                        options={liftStatusOptions}
                        value={liftStatus}
                        onChange={setLiftStatus}
                        label={t("filters.liftStatus")}
                        selectSize="sm"
                    />
                </div>

                <div className="min-w-[100px]">
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="999999"
                        value={factorValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            // Prevent negative values and excessive values
                            if ((parseFloat(value) >= 0 && parseFloat(value) <= 999999) || value === "") {
                                setFactorValue(value);
                            } else {
                                addToast("error", tW("common.messages.valueExceedsMax"));
                            }
                        }}
                        onKeyDown={(e) => {
                            // Prevent minus key from being entered
                            if (e.key === "-" || e.key === "e" || e.key === "E") {
                                e.preventDefault();
                            }
                        }}
                        label={t("filters.factor")}
                        placeholder="0.00"
                        className="h-8"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {hasNewRecords && (
                        <div className="flex items-center">
                            <StatusBadge
                                variant="pending"
                                label={`${newRecordsCount} ${tW("common.labels.pendingRecordCreates")}`}
                                className="px-3 py-1.5"
                            />
                        </div>
                    )}
                    <AddButton
                        label={isGeneratingAll ? tW("common.buttons.generating") : tW("common.buttons.generateAll")}
                        size="sm"
                        onClick={handleGenerateAll}
                        disabled={!hasNewRecords || isGeneratingAll || isBulkUpdating || isUpdating}
                    />
                    <ApplyButton
                        label={tW("common.buttons.apply")}
                        size="sm"
                        onClick={handleApplyFilter}
                        disabled={isApplyDisabled}
                    />
                    <ClearButton
                        label={tW("common.buttons.clear")}
                        size="sm"
                        onClick={handleClearAll}
                    />
                    <UpdateButton
                        label={isBulkUpdating ? tW("common.buttons.updating") : tW("common.buttons.update")}
                        size="sm"
                        onClick={handleBulkUpdate}
                        disabled={isBulkUpdateDisabled}
                    />
                    <CancelButton
                        label={tW("common.buttons.cancel")}
                        size="sm"
                        onClick={handleClearAll}
                    />
                </div>
            </div>
        </div>
    );
};

"use client";

import React from "react";
import { Select} from "@/components/common/select";
import { Input } from "@/components/common/Input";
import { ApplyButton, ClearButton, UpdateButton, CancelButton, AddButton } from "@/components/common/ActionButtons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NatureFactorCvHeaderExtraProps } from "@/types/natureofbuilding-cv-weightageMaster.types";


export const NatureFactorCvHeaderExtra: React.FC<NatureFactorCvHeaderExtraProps> = React.memo(({
    t,
    tW,
    assessmentYearOptions,
    constructionTypeOptions,
    selectedYear,
    constructionType,
    factorValue,
    setFactorValue,
    handleAssessmentYearChange,
    handleConstructionTypeChange,
    handleGenerateAll,
    handleApplyFilter,
    handleClearAll,
    handleBulkUpdate,
    hasNewRecords,
    newRecordsCount,
    isGeneratingAll,
    isBulkUpdating,
    isUpdating,
    isApplyDisabled,
    isBulkUpdateDisabled
}) => {
    return (
        <div className="w-full">
            <div className="flex items-end gap-4 mb-3 flex-wrap">
                <div className="min-w-[140px]">
                    <Select
                        options={assessmentYearOptions}
                        value={selectedYear}
                        onChange={handleAssessmentYearChange}
                        label={t('filters.assessmentYear')}
                        selectSize="sm"
                    />
                </div>
                <div className="min-w-[200px]">
                    <Select
                        options={constructionTypeOptions}
                        value={constructionType}
                        onChange={handleConstructionTypeChange}
                        label={t('filters.constructionType')}
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
                            if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 999999)) {
                                setFactorValue(value);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                e.preventDefault();
                            }
                        }}
                        label={t('filters.factor')}
                        placeholder={t('placeholders.factor')}
                        className="h-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {hasNewRecords && (
                        <div className="flex items-center">
                            <StatusBadge
                                variant="pending"
                                label={tW('common.labels.pendingRecordCreates', { count: newRecordsCount })}
                                className="px-3 py-1.5"
                            />
                        </div>
                    )}
                    <AddButton
                        label={isGeneratingAll ? tW('common.buttons.generating') : tW('common.buttons.generateAll')}
                        size="sm"
                        onClick={handleGenerateAll}
                        disabled={!hasNewRecords || isGeneratingAll || isBulkUpdating || isUpdating}
                    />
                    <ApplyButton
                        label={tW('common.buttons.apply')}
                        size="sm"
                        onClick={handleApplyFilter}
                        disabled={isApplyDisabled}
                    />
                    <ClearButton
                        label={tW('common.buttons.clear')}
                        size="sm"
                        onClick={handleClearAll}
                    />
                    <UpdateButton
                        label={isBulkUpdating ? tW('common.buttons.updating') : tW('common.buttons.update')}
                        size="sm"
                        onClick={handleBulkUpdate}
                        disabled={isBulkUpdateDisabled}
                    />
                    <CancelButton
                        label={tW('common.buttons.cancel')}
                        size="sm"
                        onClick={handleClearAll}
                    />
                </div>
            </div>
        </div>
    );
});
NatureFactorCvHeaderExtra.displayName = "NatureFactorCvHeaderExtra";

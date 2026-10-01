'use client';

import { Card, SearchInput, ClearButton, SearchSelect } from "@/components/common";
import { GapAnalysisViewFormProps } from "@/types/PropertyMedia/PropertyMedia.types";
import { useTranslations } from "next-intl";

export function GapAnalysisViewForm({
    workflowStageOptions = [],
    divisionOptions = [],
    propertyTypeOptions = [],
    wardOptions = [],
    selectedWorkflowStage = '',
    selectedDivision = '',
    selectedWard = '',
    selectedPropertyType = '',
    searchTerm = '',
    onFilterChange,
    onSearchChange,
    onClear,
    isWardDisabled = false,
}: GapAnalysisViewFormProps) {
    const t = useTranslations("propertyMedia");

    return (
        <Card className="mb-2.5 rounded-xl border border-[#dce8f5] bg-[#f8fbff] p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
                <SearchSelect
                    name="workflowStageId"
                    value={selectedWorkflowStage}
                    options={workflowStageOptions}
                    onChange={onFilterChange}
                    label={t("propertyMediaViewDrawer.workflowStageLabel")}
                    placeholder={t("propertyMediaViewDrawer.placeholders.selectStage") || "Select Stage"}
                />

                <SearchSelect
                    name="divisionId"
                    value={selectedDivision}
                    options={divisionOptions}
                    onChange={onFilterChange}
                    label={t("propertyMediaViewDrawer.divisionLabel")}
                    placeholder={t("propertyMediaViewDrawer.placeholders.selectDivision") || "Select Division"}
                />

                <SearchSelect
                    name="wardId"
                    value={selectedWard}
                    options={wardOptions}
                    onChange={onFilterChange}
                    label={t("propertyMediaViewDrawer.wardLabel")}
                    placeholder={
                        isWardDisabled
                            ? (t("propertyMediaViewDrawer.placeholders.selectDivision") || "Select Division first")
                            : (t("propertyMediaViewDrawer.placeholders.selectWard") || "Select Ward")
                    }
                    disabled={isWardDisabled}
                />

                <SearchSelect
                    name="propertyTypeId"
                    value={selectedPropertyType}
                    options={propertyTypeOptions}
                    onChange={onFilterChange}
                    label={t("propertyMediaViewDrawer.propertyTypeLabel")}
                    placeholder={t("propertyMediaViewDrawer.placeholders.selectPropertyType") || "Select Property Type"}
                />

                <div className="flex flex-col gap-1 w-full">
                    <label className="text-sm font-medium text-gray-700">
                        {t("propertyMediaViewDrawer.search")}
                    </label>
                    <SearchInput
                        value={searchTerm}
                        onChange={onSearchChange}
                        placeholder={t("propertyMediaViewDrawer.searchPlaceholder")}
                        className="mb-0 w-full"
                        inputClassName="h-8 py-0"
                    />
                </div>
            </div>
            <div className="w-full flex justify-end pt-3 pb-1">
                <ClearButton
                    size="xs"
                    onClick={onClear}
                />
            </div>
        </Card>
    );
}



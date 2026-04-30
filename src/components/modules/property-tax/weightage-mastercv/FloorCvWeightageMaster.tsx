"use client";

import React from "react";
import {Select } from "@/components/common/select";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { FloorCvWeightageMasterProps, FloorFactorCVMaster } from "@/types/floor-cv-weightageMaster.types";
import { UpdateButton, ClearButton, SaveButton } from "@/components/common/ActionButtons";
import { ToastContainer } from "@/components/common/Toast";
import { getFloorCvWeightageMasterColumns } from "./floorCvWeightageMasterColumns";
import { FloorCvHeaderExtra } from "./FloorCvHeaderExtra";
import { useFloorCvWeightage } from "@/hooks/useFloorCvWeightage";

// Extend FloorFactorCVMaster to add index signature
type FloorFactorCVMasterWithIndex = FloorFactorCVMaster & Record<string, unknown>;

const FloorCvWeightageMaster: React.FC<FloorCvWeightageMasterProps> = ({
    // NOTE: Do NOT use useEffect in server components. Default selection is handled in useState.
    // If you need to update the URL on first load, do it in the parent server component (page.tsx) during SSR.
    data,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    floorOptions,
    assessmentYearOptions,
}) => {
    const {
        t,
        tW,
        tCommon,
        selectedYear,
        editableRows,
        fromFloor,
        setFromFloor,
        toFloor,
        setToFloor,
        liftStatus,
        setLiftStatus,
        factorValue,
        setFactorValue,
        toasts,
        isUpdating,
        isBulkUpdating,
        isGeneratingAll,
        newRecordsCount,
        hasNewRecords,
        isApplyDisabled,
        isBulkUpdateDisabled,
        liftStatusOptions,
        getRowUid,
        addToast,
        removeToast,
        handleCellChange,
        handleUpdate,
        handleCancel,
        handleApplyFilter,
        handleBulkUpdate,
        handleGenerateAll,
        handleClearAll,
        changePage,
        changePageSize,
        handleAssessmentYearChange,
    } = useFloorCvWeightage({ data, pageNumber, pageSize, totalCount });

    const columns: Column<FloorFactorCVMasterWithIndex>[] = getFloorCvWeightageMasterColumns({
        t,
        tW,
        editableRows,
        handleCellChange,
        getRowUid,
    });

    const renderActions = (row: FloorFactorCVMaster) => {
        const rowUid = getRowUid(row);
        const hasRowChanges = editableRows[rowUid] !== undefined;

        return (
            <div className="flex gap-2">
                {row.id === 0 ? (
                    <SaveButton
                        label={tW("common.buttons.create")}
                        size="sm"
                        onClick={() => handleUpdate(row)}
                        disabled={!hasRowChanges || isUpdating}
                    />
                ) : (
                    <UpdateButton
                        label={tW("common.buttons.update")}
                        size="sm"
                        onClick={() => handleUpdate(row)}
                        disabled={!hasRowChanges || isUpdating}
                    />
                )}
                <ClearButton
                    label={tW("common.buttons.clear")}
                    size="sm"
                    onClick={() => handleCancel(row)}
                    disabled={!hasRowChanges || isUpdating}
                />
            </div>
        );
    };

    return (
        <div className="p-0">
            <ToastContainer toasts={toasts} onClose={removeToast} />

            <MasterTable
                columns={columns as unknown as Column<Record<string, unknown>>[]}
                data={data as unknown as Record<string, unknown>[]}
                height="lg"
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={changePage}
                onPageSizeChange={changePageSize}
                renderActions={renderActions as unknown as (row: Record<string, unknown>) => React.ReactNode}
                actionLabel={t("columns.action")}
                getRowKey={(row) => getRowUid(row as unknown as FloorFactorCVMaster)}
                paginationConfig={{ enabled: true, showPageSizeSelector: false }}

                footerLeftContent={
                    <div className="flex items-center gap-1 text-sm">
                        {tCommon("table.showing")} {totalCount === 0 ? 0 : ((pageNumber || 1) - 1) * (pageSize || 10) + 1} {tCommon("table.to")}
                        <Select
                            options={Array.from(new Set([10, 20, 30, 40, 50, Math.min(totalCount, 100)])).filter(s => s > 0).map(s => ({
                                label: String(s),
                                value: String(s)
                            }))}
                            value={String(pageSize)}
                            onChange={(val) => changePageSize(Number(val))}
                            selectSize="sm"
                        />
                        <span>{totalCount || 0} {tCommon("table.entries")}</span>
                    </div>
                }

                headerExtra={
                    <FloorCvHeaderExtra
                        t={t}
                        tW={tW}
                        assessmentYearOptions={assessmentYearOptions}
                        floorOptions={floorOptions}
                        liftStatusOptions={liftStatusOptions}
                        selectedYear={selectedYear}
                        fromFloor={fromFloor}
                        toFloor={toFloor}
                        liftStatus={liftStatus}
                        factorValue={factorValue}
                        isApplyDisabled={isApplyDisabled}
                        isBulkUpdateDisabled={isBulkUpdateDisabled}
                        isGeneratingAll={isGeneratingAll}
                        isBulkUpdating={isBulkUpdating}
                        isUpdating={isUpdating}
                        hasNewRecords={hasNewRecords}
                        newRecordsCount={newRecordsCount}
                        handleAssessmentYearChange={handleAssessmentYearChange}
                        setFromFloor={setFromFloor}
                        setToFloor={setToFloor}
                        setLiftStatus={setLiftStatus}
                        setFactorValue={setFactorValue}
                        handleApplyFilter={handleApplyFilter}
                        handleClearAll={handleClearAll}
                        handleBulkUpdate={handleBulkUpdate}
                        handleGenerateAll={handleGenerateAll}
                        addToast={addToast}
                    />
                }
            />
        </div>
    );
};

export default FloorCvWeightageMaster;
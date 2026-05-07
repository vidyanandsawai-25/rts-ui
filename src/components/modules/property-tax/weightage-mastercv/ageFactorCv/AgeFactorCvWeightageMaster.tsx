"use client";

import React from "react";
import { MasterTable } from "@/components/common/MasterTable";
import { ToastContainer } from "@/components/common/Toast";
import { SaveButton, UpdateButton, ClearButton } from "@/components/common/ActionButtons";
import { AgeFactorCVMaster } from "@/types/ageFactorCv.types";
import { getAgeFactorCvWeightageMasterColumns } from "./ageFactorCvWeightageMasterColumns";
import { AgeFactorCvHeaderExtra } from "./AgeFactorCvHeaderExtra";
import { useAgeFactorCvWeightage } from "@/hooks/weightageMaster/ageFactorCv/useAgeFactorCvWeightage";
import type { Option } from "@/components/common/select";

interface AgeFactorCvWeightageMasterProps {
    data: AgeFactorCVMaster[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    assessmentYearOptions: Option[];
    constructionTypeOptions: Option[];
    ageRangeOptions: Option[];
    allAgeFactors: AgeFactorCVMaster[];
}

const AgeFactorCvWeightageMaster: React.FC<AgeFactorCvWeightageMasterProps> = ({
    data,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    assessmentYearOptions,
    constructionTypeOptions,
    ageRangeOptions: initialAgeRangeOptions,
    allAgeFactors,
}) => {
    const {
        t,
        tW,
        selectedYear,
        editableRows,
        constructionType,
        selectedAgeRange,
        ageFrom,
        setAgeFrom,
        ageTo,
        setAgeTo,
        ageRangeOptions,
        factorValue,
        setFactorValue,
        isAddYearRangeModalOpen,
        setIsAddYearRangeModalOpen,
        toasts,
        isUpdating,
        isBulkUpdating,
        isGeneratingAll,
        hasNewRecords,
        newRecordsCount,
        canGenerateAll,
        getRowUid,
        removeToast,
        handleCellChange,
        handleUpdate,
        handleCancelRow,
        handleAddAgeRange,
        handleAgeRangeChange,
        handleAssessmentYearChange,
        handleConstructionTypeChange,
        handleApplyFilter,
        handleBulkUpdate,
        handleGenerateAll,
        handleClearAll,
        changePage,
        changePageSize,
    } = useAgeFactorCvWeightage({
        paginationData: {
            data,
            pageNumber,
            pageSize,
            totalCount,
            totalPages,
        },
        options: {
            constructionTypeOptions,
            initialAgeRangeOptions,
        },
        allAgeFactors,
    });

    const columns = getAgeFactorCvWeightageMasterColumns({
        t,
        tW,
        editableRows,
        handleCellChange,
        getRowUid,
    });

    const renderActions = (row: AgeFactorCVMaster) => {
        const rowUid = getRowUid(row);
        const hasRowChanges = editableRows[rowUid] !== undefined;

        return (
            <div className="flex gap-2">
                {row.id === 0 ? (
                    <SaveButton
                        label={tW('common.buttons.create')}
                        size="sm"
                        onClick={() => handleUpdate(row)}
                        disabled={!hasRowChanges || isUpdating || isBulkUpdating}
                    />
                ) : (
                    <UpdateButton
                        label={tW('common.buttons.update')}
                        size="sm"
                        onClick={() => handleUpdate(row)}
                        disabled={!hasRowChanges || isUpdating || isBulkUpdating}
                    />
                )}
                <ClearButton
                    label={tW('common.buttons.clear')}
                    size="sm"
                    onClick={() => handleCancelRow(row)}
                    disabled={!hasRowChanges || isUpdating || isBulkUpdating}
                />
            </div>
        );
    };

    return (
        <div className="w-full">
            <ToastContainer toasts={toasts} onClose={removeToast} />
            <MasterTable<AgeFactorCVMaster>
                columns={columns}
                data={data}
                height="lg"
                pageNumber={pageNumber}
                pageSize={pageSize}
                totalCount={totalCount}
                totalPages={totalPages}
                onPageChange={changePage}
                onPageSizeChange={changePageSize}
                renderActions={renderActions}
                actionLabel={t('columns.action')}
                getRowKey={(row) => getRowUid(row)}
                loading={isUpdating || isBulkUpdating}
                paginationConfig={{ enabled: true, showPageSizeSelector: true }}
                pageSizeOptions={[5, 10, 20, 50]}
                headerExtra={
                    <AgeFactorCvHeaderExtra
                        t={t}
                        tW={tW}
                        assessmentYearOptions={assessmentYearOptions}
                        constructionTypeOptions={constructionTypeOptions}
                        ageRangeOptions={ageRangeOptions}
                        selectedYear={selectedYear}
                        constructionType={constructionType}
                        selectedAgeRange={selectedAgeRange}
                        ageFrom={ageFrom}
                        ageTo={ageTo}
                        factorValue={factorValue}
                        hasNewRecords={hasNewRecords}
                        newRecordsCount={newRecordsCount}
                        canGenerateAll={canGenerateAll}
                        isGeneratingAll={isGeneratingAll}
                        isBulkUpdating={isBulkUpdating}
                        isUpdating={isUpdating}
                        dataLength={data.length}
                        isAddYearRangeModalOpen={isAddYearRangeModalOpen}
                        setIsAddYearRangeModalOpen={setIsAddYearRangeModalOpen}
                        handleAssessmentYearChange={handleAssessmentYearChange}
                        handleConstructionTypeChange={handleConstructionTypeChange}
                        handleAgeRangeChange={handleAgeRangeChange}
                        setAgeFrom={setAgeFrom}
                        setAgeTo={setAgeTo}
                        setFactorValue={setFactorValue}
                        handleAddAgeRange={handleAddAgeRange}
                        handleApplyFilter={handleApplyFilter}
                        handleClearAll={handleClearAll}
                        handleBulkUpdate={handleBulkUpdate}
                        handleGenerateAll={handleGenerateAll}
                        editableRowsCount={Object.keys(editableRows).length}
                    />
                }
            />
        </div>
    );
};

export default AgeFactorCvWeightageMaster;

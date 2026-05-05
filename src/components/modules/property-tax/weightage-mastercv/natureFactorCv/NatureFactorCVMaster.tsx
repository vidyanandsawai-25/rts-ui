"use client";

import React from "react";
import { MasterTable } from "@/components/common/MasterTable";
import { Option } from "@/components/common/select";
import { UpdateButton, CancelButton, SaveButton } from "@/components/common/ActionButtons";
import { ToastContainer } from "@/components/common/Toast";
import { NatureFactorCVMaster as NatureFactorCVMasterType } from "@/types/natureofbuilding-cv-weightageMaster.types";
import { useNatureFactorCv } from "@/hooks/weightageMaster/natureFactorCv/useNatureFactorCv";
import { getNatureFactorCvColumns } from "./natureFactorCvColumns";
import { NatureFactorCvHeaderExtra } from "./NatureFactorCvHeaderExtra";


interface NatureFactorCVMasterProps {
    data: NatureFactorCVMasterType[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    assessmentYearOptions: Option[];
    constructionTypeOptions: Option[];
}

const NatureFactorCVMaster: React.FC<NatureFactorCVMasterProps> = ({
    data,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    assessmentYearOptions,
    constructionTypeOptions,
}) => {
    const {
        t, tW,
        selectedYear, constructionType, factorValue,
        editableRows,
        isUpdating, isBulkUpdating, isGeneratingAll,
        newRecordsCount, hasNewRecords,
        toasts,
        isApplyDisabled, isBulkUpdateDisabled,
        removeToast,
        getRowUid, handleCellChange, handleUpdate, handleCancel,
        handleAssessmentYearChange, handleConstructionTypeChange, setFactorValue,
        handleApplyFilter, handleBulkUpdate, handleGenerateAll, handleClearAll,
        changePage, changePageSize
    } = useNatureFactorCv({ data, pageSize });

    const columns = getNatureFactorCvColumns({
        t, tW, editableRows, getRowUid, handleCellChange
    });

    const renderActions = (row: NatureFactorCVMasterType) => {
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
                <CancelButton
                    size="sm"
                    onClick={() => handleCancel(row)}
                    disabled={!hasRowChanges || isUpdating || isBulkUpdating}
                />
            </div>
        );
    };

    return (
        <div className="p-0">
            <ToastContainer toasts={toasts} onClose={removeToast} />
            <MasterTable<NatureFactorCVMasterType>
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
                paginationConfig={{ enabled: true, showPageSizeSelector: true }}
                pageSizeOptions={[5, 10, 20, 50]}
                emptyText={t('messages.noRecordsFound')}
                loading={isUpdating || isBulkUpdating}
                headerExtra={
                    <NatureFactorCvHeaderExtra
                        t={t}
                        tW={tW}
                        assessmentYearOptions={assessmentYearOptions}
                        constructionTypeOptions={constructionTypeOptions}
                        selectedYear={selectedYear}
                        constructionType={constructionType}
                        factorValue={factorValue}
                        setFactorValue={setFactorValue}
                        handleAssessmentYearChange={handleAssessmentYearChange}
                        handleConstructionTypeChange={handleConstructionTypeChange}
                        handleGenerateAll={handleGenerateAll}
                        handleApplyFilter={handleApplyFilter}
                        handleClearAll={handleClearAll}
                        handleBulkUpdate={handleBulkUpdate}
                        hasNewRecords={hasNewRecords}
                        newRecordsCount={newRecordsCount}
                        isGeneratingAll={isGeneratingAll}
                        isBulkUpdating={isBulkUpdating}
                        isUpdating={isUpdating}
                        isApplyDisabled={isApplyDisabled}
                        isBulkUpdateDisabled={isBulkUpdateDisabled}
                    />
                }
            />
        </div>
    );
};

export default NatureFactorCVMaster;
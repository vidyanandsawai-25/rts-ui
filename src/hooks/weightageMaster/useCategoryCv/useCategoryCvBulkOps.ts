"use client";

import { UseFactorCVMaster, UseFactorCVMasterCreate, UseFactorCVMasterUpdate } from "@/types/useCategoryCvFactor.types";
import { bulkCreateUseFactorCVMasterAction, bulkUpdateUseFactorCVMasterAction } from "@/app/[locale]/property-tax/weightage-master/sub-type-weightage/action";

interface UseCategoryCvBulkOpsProps {
    data: UseFactorCVMaster[];
    editableRows: Record<string, UseFactorCVMaster>;
    setEditableRows: React.Dispatch<React.SetStateAction<Record<string, UseFactorCVMaster>>>;
    setIsBulkUpdating: (val: boolean) => void;
    setIsGeneratingAll: (val: boolean) => void;
    factorValue: string;
    getRowUid: (row: UseFactorCVMaster) => string;
    findRowByUid: (uid: string) => UseFactorCVMaster | undefined;
    addToast: (type: "success" | "error" | "info" | "warning", message: string) => void;
    refreshPage: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tW: (key: string, values?: Record<string, any>) => string;
}

export function useCategoryCvBulkOps({
    data,
    editableRows,
    setEditableRows,
    setIsBulkUpdating,
    setIsGeneratingAll,
    factorValue,
    getRowUid,
    findRowByUid,
    addToast,
    refreshPage,
    tW,
}: UseCategoryCvBulkOpsProps) {

    const handleApplyFilter = () => {
        const factor = parseFloat(factorValue);
        if (!factorValue || isNaN(factor) || factor < 0) {
            addToast('warning', tW('common.messages.validFactorRequired'));
            return;
        }

        const updatedRows: Record<string, UseFactorCVMaster> = {};
        let updatedCount = 0;

        data.forEach((row) => {
            const rowUid = getRowUid(row);
            const existingEdit = editableRows[rowUid];
            const baseRow = { ...row, ...(existingEdit || {}) };
            
            // Only update if factor actually changed
            if (baseRow.factor !== factor) {
                updatedRows[rowUid] = {
                    ...baseRow,
                    factor: factor,
                };
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            setEditableRows(prev => ({ ...prev, ...updatedRows }));
            addToast('success', tW('common.messages.factorApplied', { factor, count: updatedCount }));
        } else {
            addToast('warning', tW('common.messages.noRecordsMatch'));
        }
    };

    const handleBulkUpdate = async () => {
        const updatedRecords = Object.entries(editableRows);

        if (updatedRecords.length === 0) {
            addToast('warning', tW('common.messages.noRecordsToUpdate'));
            return;
        }

        setIsBulkUpdating(true);

        const createPayloadVars: Array<Omit<UseFactorCVMasterCreate, 'createdBy'>> = [];
        const updatePayloadVars: Array<{ id: number; data: Omit<UseFactorCVMasterUpdate, 'updatedBy'> }> = [];
        let errorCount = 0;

        for (const [rowUid, updatedData] of updatedRecords) {
            const originalRow = findRowByUid(rowUid);
            if (!originalRow) { errorCount++; continue; }

            const newFactor = updatedData.factor ?? originalRow.factor;
            const hasChanges = originalRow.factor !== newFactor;

            if (hasChanges) {
                if (originalRow.id === 0) {
                    createPayloadVars.push({
                        isActive: originalRow.isActive,
                        typeOfUseId: originalRow.typeOfUseId,
                        subTypeOfUseId: originalRow.subTypeOfUseId,
                        factor: newFactor,
                        yearRangeCVId: originalRow.yearRangeCVId
                    });
                } else {
                    updatePayloadVars.push({
                        id: originalRow.id,
                        data: {
                            isActive: originalRow.isActive,
                            typeOfUseId: originalRow.typeOfUseId,
                            subTypeOfUseId: originalRow.subTypeOfUseId,
                            factor: newFactor,
                            yearRangeCVId: originalRow.yearRangeCVId
                        }
                    });
                }
            }
        }

        try {
            let createdCount = 0;
            let updatedCount = 0;

            if (createPayloadVars.length > 0) {
                const result = await bulkCreateUseFactorCVMasterAction(createPayloadVars);
                if (result && result.success) {
                    createdCount = createPayloadVars.length;
                } else {
                    errorCount += createPayloadVars.length;
                }
            }

            if (updatePayloadVars.length > 0) {
                const result = await bulkUpdateUseFactorCVMasterAction(updatePayloadVars);
                if (result && result.success) {
                    updatedCount = updatePayloadVars.length;
                } else {
                    errorCount += updatePayloadVars.length;
                }
            }

            const totalSuccess = createdCount + updatedCount;

            if (totalSuccess > 0 && errorCount === 0) {
                const parts: string[] = [];
                if (createdCount > 0) parts.push(`${createdCount} ${tW('common.messages.created')}`);
                if (updatedCount > 0) parts.push(`${updatedCount} ${tW('common.messages.updated')}`);
                addToast('success', tW('common.messages.bulkOperationSuccess', { message: parts.join(', ') }));
                setEditableRows({});
                setTimeout(() => refreshPage(), 1500);
            } else if (totalSuccess > 0 && errorCount > 0) {
                const parts: string[] = [];
                if (createdCount > 0) parts.push(`${createdCount} ${tW('common.messages.created')}`);
                if (updatedCount > 0) parts.push(`${updatedCount} ${tW('common.messages.updated')}`);
                parts.push(`${errorCount} ${tW('common.messages.failed')}`);
                addToast('warning', tW('common.messages.bulkOperationPartialSuccess', { message: parts.join(', ') }));
            } else if (errorCount > 0) {
                addToast('error', tW('common.messages.bulkOperationFailed'));
            } else {
                addToast('info', tW('common.messages.noChangesDetectedBulk'));
            }
        } catch (_error) {
            addToast('error', tW('common.messages.bulkActionFailed'));
        } finally {
            setIsBulkUpdating(false);
        }
    };

    const handleGenerateAll = async () => {
        const newRecords = data.filter(row => row.id === 0);
        if (newRecords.length === 0) return;

        setIsGeneratingAll(true);
        try {
            const payload: Array<Omit<UseFactorCVMasterCreate, 'createdBy'>> = newRecords.map(row => {
                const rowUid = getRowUid(row);
                const editableRow = editableRows[rowUid];
                // Use user's inline edits if available, otherwise fallback to server values
                const factorToSave = editableRow?.factor ?? row.factor;
                const isActiveToSave = editableRow?.isActive ?? row.isActive;
                
                return {
                    isActive: isActiveToSave,
                    typeOfUseId: row.typeOfUseId,
                    subTypeOfUseId: row.subTypeOfUseId,
                    factor: factorToSave,
                    yearRangeCVId: row.yearRangeCVId
                };
            });

            const result = await bulkCreateUseFactorCVMasterAction(payload);

            if (result && result.success) {
                addToast('success', tW('common.messages.recordsGeneratedSuccess', { count: newRecords.length }));
                setEditableRows({}); // Clear edits after successful generation
                setTimeout(() => refreshPage(), 1500);
            } else {
                addToast('error', result?.message || tW('common.messages.generationFailed'));
            }
        } catch (_error) {
            addToast('error', tW('common.messages.generateAllFailed'));
        } finally {
            setIsGeneratingAll(false);
        }
    };

    return {
        handleApplyFilter,
        handleBulkUpdate,
        handleGenerateAll,
    };
}

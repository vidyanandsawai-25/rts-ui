"use client";
 
import { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { FloorFactorCVMaster, FloorFactorCVBulkCreateItem, FloorFactorCVBulkUpdateItem } from "@/types/floor-cv-weightageMaster.types";
import {
    bulkCreateFloorFactorCVMasterAction,
    bulkUpdateFloorFactorCVMasterAction,
} from "@/app/[locale]/property-tax/weightage-master/action";
 
export interface UseFloorCvBulkOpsParams {
    data: FloorFactorCVMaster[];
    editableRows: Record<string, FloorFactorCVMaster>;
    setEditableRows: Dispatch<SetStateAction<Record<string, FloorFactorCVMaster>>>;
    setIsBulkUpdating: Dispatch<SetStateAction<boolean>>;
    setIsGeneratingAll: Dispatch<SetStateAction<boolean>>;
    selectedYear: string;
    fromFloor: string;
    toFloor: string;
    liftStatus: string;
    factorValue: string;
    getRowUid: (row: FloorFactorCVMaster) => string;
    findRowByUid: (uid: string) => FloorFactorCVMaster | undefined;
    addToast: (type: "success" | "error" | "info" | "warning", message: string) => void;
    refreshPage: () => void;
    clearFilters: () => void;
}
 
export function useFloorCvBulkOps({
    data,
    editableRows,
    setEditableRows,
    setIsBulkUpdating,
    setIsGeneratingAll,
    selectedYear,
    fromFloor,
    toFloor,
    liftStatus,
    factorValue,
    getRowUid,
    findRowByUid,
    addToast,
    refreshPage,
    clearFilters,
}: UseFloorCvBulkOpsParams) {
    const t = useTranslations("floorFactorMaster");
    const tW = useTranslations("weightageMaster");
 
    // Handle filter apply with bulk factor update
    const handleApplyFilter = () => {
        // Apply bulk factor changes to filtered records
        
        // Validate assessment year is selected first
        if (!selectedYear) {
            addToast("error", tW("common.messages.assessmentYearRequired"));
            return;
        }
        
        const factor = parseFloat(factorValue);
        
        // Prevent negative factors
        if (factor < 0) {
            addToast("error", tW("common.messages.negativeFactorsNotAllowed"));
            return;
        }
        
        if (!factorValue || isNaN(factor) || factor === 0) {
            addToast("warning", tW("common.messages.validFactorRequired"));
            return;
        }
        
        // Validation for From/To floor selection
        if (fromFloor && toFloor && parseInt(fromFloor) > parseInt(toFloor)) {
            addToast("error", t("messages.fromFloorGreaterError"));
            return;
        }
        const updatedRows: Record<string, FloorFactorCVMaster> = {};
        let updatedCount = 0;
        data.forEach((row) => {
            const rowUid = getRowUid(row);
            const isInRange =
                (!fromFloor || row.floorId >= parseInt(fromFloor)) &&
                (!toFloor || row.floorId <= parseInt(toFloor));
            if (isInRange) {
                const existingEdit = editableRows[rowUid];
                const baseRow = {
                    ...row,
                    ...(existingEdit || {}),
                };
                // Only allow positive values for factors
                if (liftStatus === "both") {
                    updatedRows[rowUid] = {
                        ...baseRow,
                        factorWithLift: factor >= 0 ? factor : baseRow.factorWithLift,
                        factorWithoutLift: factor >= 0 ? factor : baseRow.factorWithoutLift,
                    };
                } else if (liftStatus === "withLift") {
                    updatedRows[rowUid] = {
                        ...baseRow,
                        factorWithLift: factor >= 0 ? factor : baseRow.factorWithLift,
                    };
                } else if (liftStatus === "withoutLift") {
                    updatedRows[rowUid] = {
                        ...baseRow,
                        factorWithoutLift: factor >= 0 ? factor : baseRow.factorWithoutLift,
                    };
                }
                updatedCount++;
            }
        });
        if (updatedCount > 0) {
            setEditableRows((prev) => {
                const merged = { ...prev, ...updatedRows };
                return merged;
            });
            addToast("success", tW("common.messages.factorApplied", { factor, count: updatedCount }));
        } else {
            addToast("warning", tW("common.messages.noRecordsMatch"));
        }
    };
 
    // Handle bulk update from header
    const handleBulkUpdate = async () => {
        const updatedRecords = Object.entries(editableRows);
 
        if (updatedRecords.length === 0) {
            addToast("warning", tW("common.messages.noRecordsToUpdate"));
            return;
        }
 
        setIsBulkUpdating(true);
 
        const createPayloadVars: FloorFactorCVBulkCreateItem[] = [];
        const updatePayloadVars: FloorFactorCVBulkUpdateItem[] = [];
        let errorCount = 0;
 
        for (const [rowUid, updatedData] of updatedRecords) {
            const originalRow = findRowByUid(rowUid);
            if (!originalRow) {
                errorCount++;
                continue;
            }
 
            const newFactorWithLift = updatedData.factorWithLift ?? originalRow.factorWithLift;
            const newFactorWithoutLift = updatedData.factorWithoutLift ?? originalRow.factorWithoutLift;
 
            const hasChanges =
                originalRow.factorWithLift !== newFactorWithLift ||
                originalRow.factorWithoutLift !== newFactorWithoutLift;
 
            if (hasChanges) {
                if (originalRow.id === 0) {
                    createPayloadVars.push({
                        isActive: originalRow.isActive,
                        createdBy: 1, // TODO: Get from auth context
                        floorId: originalRow.floorId,
                        factorWithLift: newFactorWithLift,
                        factorWithoutLift: newFactorWithoutLift,
                        yearRangeCVId: originalRow.yearRangeCVID ?? originalRow.yearRangeCVId ?? 0,
                    });
                } else {
                    updatePayloadVars.push({
                        id: originalRow.id,
                        data: {
                            isActive: originalRow.isActive,
                            updatedBy: 1, // TODO: Get from auth context
                            floorId: originalRow.floorId,
                            factorWithLift: newFactorWithLift,
                            factorWithoutLift: newFactorWithoutLift,
                            yearRangeCVId: originalRow.yearRangeCVID ?? originalRow.yearRangeCVId ?? 0,
                        }
                    });
                }
            }
        }
 
        try {
            let createdCount = 0;
            let updatedCount = 0;
 
            if (createPayloadVars.length > 0) {
                const result = await bulkCreateFloorFactorCVMasterAction(createPayloadVars);
                if (result && result.success) {
                    createdCount = createPayloadVars.length;
                } else {
                    errorCount += createPayloadVars.length;
                    console.error("Bulk create failed:", result?.message);
                }
            }
 
            if (updatePayloadVars.length > 0) {
                const result = await bulkUpdateFloorFactorCVMasterAction(updatePayloadVars);
                if (result && result.success) {
                    updatedCount = updatePayloadVars.length;
                } else {
                    errorCount += updatePayloadVars.length;
                    console.error("Bulk update failed:", result?.message);
                }
            }
 
            const totalSuccess = createdCount + updatedCount;
 
            if (totalSuccess > 0 && errorCount === 0) {
                const successMsg = [];
                if (createdCount > 0) successMsg.push(`${createdCount} ${tW("common.messages.created")}`);
                if (updatedCount > 0) successMsg.push(`${updatedCount} ${tW("common.messages.updated")}`);
                addToast("success", tW("common.messages.bulkOperationSuccess", { message: successMsg.join(", ") }));
                setEditableRows({});
                // Clear filters after successful bulk update
                clearFilters();
                setTimeout(() => { refreshPage(); }, 1500);
            } else if (totalSuccess > 0 && errorCount > 0) {
                const successMsg = [];
                if (createdCount > 0) successMsg.push(`${createdCount} ${tW("common.messages.created")}`);
                if (updatedCount > 0) successMsg.push(`${updatedCount} ${tW("common.messages.updated")}`);
                successMsg.push(`${errorCount} ${tW("common.messages.failed")}`);
                addToast("warning", tW("common.messages.bulkOperationPartialSuccess", { message: successMsg.join(", ") }));
                setEditableRows({});
                // Clear filters after partial success
                clearFilters();
                setTimeout(() => { refreshPage(); }, 1500);
            } else if (errorCount > 0) {
                addToast("error", tW("common.messages.bulkOperationFailed"));
            } else {
                addToast("info", tW("common.messages.noChangesDetectedBulk"));
            }
        } catch (error) {
            console.error("Bulk update/create failed:", error);
            addToast("error", tW("common.messages.bulkActionFailed"));
        } finally {
            setIsBulkUpdating(false);
        }
    };
 
    // Handle Generate All uncreated records
    const handleGenerateAll = async () => {
        const newRecords = data.filter((row) => row.id === 0);
        if (newRecords.length === 0) return;
 
        setIsGeneratingAll(true);
        try {
            const payload: FloorFactorCVBulkCreateItem[] = newRecords.map((row) => {
                const rowUid = getRowUid(row);
                const editedRow = editableRows[rowUid];
                
                return {
                    isActive: row.isActive,
                    createdBy: 1, // TODO: Get from auth context
                    floorId: row.floorId,
                    factorWithLift: editedRow?.factorWithLift ?? row.factorWithLift,
                    factorWithoutLift: editedRow?.factorWithoutLift ?? row.factorWithoutLift,
                    yearRangeCVId: row.yearRangeCVID ?? row.yearRangeCVId ?? 0,
                };
            });

            const result = await bulkCreateFloorFactorCVMasterAction(payload);

            if (result && result.success) {
                addToast("success", tW("common.messages.recordsGeneratedSuccess", { count: newRecords.length }));
                setTimeout(() => { refreshPage(); }, 1500);
            } else {
                addToast("error", result?.message || tW("common.messages.generationFailed"));
            }
        } catch (error) {
            console.error("Generate All failed:", error);
            addToast("error", tW("common.messages.generateAllFailed"));
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

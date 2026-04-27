"use client";

import { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { FloorFactorCVMaster } from "@/types/weightageMaster.types";
import {
    updateFloorFactorCVMasterAction,
    createFloorFactorCVMasterAction,
} from "@/app/[locale]/property-tax/weightage-master/action";

export interface UseFloorCvRowOpsParams {
    data: FloorFactorCVMaster[];
    editableRows: Record<string, FloorFactorCVMaster>;
    setEditableRows: Dispatch<SetStateAction<Record<string, FloorFactorCVMaster>>>;
    setIsUpdating: Dispatch<SetStateAction<boolean>>;
    getRowUid: (row: FloorFactorCVMaster) => string;
    findRowByUid: (uid: string) => FloorFactorCVMaster | undefined;
    addToast: (type: "success" | "error" | "info" | "warning", message: string) => void;
    refreshPage: () => void;
}

export function useFloorCvRowOps({
    editableRows,
    setEditableRows,
    setIsUpdating,
    getRowUid,
    findRowByUid,
    addToast,
    refreshPage,
}: UseFloorCvRowOpsParams) {
    const tW = useTranslations("weightageMaster");

    const handleCellChange = (rowId: string, columnId: string, value: string | number) => {
        const numValue = typeof value === "string" ? (value === "" ? 0 : parseFloat(value)) : value;

        // Prevent negative values
        if (numValue < 0) {
            addToast("error", tW("common.messages.negativeValuesNotAllowed"));
            return;
        }
        // Prevent values greater than 999999
        if (numValue > 999999) {
            addToast("error", tW("common.messages.valueExceedsMax"));
            return;
        }
        setEditableRows((prev) => {
            const originalRow = findRowByUid(rowId);
            if (!originalRow) {
                return prev;
            }
            const existingEdit = prev[rowId];
            // Only allow positive values for factors
            const updatedRow: FloorFactorCVMaster = {
                ...originalRow,
                ...(existingEdit || {}),
                [columnId]: !isNaN(numValue) && numValue >= 0 ? numValue : (originalRow as unknown as Record<string, unknown>)[columnId],
            } as FloorFactorCVMaster;

            const updated = {
                ...prev,
                [rowId]: updatedRow,
            };

            return updated;
        });
    };

    const handleUpdate = async (row: FloorFactorCVMaster) => {
        const rowUid = getRowUid(row);

        const updatedData = editableRows[rowUid];
        if (!updatedData) {
            addToast("warning", tW("common.messages.noChangesToUpdate"));
            return;
        }

        const hasChanges =
            updatedData.factorWithLift !== row.factorWithLift ||
            updatedData.factorWithoutLift !== row.factorWithoutLift;

        if (!hasChanges) {
            addToast("warning", tW("common.messages.noChangesDetected"));
            return;
        }

        setIsUpdating(true);
        try {
            let result;
            // Check if floorFactorId is 0 - call create, otherwise call update
            if (row.floorFactorId === 0) {
                // Prepare CREATE payload
                const createPayload = {
                    isActive: row.isActive,
                    createdBy: 1,
                    floorId: row.floorId,
                    factorWithLift: updatedData.factorWithLift ?? row.factorWithLift,
                    factorWithoutLift: updatedData.factorWithoutLift ?? row.factorWithoutLift,
                    yearRangeCVId: row.yearRangeCVID ?? row.yearRangeCVId ?? 0,
                };
                result = await createFloorFactorCVMasterAction(createPayload);
            } else {
                // Prepare UPDATE payload
                const updatePayload = {
                    isActive: row.isActive,
                    updatedBy: 1,
                    floorId: row.floorId,
                    factorWithLift: updatedData.factorWithLift ?? row.factorWithLift,
                    factorWithoutLift: updatedData.factorWithoutLift ?? row.factorWithoutLift,
                    yearRangeCVId: row.yearRangeCVID ?? row.yearRangeCVId ?? 0,
                };
                result = await updateFloorFactorCVMasterAction(row.floorFactorId, updatePayload);
            }

            if (result.success) {
                if (row.floorFactorId === 0) {
                    addToast("success", tW("common.messages.recordCreatedSuccess"));
                } else {
                    addToast("success", tW("common.messages.recordUpdatedSuccess"));
                }
                // After successful update, remove from editable rows using UID
                setEditableRows((prev) => {
                    const updated = { ...prev };
                    delete updated[rowUid];
                    return updated;
                });
                // Refresh route data after a short delay without forcing a full page reload
                setTimeout(() => {
                    refreshPage();
                }, 1000);
            } else {
                addToast("error", result.message || (row.floorFactorId === 0 ? tW("common.messages.createFailed") : tW("common.messages.updateFailed")));
            }
        } catch (error) {
            console.error("Single row update failed:", error);
            addToast("error", tW("common.messages.failedToSaveRow"));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = (row: FloorFactorCVMaster) => {
        const rowUid = getRowUid(row);
        setEditableRows((prev) => {
            const updated = { ...prev };
            delete updated[rowUid];
            return updated;
        });
        addToast("info", tW("common.messages.changesDiscarded"));
    };

    return {
        handleCellChange,
        handleUpdate,
        handleCancel,
    };
}

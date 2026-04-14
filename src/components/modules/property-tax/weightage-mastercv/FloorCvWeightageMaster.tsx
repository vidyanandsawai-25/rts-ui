"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { MatrixCellInput } from "@/components/common/MatrixCellInput";
import { Select, Option } from "@/components/common/select";
import { Input } from "@/components/common/Input";
import { FloorFactorCVMaster } from "@/types/weightageMaster.types";
import { CancelButton } from "@/components/common";
import { ApplyButton, ClearButton, UpdateButton, AddButton, SaveButton } from "@/components/common/ActionButtons";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
    updateFloorFactorCVMasterAction,
    createFloorFactorCVMasterAction,
    bulkCreateFloorFactorCVMasterAction,
    bulkUpdateFloorFactorCVMasterAction
} from "@/app/[locale]/property-tax/weightage-master/action";
import { ToastContainer } from "@/components/common/Toast";

// Extend FloorFactorCVMaster to add index signature
type FloorFactorCVMasterWithIndex = FloorFactorCVMaster & Record<string, unknown>;

interface FloorCvWeightageMasterProps {
    data: FloorFactorCVMaster[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    floorOptions: Option[]; // Already added floorOptions prop
    assessmentYearOptions: Option[]; // Added assessmentYearOptions prop
}

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
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();
    const tCommon = useTranslations("common");
    const t = useTranslations('floorFactorMaster');
    const tW = useTranslations('weightageMaster');

    // Default to no assessment year selected
    const currentSelectedYear = searchParams.get("selectedYearRange") || "";
    const [selectedYear, setSelectedYear] = useState<string>(currentSelectedYear);
    const [editableRows, setEditableRows] = useState<Record<string, FloorFactorCVMaster>>({});

    // Filter states
    const [fromFloor, setFromFloor] = useState<string>("");
    const [toFloor, setToFloor] = useState<string>("");
    const [liftStatus, setLiftStatus] = useState<string>("both");
    const [factorValue, setFactorValue] = useState<string>("0.00");

    // Toast state
    const [toasts, setToasts] = useState<Array<{ id: string, type: 'success' | 'error' | 'info' | 'warning', message: string }>>([]);

    // Helper function to generate unique row identifier
    // Uses floorFactorId-floorId-yearRangeCVID-fromYear-toYear combination to ensure uniqueness
    // This is critical for rows with floorFactorId === 0 (new records) and handles undefined yearRangeCVID
    const getRowUid = (row: FloorFactorCVMaster): string => {
        return `${row.floorFactorId}-${row.floorId}-${row.yearRangeCVID || 'noYear'}-${row.fromYear}-${row.toYear}`;
    };

    // Helper function to find row by UID
    const findRowByUid = (uid: string): FloorFactorCVMaster | undefined => {
        return data.find(row => getRowUid(row) === uid);
    };

    // Loading states
    const [isUpdating, setIsUpdating] = useState(false);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);

    const newRecordsCount = data.filter(row => row.floorFactorId === 0).length;
    const hasNewRecords = newRecordsCount > 0;

    const currentSearchTerm = searchParams.get("q") || "";

    // Toast functions
    const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, message }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const hasShownWarningRef = useRef(false);

    useEffect(() => {
        if (hasNewRecords && !hasShownWarningRef.current) {
            addToast('warning', tW('common.messages.pendingRecordsWarning'));
            hasShownWarningRef.current = true;
        } else if (!hasNewRecords) {
            hasShownWarningRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasNewRecords, t]);

    /* ================= URL BUILDER ================= */
    // const buildUrl = React.useCallback(
    //     (page: number, size: number, searchTerm?: string) => {
    //         const params = new URLSearchParams();
    //         params.set("page", String(page));
    //         params.set("pageSize", String(size));
    //         if (searchTerm) {
    //             params.set("q", searchTerm);
    //         }
    //         return `/${locale}/property-tax/weightage-master?${params.toString()}`;
    //     },
    //     [locale]
    // );

    const handleCellChange = (rowId: string, columnId: string, value: string | number) => {
        const numValue = typeof value === 'string' ? (value === "" ? 0 : parseFloat(value)) : value;

        console.log('=== handleCellChange called ===');
        console.log('Row UID:', rowId, 'Column:', columnId, 'Value:', numValue);

        // Prevent negative values
        if (numValue < 0) {
            addToast('error', tW('common.messages.negativeValuesNotAllowed'));
            return;
        }
        // Prevent values greater than 999999
        if (numValue > 999999) {
            addToast('error', tW('common.messages.valueExceedsMax'));
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
            console.log('Updated editableRows:', updated);
            return updated;
        });
    };

    const handleUpdate = async (row: FloorFactorCVMaster) => {
        console.log('=== handleUpdate called ===');
        const rowUid = getRowUid(row);
        console.log('Row UID:', rowUid);
        console.log('All editableRows:', editableRows);
        console.log('Original row:', row);

        const updatedData = editableRows[rowUid];
        console.log('Updated data from editableRows:', updatedData);

        if (!updatedData) {
            console.log('No updatedData found - returning');
            addToast('warning', tW('common.messages.noChangesToUpdate'));
            return;
        }

        // Check if there are actual changes
        console.log('Comparing changes:');
        console.log('  factorWithLift:', updatedData.factorWithLift, 'vs', row.factorWithLift);
        console.log('  factorWithoutLift:', updatedData.factorWithoutLift, 'vs', row.factorWithoutLift);

        const hasChanges =
            updatedData.factorWithLift !== row.factorWithLift ||
            updatedData.factorWithoutLift !== row.factorWithoutLift;

        console.log('Has changes:', hasChanges);

        if (!hasChanges) {
            console.log('No changes detected - returning');
            addToast('warning', tW('common.messages.noChangesDetected'));
            return;
        }

        setIsUpdating(true);
        try {
            console.log('floorFactorId:', row.floorFactorId);

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
                    yearRangeCVId: row.yearRangeCVID ?? row.yearRangeCVId ?? 0
                };
                console.log('=== Calling CREATE action (floorFactorId is 0) ===', createPayload);
                result = await createFloorFactorCVMasterAction(createPayload);
            } else {
                // Prepare UPDATE payload
                const updatePayload = {
                    isActive: row.isActive,
                    updatedBy: 1,
                    floorId: row.floorId,
                    factorWithLift: updatedData.factorWithLift ?? row.factorWithLift,
                    factorWithoutLift: updatedData.factorWithoutLift ?? row.factorWithoutLift,
                    yearRangeCVId: row.yearRangeCVID ?? row.yearRangeCVId ?? 0
                };
                console.log('=== Calling UPDATE action (floorFactorId is not 0) ===', updatePayload);
                result = await updateFloorFactorCVMasterAction(row.floorFactorId, updatePayload);
            }
            console.log('=== API result ===', result);

            if (result.success) {
                if (row.floorFactorId === 0) {
                    addToast('success', tW('common.messages.recordCreatedSuccess'));
                } else {
                    addToast('success', tW('common.messages.recordUpdatedSuccess'));
                }
                // After successful update, remove from editable rows using UID
                setEditableRows((prev) => {
                    const updated = { ...prev };
                    delete updated[rowUid];
                    return updated;
                });
                // Refresh the page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                addToast('error', result.message || (row.floorFactorId === 0 ? tW('common.messages.createFailed') : tW('common.messages.updateFailed')));
            }
        } catch (error) {
            console.error('Single row update failed:', error);
            addToast('error', tW('common.messages.failedToSaveRow'));
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
        addToast('info', tW('common.messages.changesDiscarded'));
    };

    const columns: Column<FloorFactorCVMasterWithIndex>[] = [
        {
            key: "floorCode",
            label: t('columns.floorCode'),
            width: "10%",
            render: (value) => String(value || "-"),
        },
        {
            key: "floorDescription",
            label: t('columns.description'),
            width: "14%",
            render: (value) => String(value || "-"),
        },
        {
            key: "factorWithLift",
            label: t('columns.factorWithLift'),
            width: "14%",
            render: (value, row) => {
                const rowUid = getRowUid(row);
                const editableValue = editableRows[rowUid]?.factorWithLift ?? (value as number);
                return (
                    <MatrixCellInput className="lg:w-26"
                        value={editableValue}
                        rowId={rowUid}
                        columnId="factorWithLift"
                        onCellChange={handleCellChange}
                    />
                );
            },
        },
        {
            key: "factorWithoutLift",
            label: t('columns.factorWithoutLift'),
            width: "14%",
            render: (value, row) => {
                const rowUid = getRowUid(row);
                const editableValue = editableRows[rowUid]?.factorWithoutLift ?? (value as number);
                return (
                    <MatrixCellInput className="lg:w-26"
                        value={editableValue}
                        rowId={rowUid}
                        columnId="factorWithoutLift"
                        onCellChange={handleCellChange}
                    />
                );
            },
        },
        {
            key: "fromYear",
            label: t('columns.assessmentYear'),
            width: "14%",
            render: (_value, row) => `${row.fromYear}-${row.toYear}`,
        },
        {
            key: "isActive",
            label: t('columns.status'),
            width: "14%",
            isStatus: true,
            render: (value, row) => {
                if (row.floorFactorId === 0) {
                    return <StatusBadge variant="pending" />;
                }
                return (
                    <StatusBadge
                        variant="status"
                        value={value as boolean}
                        activeLabel={tW('common.labels.active')}
                        inactiveLabel={tW('common.labels.inactive')}
                    />
                );
            },
        },
    ];

    const renderActions = (row: FloorFactorCVMaster) => {
        const rowUid = getRowUid(row);
        const hasRowChanges = editableRows[rowUid] !== undefined;

        return (
            <div className="flex gap-2">
                {row.floorFactorId === 0 ? (
                    <SaveButton
                        label={tW('common.buttons.create')}
                        size="sm"
                        onClick={() => handleUpdate(row)}
                        disabled={!hasRowChanges || isUpdating}
                    />
                ) : (
                    <UpdateButton
                        label={tW('common.buttons.update')}
                        size="sm"
                        onClick={() => handleUpdate(row)}
                        disabled={!hasRowChanges || isUpdating}
                    />
                )}
                <ClearButton
                    label={tW('common.buttons.clear')}
                    size="sm"
                    onClick={() => handleCancel(row)}
                    disabled={!hasRowChanges || isUpdating}
                />
            </div>
        );
    };

    // Lift status options
    const liftStatusOptions: Option[] = [
        { label: t('liftStatusOptions.both'), value: "both" },
        { label: t('liftStatusOptions.withLift'), value: "withLift" },
        { label: t('liftStatusOptions.withoutLift'), value: "withoutLift" },
    ];

    // Handle filter apply with bulk factor update
    const handleApplyFilter = () => {
        console.log('=== handleApplyFilter called ===');
        console.log('Filters:', { fromFloor, toFloor, liftStatus, factorValue, selectedYear });
        console.log('Current editableRows before apply:', editableRows);

        // Apply bulk factor changes to filtered records
        const factor = parseFloat(factorValue);
        if (!factorValue || isNaN(factor) || factor <= 0) {
            addToast('warning', tW('common.messages.validFactorRequired'));
            return;
        }
        // Prevent negative factors
        if (factor < 0) {
            addToast('error', tW('common.messages.negativeFactorsNotAllowed'));
            return;
        }
        // Validation for From/To floor selection
        if (fromFloor && toFloor && parseInt(fromFloor) > parseInt(toFloor)) {
            addToast('error', tW('common.messages.fromFloorGreaterError'));
            return;
        }
        const updatedRows: Record<string, FloorFactorCVMaster> = {};
        let updatedCount = 0;
        console.log('Processing data rows:', data.length);
        data.forEach((row) => {
            const rowUid = getRowUid(row);
            const isInRange = (!fromFloor || row.floorId >= parseInt(fromFloor)) &&
                (!toFloor || row.floorId <= parseInt(toFloor));
            if (isInRange) {
                const existingEdit = editableRows[rowUid];
                const baseRow = {
                    ...row,
                    ...(existingEdit || {})
                };
                // Only allow positive values for factors
                if (liftStatus === 'both') {
                    updatedRows[rowUid] = {
                        ...baseRow,
                        factorWithLift: factor >= 0 ? factor : baseRow.factorWithLift,
                        factorWithoutLift: factor >= 0 ? factor : baseRow.factorWithoutLift,
                    };
                } else if (liftStatus === 'withLift') {
                    updatedRows[rowUid] = {
                        ...baseRow,
                        factorWithLift: factor >= 0 ? factor : baseRow.factorWithLift,
                    };
                } else if (liftStatus === 'withoutLift') {
                    updatedRows[rowUid] = {
                        ...baseRow,
                        factorWithoutLift: factor >= 0 ? factor : baseRow.factorWithoutLift,
                    };
                }
                updatedCount++;
            }
        });
        console.log('Updated rows created:', updatedCount);
        console.log('Updated rows object:', updatedRows);
        if (updatedCount > 0) {
            setEditableRows(prev => {
                const merged = { ...prev, ...updatedRows };
                console.log('Final editableRows after merge:', merged);
                return merged;
            });
            addToast('success', tW('common.messages.factorApplied', { factor, count: updatedCount }));
        } else {
            addToast('warning', tW('common.messages.noRecordsMatch'));
        }
    };


    // Handle bulk update from header
    const handleBulkUpdate = async () => {
        console.log('=== handleBulkUpdate called ===');
        const updatedRecords = Object.entries(editableRows);

        if (updatedRecords.length === 0) {
            addToast('warning', tW('common.messages.noRecordsToUpdate'));
            return;
        }

        setIsBulkUpdating(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createPayloadVars: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatePayloadVars: any[] = [];
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
                if (originalRow.floorFactorId === 0) {
                    createPayloadVars.push({
                        isActive: originalRow.isActive,
                        createdBy: 1, // TODO: Get from auth context
                        floorId: originalRow.floorId,
                        factorWithLift: newFactorWithLift,
                        factorWithoutLift: newFactorWithoutLift,
                        yearRangeCVId: originalRow.yearRangeCVID ?? originalRow.yearRangeCVId ?? 0
                    });
                } else {
                    updatePayloadVars.push({
                        floorFactorId: originalRow.floorFactorId,
                        floorId: originalRow.floorId,
                        factorWithLift: newFactorWithLift,
                        factorWithoutLift: newFactorWithoutLift,
                        yearRangeCVId: originalRow.yearRangeCVID ?? originalRow.yearRangeCVId ?? 0
                    });
                }
            }
        }

        try {
            let createdCount = 0;
            let updatedCount = 0;

            if (createPayloadVars.length > 0) {
                const result = await bulkCreateFloorFactorCVMasterAction({ floorFactors: createPayloadVars });
                if (result && result.success) {
                    createdCount = createPayloadVars.length;
                } else {
                    errorCount += createPayloadVars.length;
                    console.error('Bulk create failed:', result?.message);
                }
            }

            if (updatePayloadVars.length > 0) {
                const result = await bulkUpdateFloorFactorCVMasterAction({ floorFactors: updatePayloadVars });
                if (result && result.success) {
                    updatedCount = updatePayloadVars.length;
                } else {
                    errorCount += updatePayloadVars.length;
                    console.error('Bulk update failed:', result?.message);
                }
            }

            const totalSuccess = createdCount + updatedCount;

            if (totalSuccess > 0 && errorCount === 0) {
                const successMsg = [];
                if (createdCount > 0) successMsg.push(`${createdCount} ${tW('common.messages.created')}`);
                if (updatedCount > 0) successMsg.push(`${updatedCount} ${tW('common.messages.updated')}`);
                addToast('success', tW('common.messages.bulkOperationSuccess', { message: successMsg.join(', ') }));
                setEditableRows({});
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else if (totalSuccess > 0 && errorCount > 0) {
                const successMsg = [];
                if (createdCount > 0) successMsg.push(`${createdCount} ${tW('common.messages.created')}`);
                if (updatedCount > 0) successMsg.push(`${updatedCount} ${tW('common.messages.updated')}`);
                successMsg.push(`${errorCount} ${tW('common.messages.failed')}`);
                addToast('warning', tW('common.messages.bulkOperationPartialSuccess', { message: successMsg.join(', ') }));
                setEditableRows({});
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else if (errorCount > 0) {
                addToast('error', tW('common.messages.bulkOperationFailed'));
            } else {
                addToast('info', tW('common.messages.noChangesDetectedBulk'));
            }
        } catch (error) {
            console.error('Bulk update/create failed:', error);
            addToast('error', tW('common.messages.bulkActionFailed'));
        } finally {
            setIsBulkUpdating(false);
        }
    };

    // Handle Generate All uncreated records
    const handleGenerateAll = async () => {
        const newRecords = data.filter(row => row.floorFactorId === 0);
        if (newRecords.length === 0) return;

        setIsGeneratingAll(true);
        try {
            const payload = {
                floorFactors: newRecords.map(row => ({
                    isActive: row.isActive,
                    createdBy: 1, // TODO: Get from auth context
                    floorId: row.floorId,
                    factorWithLift: row.factorWithLift,
                    factorWithoutLift: row.factorWithoutLift,
                    yearRangeCVId: row.yearRangeCVID ?? row.yearRangeCVId ?? 0
                }))
            };

            console.log('=== Calling bulk CREATE action ===', payload);
            const result = await bulkCreateFloorFactorCVMasterAction(payload);

            if (result && result.success) {
                addToast('success', tW('common.messages.recordsGeneratedSuccess', { count: newRecords.length }));
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                addToast('error', result?.message || tW('common.messages.generationFailed'));
            }
        } catch (error) {
            console.error('Generate All failed:', error);
            addToast('error', tW('common.messages.generateAllFailed'));
        } finally {
            setIsGeneratingAll(false);
        }
    };

    // Handle clear all changes and filters
    const handleClearAll = () => {
        setEditableRows({});
        setFromFloor("");
        setToFloor("");
        setLiftStatus("both");
        setFactorValue("0.00");
        setSelectedYear("");

        // Navigate to reset server-side filters
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("pageSize", String(pageSize));

        router.push(`/${locale}/property-tax/weightage-master?${params.toString()}`);

        addToast('info', tW('common.messages.allClearedInfo'));
    };

    /* ================= PAGINATION ================= */
    const changePage = (p: number): void => {
        const params = new URLSearchParams();
        params.set("page", String(p));
        params.set("pageSize", String(pageSize));

        if (currentSearchTerm) {
            params.set("q", currentSearchTerm);
        }

        if (selectedYear) {
            params.set("selectedYearRange", selectedYear);
        }

        router.push(`/${locale}/property-tax/weightage-master?${params.toString()}`);
    };

    const changePageSize = (size: number): void => {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("pageSize", String(size));

        if (currentSearchTerm) {
            params.set("q", currentSearchTerm);
        }

        if (selectedYear) {
            params.set("selectedYearRange", selectedYear);
        }

        router.push(`/${locale}/property-tax/weightage-master?${params.toString()}`);
    };

    const handleAssessmentYearChange = (value: string) => {
        setSelectedYear(value);

        const params = new URLSearchParams();
        params.set("page", "1");
        if (value) params.set("selectedYearRange", value);

        router.push(`/${locale}/property-tax/weightage-master?${params.toString()}`);
    };

    // Derived states for button enable/disable logic
    // Apply button should be disabled unless all filter values are selected/valid
    const isApplyDisabled =
        !fromFloor ||
        !toFloor ||
        !liftStatus ||
        parseFloat(factorValue) <= 0;
    const isBulkUpdateDisabled = Object.keys(editableRows).length === 0 || isBulkUpdating;
    // const isSingleUpdateDisabled = isBulkUpdating || isUpdating;

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
                actionLabel={t('columns.action')}
                getRowKey={(row) => getRowUid(row as unknown as FloorFactorCVMaster)}
                paginationConfig={{ enabled: true, showPageSizeSelector: false }}

                footerLeftContent={
                    <div className="flex items-center gap-1 text-sm">
                        {tCommon("table.showing")} {totalCount === 0 ? 0 : ((pageNumber || 1) - 1) * (pageSize || 10) + 1} {tCommon("table.to")}
                        <Select
                            options={Array.from(new Set([10, 20, 30, 40, 50, totalCount])).filter(s => s > 0).map(s => ({
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
                    <div className="w-full">
                        <div className="flex items-end gap-4 mb-3 flex-wrap">


                            <div className="min-w-[140px]">
                                <Select
                                    options={assessmentYearOptions}
                                    value={selectedYear}
                                    onChange={handleAssessmentYearChange} // Trigger filter on change
                                    label={t('filters.assessmentYear')}
                                    selectSize="sm"
                                />
                            </div>

                            <div className="min-w-[180px]">
                                <Select
                                    options={floorOptions}
                                    value={fromFloor}
                                    onChange={setFromFloor}
                                    label={t('filters.fromFloor')}
                                    selectSize="sm"
                                />
                            </div>

                            <div className="min-w-[180px]">
                                <Select
                                    options={floorOptions}
                                    value={toFloor}
                                    onChange={setToFloor}
                                    label={t('filters.toFloor')}
                                    selectSize="sm"
                                />
                            </div>

                            <div className="min-w-[120px]">
                                <Select
                                    options={liftStatusOptions}
                                    value={liftStatus}
                                    onChange={setLiftStatus}
                                    label={t('filters.liftStatus')}
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
                                        if ((parseFloat(value) >= 0 && parseFloat(value) <= 999999) || value === '') {
                                            setFactorValue(value);
                                        } else {
                                            addToast('error', tW('common.messages.valueExceedsMax'));
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // Prevent minus key from being entered
                                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                                            e.preventDefault();
                                        }
                                    }}
                                    label={t('filters.factor')}
                                    placeholder="0.00"
                                    className="h-8"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                {hasNewRecords && (
                                    <div className="flex items-center">
                                        <StatusBadge
                                            variant="pending"
                                            label={`${newRecordsCount} ${tW('common.labels.pendingRecordCreates')}`}
                                            className="px-3 py-1.5"
                                        />
                                    </div>
                                )}
                                <AddButton
                                    label={isGeneratingAll ? "Generating..." : tW('common.buttons.generateAll')}
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
                }
            />
        </div>
    );
};

export default FloorCvWeightageMaster;
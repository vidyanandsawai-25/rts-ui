"use client";

import { Column } from "@/components/common/MasterTable";
import { UseFactorCVMaster, UseType } from "@/types/useCategoryCvFactor.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MatrixCellInput } from "@/components/common/MatrixCellInput";
import { SortableColumnHeader, SortDirection } from "@/components/common/SortableColumnHeader";
import { Button } from "@/components/common/ActionButton";
import { Badge } from "@/components/common/Badge";
import { toast } from "sonner";

export const getTypeOfUseColumns = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: (key: string, values?: Record<string, any>) => string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tW: (key: string, values?: Record<string, any>) => string,
    handleTypeRowClick: (row: UseType) => void,
    _tCommon: (key: string) => string,
    leftSortBy?: string,
    leftSortOrder?: string,
    onLeftSort?: (key: string) => void
): Column<UseType>[] => {
    const sortableColumns: Record<string, string> = {
        typeOfUseCode: "TypeOfUseCode",
        description: "Description",
    };

    const createSortableLabel = (label: string, dataKey: string) => {
        const apiSortKey = sortableColumns[dataKey];
        if (onLeftSort && apiSortKey) {
            let sortDir: SortDirection = null;
            if (leftSortBy === apiSortKey) {
                sortDir = (leftSortOrder === "asc" || leftSortOrder === "desc") ? leftSortOrder : null;
            }
            return (
                <SortableColumnHeader
                    label={label}
                    sortDirection={sortDir}
                    onSort={() => onLeftSort(apiSortKey)}
                />
            );
        }
        return label;
    };

    return [
        {
            key: "typeOfUseCode",
            label: createSortableLabel(t('leftTable.typeOfUseCode'), "typeOfUseCode"),
            width: "30%",
            render: (value, row) => (
                <Button
                    variant="ghost"
                    className="!h-auto !p-0 !bg-transparent text-blue-600 hover:underline hover:!bg-transparent inline-flex items-center gap-2 font-normal"
                    onClick={() => handleTypeRowClick(row)}
                >
                    <i className="fa-solid fa-list-ul text-blue-500 text-lg"></i>
                    <Badge variant="default" size="sm" className="min-w-[24px] h-[24px] flex items-center justify-center border-blue-200 text-blue-500 bg-[#E2EEFF]">
                        {String(value || '')}
                    </Badge>
                </Button>
            ),
        },
        {
            key: "description",
            label: createSortableLabel(t('leftTable.typeOfUse'), "description"),
            width: "50%",
            render: (value, row) => (
                <Button
                    variant="ghost"
                    className="!h-auto !p-0 !bg-transparent text-blue-600 hover:underline hover:!bg-transparent text-left w-full py-1 font-normal justify-start"
                    onClick={() => handleTypeRowClick(row)}
                >
                    <span className="w-full text-left whitespace-normal break-words">{String(value || '')}</span>
                </Button>
            ),
        },
        {
            key: "isActive",
            label: t('leftTable.status'),
            width: "20%",
            isStatus: true,
            render: (value) => (
                <StatusBadge
                    variant="status"
                    value={value as boolean}
                    activeLabel={tW('common.labels.active')}
                    inactiveLabel={tW('common.labels.inactive')}
                />
            ),
        },
    ];
};

export const getUseFactorColumns = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: (key: string, values?: Record<string, any>) => string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tW: (key: string, values?: Record<string, any>) => string,
    editableRows: Record<string, UseFactorCVMaster>,
    handleCellChange: (rowId: string, columnId: string, value: number) => void,
    getRowUid: (row: UseFactorCVMaster) => string,
    _tCommon: (key: string) => string,
    sortBy?: string,
    sortOrder?: string,
    onSort?: (key: string) => void,
    typeOfUseOptions: { label: string; value: string }[] = [],
    assessmentYearOptions: { label: string; value: string }[] = []
): Column<UseFactorCVMaster>[] => {
    const sortableColumns: Record<string, string> = {
        typeOfUseCode: "TypeOfUseId",
        typeOfUseDescription: "TypeOfUseId",
        subTypeOfUseDescription: "SubTypeOfUseId",
        fromYear: "YearRangeCVId",
    };

    const createSortableLabel = (label: string, dataKey: string) => {
        const apiSortKey = sortableColumns[dataKey];
        if (onSort && apiSortKey) {
            let sortDir: SortDirection = null;
            if (sortBy === apiSortKey) {
                sortDir = (sortOrder === "asc" || sortOrder === "desc") ? sortOrder : null;
            }
            return (
                <SortableColumnHeader
                    label={label}
                    sortDirection={sortDir}
                    onSort={() => onSort(apiSortKey)}
                />
            );
        }
        return label;
    };

    return [
        {
            key: "typeOfUseCode",
            label: createSortableLabel(t('columns.typeOfUseCode'), "typeOfUseCode"),
            width: "20%",
            render: (value, row) => {
                if (value && typeof value === "string" && value !== "-") return value;
                const opt = typeOfUseOptions.find(o => o.value === String(row.typeOfUseId));
                if (opt) {
                    const parts = opt.label.split(" - ");
                    if (parts.length > 1) return parts[0].trim();
                    return opt.label;
                }
                return "-";
            },
        },
        {
            key: "typeOfUseDescription",
            label: createSortableLabel(t('columns.typeOfUse'), "typeOfUseDescription"),
            width: "20%",
            render: (value, row) => {
                if (value && typeof value === "string" && value !== "-") return value;
                const opt = typeOfUseOptions.find(o => o.value === String(row.typeOfUseId));
                if (opt) {
                    const parts = opt.label.split(" - ");
                    if (parts.length > 1) return parts.slice(1).join(" - ").trim();
                    return opt.label;
                }
                return "-";
            },
        },
        {
            key: "subTypeOfUseDescription",
            label: createSortableLabel(t('columns.subType'), "subTypeOfUseDescription"),
            width: "20%",
            render: (value) => (value as string) || "-",
        },
        {
            key: "factor",
            label: t('columns.factor'),
            width: "15%",
            render: (value, row) => {
                const rowUid = getRowUid(row);
                const editableValue = editableRows[rowUid]?.factor ?? (value as number);
                return (
                    <MatrixCellInput
                        className="lg:w-26"
                        value={editableValue}
                        rowId={rowUid}
                        columnId="factor"
                        maxValue={999.99}
                        metaLabel={t('columns.factor')}
                        onCellChange={handleCellChange}
                        onMaxExceeded={() => toast.error(tW('common.messages.valueExceedsMax'))}
                    />
                );
            },
        },
        {
            key: "fromYear",
            label: createSortableLabel(t('columns.assessmentYear'), "fromYear"),
            width: "15%",
            render: (_value, row) => {
                if (row.fromYear != null && row.toYear != null && row.fromYear !== 0 && row.toYear !== 0) {
                    return `${row.fromYear}-${row.toYear}`;
                }
                const yearId = row.yearRangeCVId ?? row.yearRangeId ?? row.yearRangeCvId ?? row.YearRangeCVId ?? row.YearRangeCvId ?? row.yearId;
                if (yearId != null && yearId !== undefined) {
                    const opt = assessmentYearOptions.find(o => String(o.value) === String(yearId));
                    if (opt) return opt.label;
                }
                return "-";
            },
        },
        {
            key: "isActive",
            label: t('columns.status'),
            width: "10%",
            isStatus: true,
            render: (value) => {
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
};

"use client";

import { Column } from "@/components/common/MasterTable";
import { UseFactorCVMaster, UseType } from "@/types/useCategoryCvFactor.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MatrixCellInput } from "@/components/common/MatrixCellInput";

export const getTypeOfUseColumns = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: (key: string, values?: Record<string, any>) => string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tW: (key: string, values?: Record<string, any>) => string,
    handleTypeRowClick: (row: UseType) => void
): Column<UseType>[] => [
    {
        key: "typeOfUseCode",
        label: t('leftTable.typeOfUseCode'),
        width: "30%",
        render: (value, row) => (
            <button
                type="button"
                className="cursor-pointer text-blue-600 hover:underline inline-flex items-center gap-2 bg-transparent border-0 p-0"
                onClick={() => handleTypeRowClick(row)}
            >
                <i className="fa-solid fa-list-ul text-blue-500 text-lg"></i>
                <div className="min-w-[24px] h-[24px] px-1 rounded border border-blue-200 text-blue-500 font-semibold flex items-center justify-center text-[11px] bg-[#E2EEFF]">
                    {String(value || '')}
                </div>
            </button>
        ),
    },
    {
        key: "description",
        label: t('leftTable.typeOfUse'),
        width: "50%",
        render: (value, row) => (
            <button
                type="button"
                className="cursor-pointer text-blue-600 hover:underline py-1 bg-transparent border-0 p-0 text-left w-full"
                onClick={() => handleTypeRowClick(row)}
            >
                {String(value || '')}
            </button>
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

export const getUseFactorColumns = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: (key: string, values?: Record<string, any>) => string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tW: (key: string, values?: Record<string, any>) => string,
    editableRows: Record<string, UseFactorCVMaster>,
    handleCellChange: (rowId: string, columnId: string, value: number) => void,
    getRowUid: (row: UseFactorCVMaster) => string
): Column<UseFactorCVMaster>[] => [
    {
        key: "typeOfUseCode",
        label: t('columns.typeOfUseCode'),
        width: "20%",
        render: (value) => value || '',
    },
    {
        key: "typeOfUseDescription",
        label: t('columns.typeOfUse'),
        width: "20%",
        render: (value) => value || '',
    },
    {
        key: "subTypeOfUseDescription",
        label: t('columns.subType'),
        width: "20%",
        render: (value) => value || "-",
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
                    metaLabel={t('columns.factor')}
                    onCellChange={handleCellChange}
                />
            );
        },
    },
    {
        key: "fromYear",
        label: t('columns.assessmentYear'),
        width: "15%",
        render: (_value, row) => `${row.fromYear}-${row.toYear}`,
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

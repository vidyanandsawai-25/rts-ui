"use client";
import { Column } from "@/components/common/MasterTable";
import { MatrixCellInput } from "@/components/common/MatrixCellInput";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NatureFactorCVMaster as NatureFactorCVMasterType } from "@/types/natureofbuilding-cv-weightageMaster.types";

interface GetNatureFactorCvColumnsProps {
    t: (key: string) => string;
    tW: (key: string) => string;
    editableRows: Record<string, NatureFactorCVMasterType>;
    getRowUid: (row: NatureFactorCVMasterType) => string;
    handleCellChange: (rowId: string, columnId: string, value: number) => void;
}

export const getNatureFactorCvColumns = ({
    t,
    tW,
    editableRows,
    getRowUid,
    handleCellChange
}: GetNatureFactorCvColumnsProps): Column<NatureFactorCVMasterType>[] => [
        {
            key: "constructionCode",
            label: t('columns.constructionCode'),
            width: "15%",
            render: (value) => (value as string) || "-",
        },
        {
            key: "constructionDescription",
            label: t('columns.description'),
            width: "25%",
            render: (value) => (value as string) || "-",
        },
        {
            key: "factor",
            label: t('columns.factor'),
            width: "10%",
            render: (value, row) => {
                const rowUid = getRowUid(row);
                const editableValue = editableRows[rowUid]?.factor ?? (value as number);
                return (
                    <MatrixCellInput
                        className="lg:w-26"
                        value={editableValue}
                        rowId={rowUid}
                        columnId="factor"
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

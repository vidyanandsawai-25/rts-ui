
import { Column } from "@/components/common/MasterTable";
import { MatrixCellInput } from "@/components/common/MatrixCellInput";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AgeFactorCVMaster } from "@/types/ageFactorCv.types";

interface GetAgeFactorCvColumnsProps {
    t: (key: string) => string;
    tW: (key: string) => string;
    editableRows: Record<string, AgeFactorCVMaster>;
    handleCellChange: (rowId: string, columnId: string, value: number) => void;
    getRowUid: (row: AgeFactorCVMaster) => string;
}

export const getAgeFactorCvWeightageMasterColumns = ({
    t,
    tW,
    editableRows,
    handleCellChange,
    getRowUid,
}: GetAgeFactorCvColumnsProps): Column<AgeFactorCVMaster>[] => [
    {
        key: "constructionCode",
        label: t('columns.constructionType'),
        width: "10%",
        render: (value) => (value as string) || "-",
    },
    {
        key: "ageFrom",
        label: t('columns.ageFrom'),
        width: "14%",
        render: (value) => value as number,
    },
    {
        key: "ageTo",
        label: t('columns.ageTo'),
        width: "14%",
        render: (value) => value as number,
    },
    {
        key: "factor",
        label: t('columns.factor'),
        width: "14%",
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
        width: "14%",
        render: (_value, row) => 
            row.fromYear != null && row.toYear != null 
                ? `${row.fromYear}-${row.toYear}` 
                : "-",
    },
    {
        key: "isActive",
        label: t('columns.status'),
        width: "14%",
        render: (value, row) => {
            if (row.id === 0) return <StatusBadge variant="pending" />;
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

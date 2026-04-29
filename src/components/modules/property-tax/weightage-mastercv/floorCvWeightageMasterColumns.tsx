import { Column } from '@/components/common/MasterTable';
import { MatrixCellInput, StatusBadge } from '@/components/common';
import { ColumnConfig, FloorFactorCVMaster } from '@/types/floor-cv-weightageMaster.types';

// Extend FloorFactorCVMaster to add index signature
type FloorFactorCVMasterWithIndex = FloorFactorCVMaster & Record<string, unknown>;

export const getFloorCvWeightageMasterColumns = ({
  t,
  tW,
  editableRows,
  handleCellChange,
  getRowUid,
}: ColumnConfig): Column<FloorFactorCVMasterWithIndex>[] => {
  return [
    {
      key: "floorCode",
      label: t('columns.floorCode'),
      width: "10%",
      render: (value: unknown) => String(value || "-"),
    },
    {
      key: "floorDescription",
      label: t('columns.description'),
      width: "14%",
      render: (value: unknown) => String(value || "-"),
    },
    {
      key: "factorWithLift",
      label: t('columns.factorWithLift'),
      width: "14%",
      render: (value: unknown, row: FloorFactorCVMaster) => {
        const rowUid = getRowUid(row);
        const editableValue = editableRows[rowUid]?.factorWithLift ?? (value as number);
        return (
          <MatrixCellInput
            className="lg:w-26"
            value={editableValue}
            rowId={rowUid}
            columnId="factorWithLift"
            metaLabel={t('columns.factorWithLift')}
            onCellChange={handleCellChange}
          />
        );
      },
    },
    {
      key: "factorWithoutLift",
      label: t('columns.factorWithoutLift'),
      width: "14%",
      render: (value: unknown, row: FloorFactorCVMaster) => {
        const rowUid = getRowUid(row);
        const editableValue = editableRows[rowUid]?.factorWithoutLift ?? (value as number);
        return (
          <MatrixCellInput
            className="lg:w-26"
            value={editableValue}
            rowId={rowUid}
            columnId="factorWithoutLift"
            metaLabel={t('columns.factorWithoutLift')}
            onCellChange={handleCellChange}
          />
        );
      },
    },
    {
      key: "fromYear",
      label: t('columns.assessmentYear'),
      width: "14%",
      render: (_value: unknown, row: FloorFactorCVMaster) => `${row.fromYear}-${row.toYear}`,
    },
    {
      key: "isActive",
      label: t('columns.status'),
      width: "14%",
      isStatus: true,
      render: (value: unknown, row: FloorFactorCVMaster) => {
        if (row.id === 0) {
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
};

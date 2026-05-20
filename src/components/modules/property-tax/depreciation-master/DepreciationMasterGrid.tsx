import { FileText } from "lucide-react";
import TableHeader from "@/components/common/TableHeader";
import { PageContainer } from "@/components/common/PageContainer";
import type { MatrixColumn, MatrixRow } from "@/components/common/MatrixGrid";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import type { RangeRow } from "@/types/depreciation.types";

interface DepreciationMasterGridProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, values?: Record<string, unknown>) => string;
  minValue: string;
  maxValue: string;
  minError: string | null;
  maxError: string | null;
  ranges: RangeRow[];
  effectiveSelectedRangeId: string | null;
  saving: boolean;
  handleMinChange: (value: string) => void;
  handleMaxChange: (value: string) => void;
  handleAddRange: () => void;
  handleRangeSelection: (rangeId: string | null) => void;
  handleDeleteRange: () => void;
  matrixColumns: MatrixColumn[];
  matrixRows: MatrixRow[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  editableColumnIds: string[];
  handleCellChange: (rowId: string, colId: string, value: string | number) => void;
  handleUpdateRates: () => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
}

export function DepreciationMasterGrid({
  t,
  minValue,
  maxValue,
  minError,
  maxError,
  ranges,
  effectiveSelectedRangeId,
  saving,
  handleMinChange,
  handleMaxChange,
  handleAddRange,
  handleRangeSelection,
  handleDeleteRange,
  matrixColumns,
  matrixRows,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  editableColumnIds,
  handleCellChange,
  handleUpdateRates,
  handlePageChange,
  handlePageSizeChange,
}: DepreciationMasterGridProps) {
  return (
    <PageContainer>
      <div className="space-y-4">
        <TableHeader title={t("title")}
          subtitle={t("subtitle")}
          icon={FileText}
        />
        <div className="grid grid-cols-12 gap-4">
          <LeftPanel
            minValue={minValue}
            maxValue={maxValue}
            minError={minError}
            maxError={maxError}
            ranges={ranges}
            selectedRangeId={effectiveSelectedRangeId}
            saving={saving}
            onMinChange={handleMinChange}
            onMaxChange={handleMaxChange}
            onAddRange={handleAddRange}
            onSelectRange={handleRangeSelection}
            onDeleteRange={handleDeleteRange}
            t={t}
          />
          <RightPanel
            matrixColumns={matrixColumns}
            matrixRows={matrixRows}
            saving={saving}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            editableColumnIds={editableColumnIds}
            onCellChange={handleCellChange}
            onUpdateRates={handleUpdateRates}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            t={t}
          />
        </div>
      </div>
    </PageContainer>
  );
}

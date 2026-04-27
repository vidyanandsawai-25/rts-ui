"use client";

import { SaveButton } from "@/components/common";
import { CardPagination } from "@/components/common/Card";
import {
  MatrixGrid,
  type MatrixColumn,
  type MatrixRow,
} from "@/components/common/MatrixGrid";
import type { RangeRow } from "@/types/depreciation.types";

type RightPanelProps = {
  matrixColumns: MatrixColumn[];
  matrixRows: MatrixRow[];
  ranges: RangeRow[];
  selectedRangeId: string | null;
  saving: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  editableColumnIds: string[];
  onCellChange: (rowId: string, columnId: string, value: string | number) => void;
  onUpdateRates: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  t: (key: string) => string;
};

export function RightPanel({
  matrixColumns,
  matrixRows,
  ranges,
  selectedRangeId,
  
  saving,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  editableColumnIds,
  onCellChange,
  onUpdateRates,
  onPageChange,
  onPageSizeChange,
  t,
}: RightPanelProps) {
  return (
    <div className="col-span-12 lg:col-span-10">
      <div className="bg-white rounded-2xl border shadow-sm h-155 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <span className="font-bold text-gray-700 uppercase text-xs tracking-wider">
            {t("createDepChart")}
          </span>
          {selectedRangeId && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
              ACTIVE: {ranges.find((r) => r.id === selectedRangeId)?.label}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-auto text-gray-400">
          <MatrixGrid
            columns={matrixColumns}
            rows={matrixRows}
            metaColumns={[{ id: "range", label: t("ageRange"), width: "120px" }]}
            mode="edit"
            editableColumns={editableColumnIds}
            onCellChange={onCellChange}
            translations={{
              action: t("action"),
            
              deleteRow: t("deleteRow"),
            }}
          />
        </div>

        <CardPagination
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={[10, 20, 50]}
          className="mx-4 mb-2"
        />

        <div className="p-4 border-t flex justify-end rounded-b-2xl">
          <SaveButton
            label={saving ? "Processing..." : `${t("updateRates")}`}
            onClick={onUpdateRates}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}

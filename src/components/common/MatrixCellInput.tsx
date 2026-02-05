"use client";

import { cn } from "@/lib/utils/cn";

export interface MatrixCellInputProps {
  value: number;
  rowId: string;
  columnId: string;
  metaLabel?: string;
  colorClass?: string;
  onCellChange?: (rowId: string, columnId: string, value: number) => void;
}

export const MatrixCellInput = ({
  value,
  rowId,
  columnId,
  metaLabel,
  colorClass,
  onCellChange,
}: MatrixCellInputProps): React.ReactElement => {
  return (
    <input
      type="number"
      value={value === 0 ? "" : value}
      aria-label={metaLabel}
      onChange={(e) => {
        let val = e.target.value === "" ? 0 : Number(e.target.value);
        if (val < 0) val = 0;
        onCellChange?.(rowId, columnId, val);
      }}
      placeholder="0"
      className={cn(
        "px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-center border border-gray-300 bg-white w-full outline-none focus:ring-2 focus:ring-blue-400",
        colorClass
      )}
    />
  );
};

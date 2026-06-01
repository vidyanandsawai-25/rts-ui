"use client";

import { useCallback, useState } from "react";

interface UsePropertyAmenitySelectionProps {
  tableData: { propertyId: number }[];
}

interface UsePropertyAmenitySelectionReturn {
  selectedRows: Set<number>;
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<number>>>;
  allSelected: boolean;
  someSelected: boolean;
  toggleSelectAll: () => void;
  toggleRow: (id: number) => void;
  resetSelection: () => void;
}

export function usePropertyAmenitySelection({
  tableData,
}: UsePropertyAmenitySelectionProps): UsePropertyAmenitySelectionReturn {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [prevTableData, setPrevTableData] = useState(tableData);

  // Reset selection when table data changes
  if (tableData !== prevTableData) {
    setPrevTableData(tableData);
    setSelectedRows(new Set());
  }

  const allSelected = tableData.length > 0 && selectedRows.size === tableData.length;
  const someSelected = selectedRows.size > 0 && !allSelected;

  const toggleSelectAll = useCallback(() => {
    setSelectedRows(
      allSelected ? new Set() : new Set(tableData.map((r) => r.propertyId))
    );
  }, [allSelected, tableData]);

  const toggleRow = useCallback((id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  return {
    selectedRows,
    setSelectedRows,
    allSelected,
    someSelected,
    toggleSelectAll,
    toggleRow,
    resetSelection,
  };
}

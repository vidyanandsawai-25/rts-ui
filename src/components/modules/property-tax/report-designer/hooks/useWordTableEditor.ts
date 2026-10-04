'use client';

import { useState, useCallback } from 'react';

export interface TableCellStyle {
  fontSize?: number;
  fontWeight?: number | string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
  wrap?: boolean;
}

export interface TableCell {
  content: string;
  rowSpan?: number
  colSpan?: number;
  hidden?: boolean;
  style?: TableCellStyle;
}

export interface TableStructure {
  rows: number;
  cols: number;
  cells: Record<string, TableCell>; // key: "r_c" e.g. "0_0"
  columnWidths: number[];
  rowHeights: number[];
}

export function createDefaultTableStructure(rows: number, cols: number, totalWidth = 400): TableStructure {
  const colWidth = Math.round(totalWidth / cols);
  const columnWidths = Array(cols).fill(colWidth);
  const rowHeights = Array(rows).fill(28);
  const cells: Record<string, TableCell> = {};

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells[`${r}_${c}`] = {
        content: `R${r + 1}C${c + 1}`,
        style: {
          fontSize: 9,
          textAlign: 'left',
          verticalAlign: 'middle',
          borderColor: '#cbd5e1',
          borderWidth: 1,
          padding: 4,
          wrap: true,
        },
      };
    }
  }

  return {
    rows,
    cols,
    cells,
    columnWidths,
    rowHeights,
  };
}

export function useWordTableEditor(initialTable?: TableStructure) {
  const [table, setTable] = useState<TableStructure | null>(initialTable || null);
  const [hoverMatrix, setHoverMatrix] = useState<{ rows: number; cols: number }>({ rows: 1, cols: 1 });
  const [selectedCellKeys, setSelectedCellKeys] = useState<string[]>([]);

  const onMatrixHover = useCallback((rows: number, cols: number) => {
    setHoverMatrix({ rows: Math.min(8, Math.max(1, rows)), cols: Math.min(10, Math.max(1, cols)) });
  }, []);

  const createTable = useCallback((rows: number, cols: number, width?: number) => {
    const newTable = createDefaultTableStructure(rows, cols, width);
    setTable(newTable);
    return newTable;
  }, []);

  const selectCell = useCallback((key: string, multiSelect = false) => {
    setSelectedCellKeys(prev => {
      if (multiSelect) {
        return prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key];
      }
      return [key];
    });
  }, []);

  const updateCellContent = useCallback((key: string, content: string) => {
    setTable(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cells: {
          ...prev.cells,
          [key]: {
            ...prev.cells[key],
            content,
          },
        },
      };
    });
  }, []);

  const updateCellStyle = useCallback((key: string, styleUpdates: Partial<TableCellStyle>) => {
    setTable(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cells: {
          ...prev.cells,
          [key]: {
            ...prev.cells[key],
            style: {
              ...prev.cells[key]?.style,
              ...styleUpdates,
            },
          },
        },
      };
    });
  }, []);

  const applyStyleToSelectedCells = useCallback((styleUpdates: Partial<TableCellStyle>, targetKeys?: string[]) => {
    setTable(prev => {
      if (!prev) return null;
      const keysToUpdate = targetKeys || selectedCellKeys;
      const updatedCells = { ...prev.cells };
      keysToUpdate.forEach(k => {
        if (updatedCells[k]) {
          updatedCells[k] = {
            ...updatedCells[k],
            style: {
              ...updatedCells[k]?.style,
              ...styleUpdates,
            },
          };
        }
      });
      return { ...prev, cells: updatedCells };
    });
  }, [selectedCellKeys]);

  return {
    table,
    setTable,
    hoverMatrix,
    onMatrixHover,
    createTable,
    selectedCellKeys,
    selectCell,
    updateCellContent,
    updateCellStyle,
    applyStyleToSelectedCells,
  };
}

import React from 'react';
import { Column, HeaderCell } from '@/components/common/AutomationTable';
import { ExportColumn, ExportHeaderCell } from '@/types/automation-dashboard/export.type';

// Map Tailwind background colors used in headers to hex for Excel/PDF
const tailwindColorMap: Record<string, string> = {
    'bg-green-50': '#F0FDF4',
    'bg-blue-50': '#EFF6FF',
    'bg-purple-50': '#FAF5FF',
    'bg-orange-50': '#FFF7ED',
    'bg-emerald-50': '#ECFDF5',
    'bg-red-50': '#FEF2F2',
    'bg-yellow-50': '#FEFCE8',
    'bg-indigo-50': '#EEF2FF',
    'bg-indigo-100': '#E0E7FF',
    'bg-purple-100': '#F3E8FF',
};

function getBgColorFromClassName(className?: string): string | undefined {
    if (!className) return undefined;
    for (const key of Object.keys(tailwindColorMap)) {
        if (className.includes(key)) {
            return tailwindColorMap[key];
        }
    }
    return undefined;
}

/**
 * Extracts plain text from a React Node recursively.
 * Handles nested elements like <div>, <span>, <br> (converted to newline)
 */
export function extractTextFromNode(node: React.ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }
    if (Array.isArray(node)) {
        return node.map(extractTextFromNode).join(' ');
    }
    if (React.isValidElement(node)) {
        // Specific handling for <br> or similar structural tags if needed
        if (node.type === 'br') return '\n';
        return extractTextFromNode((node.props as Record<string, unknown>).children as React.ReactNode);
    }
    return '';
}

/**
 * Adapts AutomationTable configuration (columns & headerRows) into the common ExportConfig format.
 */
export function adaptTableConfigToExport<T extends Record<string, unknown>>(
    columns: Column<T>[],
    headerRows?: HeaderCell[][]
): { exportColumns: ExportColumn<T>[]; exportHeaderRows?: ExportHeaderCell[][] } {

    // Convert table columns to export columns
    const exportColumns: ExportColumn<T>[] = columns.map(col => ({
        header: extractTextFromNode(col.label).trim(),
        key: String(col.key),
        width: col.width ? parseInt(col.width.replace(/\D/g, ''), 10) || 100 : undefined,
        format: col.render 
            ? (val: unknown, row: T, index: number) => extractTextFromNode(col.render!(val as T[keyof T] | undefined, row, index)).trim()
            : undefined
    }));

    // Convert multi-level headers if provided
    let exportHeaderRows: ExportHeaderCell[][] | undefined = undefined;
    if (headerRows && headerRows.length > 0) {
        exportHeaderRows = headerRows.map(row =>
            row.map(cell => ({
                title: extractTextFromNode(cell.label).trim(),
                colSpan: cell.colSpan,
                rowSpan: cell.rowSpan,
                backgroundColor: getBgColorFromClassName(cell.headerClassName)
            }))
        );
    }

    return { exportColumns, exportHeaderRows };
}

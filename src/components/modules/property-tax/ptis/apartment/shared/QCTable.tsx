"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { ApartmentQCDetail } from '@/types/apartmentQC.types';

export interface QCTableColumn {
  key: string;
  label: string;
  render?: (item: ApartmentQCDetail) => React.ReactNode;
}

export interface QCTableProps {
  data: ApartmentQCDetail[];
  columns: QCTableColumn[];
  loading?: boolean;
  error?: string | null;
}

export const QCTable: React.FC<QCTableProps> = ({
  data,
  columns,
  loading = false,
  error = null,
}) => {
  const t = useTranslations('ptis.apartmentTabs');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        {t('noData')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key + idx}
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIdx) => (
            <tr key={row.id || rowIdx} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, colIdx) => {
                let content: React.ReactNode;
                if (col.render) {
                  content = col.render(row);
                  if (content === null || content === undefined) content = '-';
                } else {
                  const value = row[col.key as keyof ApartmentQCDetail];
                  content = value !== null && value !== undefined ? String(value) : '-';
                }
                return (
                  <td
                    key={col.key + colIdx}
                    className="px-3 py-2 whitespace-nowrap text-sm text-gray-900"
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to format area
export const formatArea = (sqFt: number, sqMtr: number): string => {
  return `${sqFt.toFixed(2)} / ${sqMtr.toFixed(2)}`;
};

// Base columns used across all tabs
export const getBaseColumns = (t: (key: string) => string): QCTableColumn[] => [
  { key: 'propertyNo', label: t('columns.propertyNo') },
  { key: 'floor', label: t('columns.floor') },
  { key: 'assessmentYear', label: t('columns.assessmentYear') },
  { key: 'constructionYear', label: t('columns.constructionYear') },
  { key: 'typeOfUse', label: t('columns.typeOfUse') },
  { 
    key: 'carpetArea', 
    label: t('columns.carpetArea'), 
    render: (item: ApartmentQCDetail) => formatArea(item.carpetASqFt, item.carpetASqMtr) 
  },
  { 
    key: 'builtupArea', 
    label: t('columns.builtupArea'), 
    render: (item: ApartmentQCDetail) => formatArea(item.builtupASqFt, item.builtupASqMtr) 
  },
  { key: 'oldConstArea', label: t('columns.oldConstArea') },
  { key: 'oldRV', label: t('columns.oldRV') },
];

// Rateable specific columns
export const getRateableColumns = (t: (key: string) => string): QCTableColumn[] => [
  ...getBaseColumns(t),
  { key: 'rateableValue', label: t('columns.newRV') },
  { key: 'newTaxTotalRV', label: t('columns.totalTax') },
];

// Capital specific columns
export const getCapitalColumns = (t: (key: string) => string): QCTableColumn[] => [
  ...getBaseColumns(t),
  { key: 'capitalValue', label: t('columns.cv') },
  { key: 'newTaxTotalCV', label: t('columns.totalTax') },
];

// Dual method columns
export const getDualColumns = (t: (key: string) => string): QCTableColumn[] => [
  ...getBaseColumns(t),
  { key: 'rateableValue', label: t('columns.newRV') },
  { key: 'capitalValue', label: t('columns.cv') },
  { key: 'newTaxTotal', label: t('columns.totalTax') },
];

export default QCTable;

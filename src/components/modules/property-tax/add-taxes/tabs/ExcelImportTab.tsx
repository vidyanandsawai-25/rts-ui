'use client';

import { useTranslations } from 'next-intl';
import { Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AddTaxesConsoleApi } from '@/types/add-taxes.types';

interface Props {
  api: AddTaxesConsoleApi;
}

const ELIGIBILITY_STYLE: Record<string, string> = {
  Eligible: 'text-green-700 font-semibold',
  Ineligible: 'text-red-600 font-semibold',
};

export function ExcelImportTab({ api }: Props) {
  const t = useTranslations('addTaxes');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    api.setExcelFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) api.setExcelFile(file);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Upload card */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-bold text-gray-900">{t('excel.title')}</h2>
        <p className="mt-0.5 text-xs text-gray-500">{t('excel.description')}</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              api.excelFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50',
            )}
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {api.excelFile ? api.excelFile.name : t('excel.dragDrop')}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">{t('excel.uploadDesc')}</p>
            </div>
            <label className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              {t('excel.browseFile')}
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="sr-only"
                aria-label={t('excel.browseFile')}
              />
            </label>
          </div>

          {/* Template download */}
          <div className="flex flex-col justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">{t('excel.templateTitle')}</p>
            <p className="text-xs text-gray-500">{t('excel.templateDesc')}</p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 self-start rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              {t('excel.downloadTemplate')}
            </button>
          </div>
        </div>
      </div>

      {/* Validation preview card */}
      {api.excelFile && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-gray-900">{t('excel.validationTitle')}</h2>

          {/* Mini stats */}
          {api.excelValidation && (
            <div className="mb-4 flex flex-wrap gap-4 text-sm">
              {(
                [
                  { key: 'totalRows', value: api.excelValidation.totalRows, cls: 'text-gray-900' },
                  { key: 'eligible', value: api.excelValidation.eligible, cls: 'text-green-700' },
                  { key: 'ineligible', value: api.excelValidation.ineligible, cls: 'text-red-600' },
                  { key: 'warnings', value: api.excelValidation.warnings, cls: 'text-amber-600' },
                ] as const
              ).map(({ key, value, cls }) => (
                <div key={key} className="rounded-md border border-gray-100 bg-gray-50 px-3 py-1.5 text-center">
                  <p className="text-xs text-gray-500">{t(`excel.miniStats.${key}`)}</p>
                  <p className={`text-lg font-bold ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Preview table */}
          {api.excelValidation && api.excelValidation.rows.length > 0 && (
            <div className="mb-4 overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    {(['rowNum', 'propertyId', 'operation', 'eligibility', 'reason'] as const).map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-medium">
                        {t(`excel.table.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {api.excelValidation.rows.map((row) => (
                    <tr key={row.rowNum} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5">{row.rowNum}</td>
                      <td className="px-3 py-1.5 font-mono">{row.propertyId}</td>
                      <td className="px-3 py-1.5">{row.operation}</td>
                      <td className={cn('px-3 py-1.5', ELIGIBILITY_STYLE[row.eligibility] ?? '')}>{row.eligibility}</td>
                      <td className="px-3 py-1.5 text-gray-500">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => api.validateExcel()}
              disabled={api.isValidatingExcel}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {api.isValidatingExcel ? '...' : t('excel.validateEligibility')}
            </button>
            {api.excelValidation && (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t('excel.downloadRejected')}
                </button>
                <button
                  type="button"
                  onClick={() => api.importExcel()}
                  disabled={api.isImportingExcel || api.excelValidation.eligible === 0}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {api.isImportingExcel ? '...' : t('excel.importEligible')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

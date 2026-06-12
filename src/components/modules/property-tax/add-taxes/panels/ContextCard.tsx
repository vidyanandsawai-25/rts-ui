'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';
import { AddTaxesConsoleApi } from '@/types/add-taxes.types';

interface Props {
  api: AddTaxesConsoleApi;
}

export function ContextCard({ api }: Props) {
  const t = useTranslations('addTaxes');

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-start sm:gap-6">
      {/* Finance Year */}
      <div className="min-w-36">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">
          {t('context.financeYearLabel')}
          <sup className="text-red-500">{t('context.financeYearRequired')}</sup>
        </label>
        <select
          value={api.financeYear}
          onChange={(e) => api.setFinanceYear(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {api.financeYears.map((fy) => (
            <option key={fy.value} value={fy.value}>
              {fy.label}
            </option>
          ))}
        </select>
      </div>

      {/* Processing Options */}
      <div className="flex-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
          {t('context.processingOptions')}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {(
            [
              ['applyInterestPenalty', 'context.applyInterestPenalty'],
              ['sendSms', 'context.sendSms'],
              ['sendEmail', 'context.sendEmail'],
              ['previewBeforeExecute', 'context.previewBeforeExecute'],
            ] as const
          ).map(([field, key]) => (
            <label key={field} className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={api.options[field]}
                onChange={(e) => api.setOptions({ ...api.options, [field]: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
              />
              {t(key)}
            </label>
          ))}
        </div>
      </div>

      {/* Permission */}
      <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2">
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
        <div>
          <p className="text-sm font-semibold text-green-800">{t('context.permissionTitle')}</p>
          <p className="text-xs text-green-700">{t('context.permissionDesc')}</p>
        </div>
      </div>
    </div>
  );
}

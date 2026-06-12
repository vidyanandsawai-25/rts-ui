'use client';

import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Cog, Download, Pause } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AddTaxesConsoleApi } from '@/types/add-taxes.types';

interface Props {
  api: AddTaxesConsoleApi;
}

const STATUS_PILL: Record<string, string> = {
  Added: 'bg-green-100 text-green-700',
  Completed: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
  Processing: 'bg-blue-100 text-blue-700',
  Pending: 'bg-gray-100 text-gray-600',
  Skipped: 'bg-amber-100 text-amber-700',
};

export function BackgroundTaskBar({ api }: Props) {
  const t = useTranslations('addTaxes');
  const { jobResult, jobStatus, runtimeExpanded, setRuntimeExpanded, runtimeProperties, isExecuting } = api;

  if (!jobResult && !isExecuting) return null;

  const processed = jobStatus?.processed ?? 0;
  const total = jobStatus?.total ?? 0;
  const pct = total > 0 ? Math.round((processed / total) * 100) : isExecuting ? 10 : 100;
  const jobId = jobResult?.jobId ?? '';
  const statusLabel = jobStatus?.status ?? (isExecuting ? 'Running' : 'Completed');

  return (
    <div className="overflow-hidden rounded-lg border border-blue-200 bg-blue-50">
      {/* Bar */}
      <div
        className="flex cursor-pointer items-center gap-3 p-3"
        onClick={() => setRuntimeExpanded(!runtimeExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRuntimeExpanded(!runtimeExpanded)}
        aria-expanded={runtimeExpanded}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <Cog className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-blue-900">{t('runtime.title')}</p>
          <p className="text-xs text-blue-700">{t('runtime.subtitle')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {jobId && (
            <span className="text-xs font-mono text-blue-800">{jobId}</span>
          )}
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-blue-800">{pct}%</span>
          </div>
          {runtimeExpanded ? (
            <ChevronUp className="h-4 w-4 text-blue-700" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-700" />
          )}
        </div>
      </div>

      {/* Expanded details */}
      {runtimeExpanded && (
        <div className="border-t border-blue-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {t('runtime.progressText', { processed, total })}
              </p>
              <p className="text-xs text-gray-500">{t('runtime.propertyListNote')}</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                statusLabel === 'Running' || statusLabel === 'InProgress'
                  ? 'bg-blue-100 text-blue-700'
                  : statusLabel === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700',
              )}
            >
              {statusLabel}
            </span>
          </div>

          {/* Mini KPI */}
          <div className="mb-3 grid grid-cols-4 gap-2">
            {[
              { key: 'total', value: total, cls: 'text-gray-900' },
              { key: 'added', value: jobResult?.summary.success ?? 0, cls: 'text-green-700' },
              { key: 'failed', value: jobResult?.summary.failed ?? 0, cls: 'text-red-700' },
              { key: 'pending', value: jobStatus?.pending ?? 0, cls: 'text-amber-700' },
            ].map(({ key, value, cls }) => (
              <div key={key} className="rounded-md border border-gray-100 bg-gray-50 p-2 text-center">
                <p className="text-xs text-gray-500">{t(`runtime.cards.${key}`)}</p>
                <p className={`text-lg font-bold ${cls}`}>{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Property table */}
          {runtimeProperties.length > 0 && (
            <div className="mb-3 overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    {(['propertyId', 'owner', 'taxHead', 'amount', 'status', 'message'] as const).map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-medium">
                        {t(`runtime.table.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {runtimeProperties.slice(0, 20).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 font-mono">{row.propertyNo || row.propertyId}</td>
                      <td className="px-3 py-1.5">{row.owner}</td>
                      <td className="px-3 py-1.5">{row.taxHead}</td>
                      <td className="px-3 py-1.5">{t('runtime.amountDisplay', { amount: row.amount.toLocaleString() })}</td>
                      <td className="px-3 py-1.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_PILL[row.status] ?? 'bg-gray-100 text-gray-600')}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-gray-500">{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pause className="h-3.5 w-3.5" />
              {t('runtime.pause')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-3.5 w-3.5" />
              {t('runtime.downloadLog')}
            </button>
            <button
              type="button"
              onClick={() => api.goToTab('audit')}
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              {t('runtime.openAudit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

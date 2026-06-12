'use client';

import { useTranslations } from 'next-intl';
import { Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AddTaxesConsoleApi, AuditJobRow, AuditJobDetail } from '@/types/add-taxes.types';

interface Props {
  api: AddTaxesConsoleApi;
}

const JOB_STATUS_STYLE: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  Running: 'bg-blue-100 text-blue-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Failed: 'bg-red-100 text-red-700',
  Pending: 'bg-gray-100 text-gray-600',
};

const PROP_STATUS_STYLE: Record<string, string> = {
  Added: 'bg-green-100 text-green-700',
  Completed: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700',
  Skipped: 'bg-amber-100 text-amber-700',
  Processing: 'bg-blue-100 text-blue-700',
  Pending: 'bg-gray-100 text-gray-600',
};

function AuditKpiStrip({ jobs, t }: { jobs: AuditJobRow[]; t: ReturnType<typeof useTranslations> }) {
  const total = jobs.length;
  const completed = jobs.filter((j) => j.status === 'Completed').length;
  const running = jobs.filter((j) => j.status === 'Running' || j.status === 'InProgress').length;
  const failed = jobs.filter((j) => j.status === 'Failed').length;

  const kpis = [
    { key: 'totalJobs', value: total, desc: t('audit.kpiDesc.allJobs'), cls: 'text-gray-900' },
    { key: 'completed', value: completed, desc: t('audit.kpiDesc.completed'), cls: 'text-green-700' },
    { key: 'running', value: running, desc: t('audit.kpiDesc.running'), cls: 'text-blue-700' },
    { key: 'failed', value: failed, desc: t('audit.kpiDesc.failed'), cls: 'text-red-700' },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {kpis.map(({ key, value, desc, cls }) => (
        <div key={key} className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs font-medium text-gray-500">{t(`audit.kpi.${key}`)}</p>
          <p className={`mt-0.5 text-2xl font-bold ${cls}`}>{value}</p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      ))}
    </div>
  );
}

function JobDetailPanel({ job, t }: { job: AuditJobDetail; t: ReturnType<typeof useTranslations> }) {
  const detailRows: { key: string; value: string | undefined }[] = [
    { key: 'jobId', value: job.jobId },
    { key: 'operation', value: job.operation },
    { key: 'financeYear', value: job.financeYear },
    { key: 'quarter', value: job.quarter },
    { key: 'startedBy', value: job.startedBy },
    { key: 'userRole', value: job.userRole },
    { key: 'startTime', value: job.startTime },
    { key: 'completeTime', value: job.completeTime },
    { key: 'duration', value: job.duration },
    { key: 'executionLocation', value: job.executionLocation },
    { key: 'sourceIp', value: job.sourceIp },
    { key: 'device', value: job.device },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Job details */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-900">{t('audit.detail.selectedJob')}</h3>
        <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          {detailRows.map(({ key, value }) =>
            value ? (
              <div key={key}>
                <dt className="text-gray-500">{t(`audit.detail.${key}`)}</dt>
                <dd className="font-semibold text-gray-900">{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
      </div>

      {/* Processing summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-900">{t('audit.detail.processingSummary')}</h3>
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
          {(
            [
              { key: 'totalSelected', value: job.summary.totalSelected, cls: 'text-gray-900' },
              { key: 'successfullyAdded', value: job.summary.successfullyAdded, cls: 'text-green-700' },
              { key: 'skippedRecords', value: job.summary.skippedRecords, cls: 'text-amber-700' },
              { key: 'failed', value: job.summary.failed, cls: 'text-red-700' },
            ] as const
          ).map(({ key, value, cls }) => (
            <div key={key} className="rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1.5">
              <p className="text-gray-500">{t(`audit.detail.${key}`)}</p>
              <p className={`text-lg font-bold ${cls}`}>{value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Property-level table */}
        {job.properties.length > 0 && (
          <>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-700">{t('audit.detail.propertyAuditTitle')}</h4>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <Download className="h-3 w-3" />
                {t('audit.detail.downloadPropertyLog')}
              </button>
            </div>
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    {(['propertyId', 'owner', 'taxHead', 'amount', 'status', 'error'] as const).map((col) => (
                      <th key={col} className="px-2 py-1.5 text-left font-medium">
                        {t(`audit.propertyColumns.${col}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {job.properties.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-2 py-1.5 font-mono">{row.propertyNo || row.propertyId}</td>
                      <td className="px-2 py-1.5">{row.owner}</td>
                      <td className="px-2 py-1.5">{row.taxHead}</td>
                      <td className="px-2 py-1.5">{t('audit.amountDisplay', { amount: row.amount.toLocaleString() })}</td>
                      <td className="px-2 py-1.5">
                        <span className={cn('rounded-full px-1.5 py-0.5 text-xs font-medium', PROP_STATUS_STYLE[row.status] ?? 'bg-gray-100 text-gray-600')}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-gray-500">{row.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const TABLE_COLS: (keyof AuditJobRow)[] = [
  'jobId', 'dateTime', 'operation', 'doneBy', 'scope',
  'startTime', 'completeTime', 'duration', 'records', 'status', 'remarks',
];

export function AuditMonitorTab({ api }: Props) {
  const t = useTranslations('addTaxes');

  return (
    <div className="flex flex-col gap-4">
      {/* KPI strip */}
      <AuditKpiStrip jobs={api.auditJobs} t={t} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
        <input
          type="text"
          value={api.auditFilters.search}
          onChange={(e) => api.setAuditFilters({ ...api.auditFilters, search: e.target.value })}
          placeholder={t('audit.filterSearch')}
          className="min-w-48 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={api.auditFilters.operation}
          onChange={(e) => api.setAuditFilters({ ...api.auditFilters, operation: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{t('audit.allOperations')}</option>
          <option value="AddTax">{t('operations.labels.addTax')}</option>
          <option value="QuarterlyAdd">{t('operations.labels.quarterlyAdd')}</option>
          <option value="RemoveTax">{t('operations.labels.removeTax')}</option>
        </select>
        <select
          value={api.auditFilters.status}
          onChange={(e) => api.setAuditFilters({ ...api.auditFilters, status: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">{t('audit.allStatus')}</option>
          <option value="Running">{t('audit.statuses.running')}</option>
          <option value="Completed">{t('audit.statuses.completed')}</option>
          <option value="Failed">{t('audit.statuses.failed')}</option>
        </select>
        <input
          type="date"
          value={api.auditFilters.date}
          onChange={(e) => api.setAuditFilters({ ...api.auditFilters, date: e.target.value })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={api.loadAudit}
          disabled={api.isLoadingAudit}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {t('audit.filterApply')}
        </button>
        <button
          type="button"
          onClick={api.loadAudit}
          disabled={api.isLoadingAudit}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          aria-label={t('audit.refresh')}
        >
          <RefreshCw className={cn('h-4 w-4', api.isLoadingAudit && 'animate-spin')} />
          {t('audit.refresh')}
        </button>
      </div>

      {/* Audit jobs table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              {TABLE_COLS.map((col) => (
                <th key={col} className="px-3 py-2.5 text-left font-medium">
                  {t(`audit.table.${col}`)}
                </th>
              ))}
              <th className="px-3 py-2.5 text-left font-medium">{t('audit.table.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {api.auditJobs.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COLS.length + 1} className="px-4 py-8 text-center text-sm text-gray-400">
                  {t('messages.noJobSelected')}
                </td>
              </tr>
            ) : (
              api.auditJobs.map((job) => (
                <tr
                  key={job.jobId}
                  className={cn(
                    'cursor-pointer hover:bg-gray-50',
                    api.selectedJob?.jobId === job.jobId && 'bg-blue-50',
                  )}
                  onClick={() => api.selectJob(job.jobId)}
                >
                  <td className="px-3 py-2 font-mono text-blue-700">{job.jobId}</td>
                  <td className="px-3 py-2">{job.dateTime}</td>
                  <td className="px-3 py-2">{job.operation}</td>
                  <td className="px-3 py-2">{job.doneBy}</td>
                  <td className="px-3 py-2">{job.scope}</td>
                  <td className="px-3 py-2">{job.startTime}</td>
                  <td className="px-3 py-2">{job.completeTime ?? '—'}</td>
                  <td className="px-3 py-2">{job.duration}</td>
                  <td className="px-3 py-2">{job.records}</td>
                  <td className="px-3 py-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', JOB_STATUS_STYLE[job.status] ?? 'bg-gray-100 text-gray-600')}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-500">{job.remarks ?? '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); api.selectJob(job.jobId); }}
                      className="rounded px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      {t('audit.table.view')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {api.auditTotalCount > api.auditPageSize && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {t('audit.paginationShowing', {
              from: (api.auditPageNumber - 1) * api.auditPageSize + 1,
              to: Math.min(api.auditPageNumber * api.auditPageSize, api.auditTotalCount),
              total: api.auditTotalCount,
            })}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={api.auditPageNumber <= 1}
              onClick={() => api.setAuditPage(api.auditPageNumber - 1)}
              className="rounded border px-2 py-1 hover:bg-gray-100 disabled:opacity-40"
            >
              ‹
            </button>
            <span className="rounded border px-2 py-1 font-medium">{api.auditPageNumber}</span>
            <button
              type="button"
              disabled={api.auditPageNumber * api.auditPageSize >= api.auditTotalCount}
              onClick={() => api.setAuditPage(api.auditPageNumber + 1)}
              className="rounded border px-2 py-1 hover:bg-gray-100 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Job detail panel */}
      {api.selectedJob ? (
        <JobDetailPanel job={api.selectedJob} t={t} />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-400">
          {t('messages.noJobSelected')}
        </div>
      )}
    </div>
  );
}

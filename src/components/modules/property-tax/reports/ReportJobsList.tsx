'use client';

import { useMemo } from 'react';
import { MasterTable, Badge, Card } from '@/components/common';
import type { Column } from '@/components/common';
import type { ReportJob, ReportJobStatus, ReportJobsListProps } from '@/types/report.types';

type BadgeVariant = 'success' | 'destructive' | 'warning' | 'secondary';

const STATUS_VARIANT: Record<ReportJobStatus, BadgeVariant> = {
  Completed: 'success',
  Failed: 'destructive',
  Cancelled: 'destructive',
  Pending: 'warning',
  Processing: 'warning',
  Retrying: 'warning',
};

function formatDate(value: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString();
}

export function ReportJobsList({ jobs, loading, copy, reportDefinitions }: ReportJobsListProps) {
  const reportNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of reportDefinitions) map.set(d.reportCode, d.reportName);
    return map;
  }, [reportDefinitions]);

  const columns: Column<ReportJob>[] = [
    {
      key: 'reportCode',
      label: copy.columns.report,
      render: (_v, row) => reportNameByCode.get(row.reportCode) ?? row.reportCode,
    },
    {
      key: 'status',
      label: copy.columns.status,
      align: 'center',
      render: (_v, row) => (
        <Badge variant={STATUS_VARIANT[row.status]} dot={STATUS_VARIANT[row.status] === 'warning'}>
          {copy.statuses[row.status]}
        </Badge>
      ),
    },
    {
      key: 'createdDate',
      label: copy.columns.requested,
      render: (_v, row) => formatDate(row.createdDate),
    },
    {
      key: 'completedDate',
      label: copy.columns.completed,
      render: (_v, row) => formatDate(row.completedDate),
    },
  ];

  return (
    <Card className="rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{copy.title}</h2>
      <MasterTable<ReportJob>
        columns={columns}
        data={jobs}
        loading={loading}
        getRowKey={(row) => row.reportRequestId}
        paginationConfig={{ enabled: false }}
        renderActions={(row) =>
          row.downloadAvailable ? (
            // Direct link - the proxy returns Content-Disposition: attachment, so the browser
            // streams the PDF to disk without buffering it in JS memory.
            <a
              href={`/api/report-download/${encodeURIComponent(row.reportRequestId)}`}
              className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
            >
              {copy.download}
            </a>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )
        }
      />
      {!loading && jobs.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-6">{copy.empty}</p>
      )}
    </Card>
  );
}

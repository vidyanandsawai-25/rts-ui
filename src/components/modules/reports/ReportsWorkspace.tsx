'use client';

import { ReportGenerationForm } from '@/components/modules/reports/ReportGenerationForm';
import { ReportJobsList } from '@/components/modules/reports/ReportJobsList';
import { useReportJobs } from '@/hooks/useReportJobs';
import type { ReportsWorkspaceProps } from '@/types/report.types';

/**
 * Client shell for the reports page: owns the live jobs list and wires the form's
 * onQueued callback to refresh it immediately after a request is submitted.
 */
export function ReportsWorkspace({ copy, jobsCopy, reportDefinitions, zones }: ReportsWorkspaceProps) {
  const { jobs, isLoading, refresh } = useReportJobs();

  return (
    <div className="flex flex-col gap-8">
      <ReportGenerationForm
        copy={copy}
        reportDefinitions={reportDefinitions}
        zones={zones}
        onQueued={refresh}
      />
      <ReportJobsList
        jobs={jobs}
        loading={isLoading}
        copy={jobsCopy}
        reportDefinitions={reportDefinitions}
      />
    </div>
  );
}

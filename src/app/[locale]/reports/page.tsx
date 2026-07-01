import { getTranslations } from 'next-intl/server';
import { getReportDefinitions, getZones } from '@/lib/api/report.service';
import { ReportsWorkspace } from '@/components/modules/reports/ReportsWorkspace';
import type { ReportFormCopy, ReportJobsCopy } from '@/types/report.types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReportsPage({ params }: PageProps) {
  const { locale } = await params;

  const [t, reportDefinitions, zones] = await Promise.all([
    getTranslations({ locale, namespace: 'report' }),
    getReportDefinitions().catch(() => []),
    getZones().catch(() => []),
  ]);

  const copy: ReportFormCopy = {
    pageTitle: t('pageTitle'),
    pageSubtitle: t('pageSubtitle'),
    fields: {
      reportType: t('fields.reportType'),
    },
    buttons: {
      generate: t('buttons.generate'),
      reset: t('buttons.reset'),
    },
    placeholders: {
      selectReport: t('placeholders.selectReport'),
      selectZone: t('placeholders.selectZone'),
      selectWard: t('placeholders.selectWard'),
      selectProperty: t('placeholders.selectProperty'),
      selectPartition: t('placeholders.selectPartition'),
      pendingZone: t('placeholders.pendingZone'),
      pendingWard: t('placeholders.pendingWard'),
      pendingProperty: t('placeholders.pendingProperty'),
    },
    validation: {
      reportRequired: t('validation.reportRequired'),
      dateRangeInvalid: t('validation.dateRangeInvalid'),
    },
    success: {
      downloaded: t('success.downloaded'),
    },
    errors: {
      generationFailed: t('errors.generationFailed'),
      loadFailed: t('errors.loadFailed'),
    },
    proTip: {
      title: t('proTip.title'),
      body: t('proTip.body'),
    },
  };

  const jobsCopy: ReportJobsCopy = {
    title: t('jobs.title'),
    refresh: t('jobs.refresh'),
    empty: t('jobs.empty'),
    download: t('jobs.download'),
    columns: {
      report: t('jobs.columns.report'),
      status: t('jobs.columns.status'),
      requested: t('jobs.columns.requested'),
      completed: t('jobs.columns.completed'),
      actions: t('jobs.columns.actions'),
    },
    statuses: {
      Pending: t('jobs.statuses.pending'),
      Processing: t('jobs.statuses.processing'),
      Completed: t('jobs.statuses.completed'),
      Failed: t('jobs.statuses.failed'),
      Cancelled: t('jobs.statuses.cancelled'),
      Retrying: t('jobs.statuses.retrying'),
    },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{copy.pageTitle}</h1>
        <p className="mt-1 text-sm text-gray-500">{copy.pageSubtitle}</p>
      </header>
      <ReportsWorkspace
        copy={copy}
        jobsCopy={jobsCopy}
        reportDefinitions={reportDefinitions}
        zones={zones}
      />
    </div>
  );
}

import { getTranslations } from 'next-intl/server';
import { getReportDefinitions, getZones } from '@/lib/api/report.service';
import { ReportsWorkspace } from '@/components/modules/reports/ReportsWorkspace';
import type { ReportFormCopy, ReportJobsCopy } from '@/types/report.types';
import { PageContainer } from '@/components/common';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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

  const goHomeAction = (
    <Link
      href={`/${locale}/home`}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('error.goHome')}
    </Link>
  );

  return (
    <PageContainer
      title={copy.pageTitle}
      subtitle={copy.pageSubtitle}
      actions={goHomeAction}
      className="p-6 w-full flex flex-col gap-6"
    >
      <ReportsWorkspace
        copy={copy}
        jobsCopy={jobsCopy}
        reportDefinitions={reportDefinitions}
        zones={zones}
      />
    </PageContainer>
  );
}



import { getTranslations } from 'next-intl/server';
import { getReportDefinitions, getZones } from '@/lib/api/report.service';
import { getFinancialYearsPaged } from '@/lib/api/financial-year.service';
import { ReportsWorkspace } from '@/components/modules/property-tax/reports/ReportsWorkspace';
import type { ReportFormCopy, ReportJobsCopy, ReportWorkspaceCopy, ReportParamsPanelCopy } from '@/types/report.types';
import { PageContainer, TableHeader } from '@/components/common';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReportsPage({ params }: PageProps) {
  const { locale } = await params;

  const [t, reportDefinitions, zones, financialYears] = await Promise.all([
    getTranslations({ locale, namespace: 'report' }),
    getReportDefinitions().catch(() => []),
    getZones().catch(() => []),
    getFinancialYearsPaged(1, 100).then((res) => res.items || []).catch(() => []),
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

  const workspaceCopy: ReportWorkspaceCopy = {
    steps: {
      selectCategory: t('workspace.steps.selectCategory'),
      selectReport: t('workspace.steps.selectReport'),
      setParameters: t('workspace.steps.setParameters'),
    },
    categories: {
      assessment: t('workspace.categories.assessment'),
      amc: t('workspace.categories.amc'),
      transaction: t('workspace.categories.transaction'),
      approval: t('workspace.categories.approval'),
      discount: t('workspace.categories.discount'),
      others: t('workspace.categories.others'),
    },
    reportsCount: t.raw('workspace.reportsCount'),
    emptyState: {
      title: t('workspace.emptyState.title'),
      subtitle: t('workspace.emptyState.subtitle'),
    },
    noReportsFound: t('workspace.noReportsFound'),
    reportsHeader: t.raw('workspace.reportsHeader'),
    configureParameters: t('workspace.configureParameters'),
    generating: {
      title: t('workspace.generating.title'),
      subtitle: t('workspace.generating.subtitle'),
      cancel: t('workspace.generating.cancel'),
    },
    preview: {
      title: t('workspace.preview.title'),
      downloadPdf: t('workspace.preview.downloadPdf'),
    },
    confirm: {
      title: t('workspace.confirm.title'),
      description: t('workspace.confirm.description'),
      btnGo: t('workspace.confirm.btnGo'),
      btnClose: t('workspace.confirm.btnClose'),
    },
  };

  const paramsCopy: ReportParamsPanelCopy = {
    emptyState: t('params.emptyState'),
    financialYear: t('params.financialYear'),
    zoneNo: t('params.zoneNo'),
    wardNo: t('params.wardNo'),
    propertySelection: t('params.propertySelection'),
    propertyNo: t('params.propertyNo'),
    fromPropertyToProperty: t('params.fromPropertyToProperty'),
    fromProperty: t('params.fromProperty'),
    toProperty: t('params.toProperty'),
    selectYear: t('params.selectYear'),
    selectZone: t('params.selectZone'),
    selectWard: t('params.selectWard'),
    selectProperty: t('params.selectProperty'),
    selectStartProperty: t('params.selectStartProperty'),
    selectEndProperty: t('params.selectEndProperty'),
    loading: t('params.loading'),
    selectZoneFirst: t('params.selectZoneFirst'),
    selectWardFirst: t('params.selectWardFirst'),
    validation: {
      financialYearRequired: t('params.validation.financialYearRequired'),
      zoneRequired: t('params.validation.zoneRequired'),
      wardRequired: t('params.validation.wardRequired'),
      fillAllRequired: t('params.validation.fillAllRequired'),
      networkError: t('params.validation.networkError'),
      failedToQueue: t('params.validation.failedToQueue'),
    },
    queuedSuccess: t('params.queuedSuccess'),
    reportQueued: t.raw('params.reportQueued'),
    buttons: {
      reset: t('params.buttons.reset'),
      generate: t('params.buttons.generate'),
      queuing: t('params.buttons.queuing'),
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
      className="p-6 w-full flex flex-col gap-6"
    >
      <TableHeader
        title={copy.pageTitle}
        subtitle={copy.pageSubtitle}
        icon="fileText"
        rightContent={goHomeAction}
      />
      <ReportsWorkspace
        copy={copy}
        jobsCopy={jobsCopy}
        workspaceCopy={workspaceCopy}
        paramsCopy={paramsCopy}
        reportDefinitions={reportDefinitions}
        zones={zones}
        financialYears={financialYears}
      />
    </PageContainer>
  );
}




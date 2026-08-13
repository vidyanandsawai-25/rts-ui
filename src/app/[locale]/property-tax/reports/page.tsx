import { getTranslations } from 'next-intl/server';
import { getReportDefinitions, getZones, getReportModules } from '@/lib/api/report.service';
import { getFinancialYearsPaged } from '@/lib/api/financial-year.service';
import { getWardsByZoneAction, getPropertiesByWardAction, fetchReportJobs, getReportParametersAction, createReportRequestAction } from '@/app/[locale]/property-tax/reports/action';
import { ReportsWorkspace } from '@/components/modules/property-tax/reports/ReportsWorkspace';
import { PageContainer, TableHeader } from '@/components/common';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buildFormCopy, buildJobsCopy, buildWorkspaceCopy, buildParamsCopy } from './reports-copy';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReportsPage({ params }: PageProps) {
  const { locale } = await params;

  const [t, reportDefinitions, reportModules, zones, financialYears, initialJobs] = await Promise.all([
    getTranslations({ locale, namespace: 'report' }),
    getReportDefinitions().catch(() => []),
    getReportModules().catch(() => []),
    getZones().catch(() => []),
    getFinancialYearsPaged(1, 100).then((res) => res.items || []).catch(() => []),
    fetchReportJobs(25).catch(() => []),
  ]);

  const copy = buildFormCopy(t);
  const jobsCopy = buildJobsCopy(t);
  const workspaceCopy = buildWorkspaceCopy(t);
  const paramsCopy = buildParamsCopy(t);

  const goHomeAction = (
    <Link
      href={`/${locale}/home`}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {t('error.goHome')}
    </Link>
  );

  return (
    <PageContainer className="p-4 pt-2 w-full flex flex-col gap-3">
      <TableHeader
        title={copy.pageTitle}
        subtitle={copy.pageSubtitle}
        icon="fileText"
        rightContent={goHomeAction}
        className="py-2 sm:py-2.5 px-3 sm:px-4"
      />
      <ReportsWorkspace
        copy={copy}
        jobsCopy={jobsCopy}
        workspaceCopy={workspaceCopy}
        paramsCopy={paramsCopy}
        reportDefinitions={reportDefinitions}
        reportModules={reportModules}
        zones={zones}
        financialYears={financialYears}
        fetchWards={getWardsByZoneAction}
        fetchProperties={getPropertiesByWardAction}
        initialJobs={initialJobs}
        fetchJobs={fetchReportJobs}
        fetchReportParameters={getReportParametersAction}
        createReportRequest={createReportRequestAction}
      />
    </PageContainer>
  );
}

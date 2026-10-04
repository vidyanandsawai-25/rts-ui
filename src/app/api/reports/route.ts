import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';
import type { DesignerTemplateSummary } from '@/types/report-designer.types';

export const dynamic = 'force-dynamic';

function comparableCode(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

// Retired reports stay hidden even if an older published template still exists
// in the database. Remove a code from this set only when the report is restored.
const RETIRED_REPORT_CODES = new Set([
  comparableCode('TransferCertificateReport'),
  comparableCode('TRANSFER_CERTIFICATE'),
]);

function isRetiredReport(reportCode: string): boolean {
  return RETIRED_REPORT_CODES.has(comparableCode(reportCode));
}

interface RegisteredReport {
  id: string;
  name: string;
  category?: string;
  dataProvider?: string;
  paperSize?: string;
  orientation?: string;
}

async function getRegisteredReports(): Promise<RegisteredReport[]> {
  try {
    const registryPath = path.join(process.cwd(), 'public', 'reports', 'reports_registry.json');
    const content = await readFile(registryPath, 'utf8');
    const data = JSON.parse(content) as { reports?: RegisteredReport[] };
    return Array.isArray(data.reports) ? data.reports : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const [dbResult, registeredReports] = await Promise.all([
    apiClient.get<DesignerTemplateSummary[]>('/designer-report-templates'),
    getRegisteredReports(),
  ]);

  const reportsMap = new Map<string, {
    id: string;
    reportCode: string;
    name: string;
    category: string;
    dataProviderCode: string;
    tenantScoped: boolean;
    paperSize: string;
    orientation: string;
    templateId: number | null;
    canDelete: boolean;
  }>();
  const visibleRegisteredReports = registeredReports.filter((report) => !isRetiredReport(report.id));
  const builtInReportCodes = new Set(visibleRegisteredReports.map((report) => comparableCode(report.id)));

  // 1. Add registered seed reports first
  visibleRegisteredReports.forEach((r) => {
    reportsMap.set(comparableCode(r.id), {
      id: r.id,
      reportCode: r.id,
      name: r.name,
      category: r.category || 'PROPERTY_TAX',
      dataProviderCode: r.dataProvider || 'UnassignedReportDataProvider',
      tenantScoped: true,
      paperSize: r.paperSize || 'A4',
      orientation: r.orientation || 'portrait',
      templateId: null,
      canDelete: false,
    });
  });

  // 2. Overlay or append database templates (takes precedence for name / category)
  if (dbResult.success && Array.isArray(dbResult.data)) {
    dbResult.data.forEach((template) => {
      const reportKey = comparableCode(template.reportCode);
      if (isRetiredReport(template.reportCode)) {
        return;
      }

      const tenantScoped = template.tenantId !== null;
      const registeredReport = reportsMap.get(reportKey);
      reportsMap.set(reportKey, {
        id: template.reportCode,
        reportCode: template.reportCode,
        name: (template.reportName || '').replace(/\s+/g, ' ').trim(),
        category: template.moduleCode || 'PROPERTY_TAX',
        // Template summaries expose the data-source code, not the execution
        // provider code. Preserve the provider declared by a registered report
        // when its database template is overlaid.
        dataProviderCode: registeredReport?.dataProviderCode || template.dataSourceCode || '',
        tenantScoped,
        paperSize: registeredReport?.paperSize || 'A4',
        orientation: registeredReport?.orientation || 'portrait',
        templateId: template.id,
        canDelete: tenantScoped && !builtInReportCodes.has(reportKey),
      });
    });
  }

  return NextResponse.json({ reports: Array.from(reportsMap.values()) });
}

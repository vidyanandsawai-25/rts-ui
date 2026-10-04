import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';
import type {
  DesignerReportSettings,
  DesignerReportSettingsOptions,
  DesignerTemplateSummary,
} from '@/types/report-designer.types';

export const dynamic = 'force-dynamic';

function comparableCode(value: string): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase();
}

async function resolveTemplate(reportId: string): Promise<DesignerTemplateSummary | undefined> {
  const result = await apiClient.get<DesignerTemplateSummary[]>('/designer-report-templates');
  if (!result.success || !Array.isArray(result.data)) return undefined;
  return result.data.find((item) =>
    String(item.id) === reportId || comparableCode(item.reportCode) === comparableCode(reportId));
}

export async function GET(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get('reportId') || '';
  const optionsResult = await apiClient.get<DesignerReportSettingsOptions>(
    '/designer-report-templates/settings/options',
  );
  if (!optionsResult.success || !optionsResult.data) {
    return NextResponse.json(
      { error: optionsResult.error || 'Report settings options could not be loaded.' },
      { status: optionsResult.statusCode || 502 },
    );
  }

  const summary = reportId ? await resolveTemplate(reportId) : undefined;
  if (!summary) return NextResponse.json({ settings: null, options: optionsResult.data });

  const settingsResult = await apiClient.get<DesignerReportSettings>(
    `/designer-report-templates/${summary.id}/settings`,
  );
  if (!settingsResult.success || !settingsResult.data) {
    return NextResponse.json(
      { error: settingsResult.error || 'Report settings could not be loaded.' },
      { status: settingsResult.statusCode || 502 },
    );
  }
  return NextResponse.json({ settings: settingsResult.data, options: optionsResult.data });
}

export async function PUT(request: NextRequest) {
  const body = await request.json() as { templateId?: number; settings?: Partial<DesignerReportSettings> };
  if (!body.templateId || !body.settings) {
    return NextResponse.json({ error: 'A saved template and report settings are required.' }, { status: 400 });
  }

  const settings = body.settings;
  const result = await apiClient.put<DesignerReportSettings>(
    `/designer-report-templates/${body.templateId}/settings`,
    {
      reportName: settings.reportName,
      moduleId: settings.moduleId ?? null,
      tenantScope: settings.tenantScope ?? 'CurrentTenant',
      tenantId: settings.tenantId ?? null,
      isActive: settings.isActive ?? true,
      dataSourceCode: settings.dataSourceCode || 'UNASSIGNED',
      dataProviderCode: settings.dataProviderCode || 'UnassignedReportDataProvider',
      parameters: settings.parameters || [],
    },
  );
  if (!result.success || !result.data) {
    return NextResponse.json(
      { error: result.error || 'Report settings could not be saved.' },
      { status: result.statusCode || 502 },
    );
  }
  return NextResponse.json({ success: true, settings: result.data });
}

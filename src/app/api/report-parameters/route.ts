import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';
import type { DesignerReportParameter } from '@/types/report-designer.types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get('reportId') || '';
  if (!reportId)
    return NextResponse.json({ error: 'A report ID is required.' }, { status: 400 });

  const result = await apiClient.get<DesignerReportParameter[]>(
    `/designer-report-templates/parameters/${encodeURIComponent(reportId)}`,
  );
  if (!result.success || !Array.isArray(result.data)) {
    return NextResponse.json(
      { error: result.error || 'Report parameters could not be loaded.', parameters: [] },
      { status: result.statusCode || 502 },
    );
  }

  return NextResponse.json({
    parameters: result.data
      .filter((parameter) => parameter.isActive !== false)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((parameter) => ({
        id: parameter.id,
        name: parameter.key,
        label: parameter.label,
        dataType: parameter.type,
        isRequired: parameter.isRequired,
        cascadeFromKey: parameter.cascadeFromKey ?? null,
      })),
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { createBlankClassicReportDefinition } from '@/lib/report-designer/classic-adapter';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get('reportId')?.trim() || '';
  if (!reportId)
    return NextResponse.json({ error: 'A report ID is required.' }, { status: 400 });

  return NextResponse.json({
    success: true,
    message: 'Report canvas reset to a blank A4 layout. Save to persist it for this tenant.',
    data: createBlankClassicReportDefinition(reportId),
  });
}

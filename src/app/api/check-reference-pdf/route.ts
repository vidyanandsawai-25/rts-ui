import { NextRequest, NextResponse } from 'next/server';
import { getReferencePdfAsset } from '@/lib/report-designer/template-source-assets.server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const reportId = request.nextUrl.searchParams.get('reportId')?.trim() || '';
  if (!reportId) {
    return NextResponse.json({ error: 'A report ID is required.', exists: false }, { status: 400 });
  }

  try {
    const asset = await getReferencePdfAsset(reportId);
    return NextResponse.json({
      success: true,
      reportId,
      exists: Boolean(asset),
      size: asset?.sizeBytes ?? 0,
      fileName: asset?.fileName ?? null,
      url: asset ? `/api/reference-pdf?reportId=${encodeURIComponent(reportId)}` : null,
    });
  } catch (error) {
    console.error('Reference PDF status lookup failed:', error);
    return NextResponse.json({ exists: false, error: 'Reference PDF status could not be loaded.' }, { status: 500 });
  }
}

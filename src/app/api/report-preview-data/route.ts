import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dataProviderParam = searchParams.get('dataProvider') || searchParams.get('provider') || '';
  const reportCode = searchParams.get('reportCode') || searchParams.get('reportId') || '';
  const propertyNo = searchParams.get('propertyNo') || '';
  const wardId = searchParams.get('wardId') || '';
  const propertyId = searchParams.get('propertyId') || '';

  const target = dataProviderParam || reportCode;
  if (!target) {
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: 'Data provider or report code is required.',
      },
      { status: 400 }
    );
  }

  // Build query string
  const qsParams = new URLSearchParams();
  if (propertyNo) qsParams.set('propertyNo', propertyNo);
  if (wardId) qsParams.set('wardId', wardId);
  if (propertyId) qsParams.set('propertyId', propertyId);
  const qs = qsParams.toString() ? `?${qsParams.toString()}` : '';

  try {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/designer-report-templates/preview-data/${encodeURIComponent(target)}${qs}`
    );

    if (result && result.success && Array.isArray(result.data)) {
      return NextResponse.json({
        success: true,
        data: result.data,
        count: result.data.length,
        error: result.data.length === 0 ? 'डेटाबेसमध्ये या मालमत्तेसाठी डेटा सापडला नाही (No records found in database)' : null
      });
    }

    return NextResponse.json({
      success: false,
      data: [],
      error: result?.error || 'डेटाबेसमधून डेटा लोड करता आला नाही (Failed to load database records)'
    }, { status: result?.statusCode || 500 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Database connection error';
    return NextResponse.json({
      success: false,
      data: [],
      error: msg
    }, { status: 500 });
  }
}

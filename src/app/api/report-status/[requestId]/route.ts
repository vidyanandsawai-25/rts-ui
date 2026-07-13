import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';

/**
 * Returns the status of a queued report request. Proxies GET {base}/Report/status/{id}.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
): Promise<NextResponse> {
  try {
    const { requestId } = await params;

    const result = await apiClient.get<any>(`/Report/status/${encodeURIComponent(requestId)}`);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch status' },
        { status: result.statusCode || 500 },
      );
    }

    return NextResponse.json(result.data, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

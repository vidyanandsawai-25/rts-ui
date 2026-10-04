import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<NextResponse> {
  try {
    const { jobId } = await params;
    if (!/^[a-f0-9-]{36}$/i.test(jobId)) {
      return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 });
    }

    const result = await apiClient.get<unknown>(
      `/designer-report-jobs/${encodeURIComponent(jobId)}`,
    );
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch HTML report status' },
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

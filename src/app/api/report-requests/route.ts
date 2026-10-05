import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';

/**
 * Lists the caller's recent report requests. Proxies GET {base}/Report/requests?take=N.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const takeParam = request.nextUrl.searchParams.get('take');
    const take = Number(takeParam);
    const safeTake = Number.isFinite(take) && take > 0 && take <= 100 ? Math.trunc(take) : 25;

    const result = await apiClient.get<unknown>(`/Report/requests?take=${safeTake}`);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch reports' },
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

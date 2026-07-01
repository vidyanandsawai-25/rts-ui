import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { serverFetch } from '@/lib/utils/server-fetch';

/**
 * Lists the caller's recent report requests. Proxies GET {base}/Report/requests?take=N.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim().replace(/\/+$/, '');
    if (!baseUrl) {
      return NextResponse.json({ error: 'Backend API base URL is not configured' }, { status: 500 });
    }

    const takeParam = request.nextUrl.searchParams.get('take');
    const take = Number(takeParam);
    const safeTake = Number.isFinite(take) && take > 0 && take <= 100 ? Math.trunc(take) : 25;

    const upstream = await serverFetch(`${baseUrl}/Report/requests?take=${safeTake}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: text || 'Failed to fetch reports' }, { status: upstream.status });
    }

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

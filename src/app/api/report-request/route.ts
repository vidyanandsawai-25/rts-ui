import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { serverFetch } from '@/lib/utils/server-fetch';

/**
 * Queues an async report request. Proxies POST {base}/Report/request and returns the
 * { reportRequestId, status } envelope the client polls on.
 *
 * userId is read from the user_id cookie server-side and merged into parameters
 * automatically - the client UI does NOT need to send it.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Inject userId from session cookie - never exposed to the browser UI
    const userId = cookieStore.get('user_id')?.value;

    // Merge userId into parameters; client-supplied value (if any) is overridden for security
    const enrichedBody = {
      ...body,
      parameters: {
        ...(body.parameters ?? {}),
        ...(userId ? { userId, UserId: userId } : {}),
      },
    };

    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim().replace(/\/+$/, '');
    if (!baseUrl) {
      return NextResponse.json({ error: 'Backend API base URL is not configured' }, { status: 500 });
    }

    const upstream = await serverFetch(`${baseUrl}/Report/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(enrichedBody),
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return NextResponse.json({ error: text || 'Failed to queue report' }, { status: upstream.status });
    }

    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


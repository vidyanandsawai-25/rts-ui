import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/services/api.service';

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

    const result = await apiClient.post<unknown>('/Report/request', enrichedBody);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to queue report' },
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


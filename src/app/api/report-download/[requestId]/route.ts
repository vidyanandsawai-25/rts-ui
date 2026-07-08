import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { serverFetch } from '@/lib/utils/server-fetch';

/**
 * Streams the finished PDF for a completed report request. Proxies GET {base}/Report/download/{id}.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
): Promise<NextResponse> {
  try {
    const { requestId } = await params;

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

    const downloadUrl = `${baseUrl}/Report/download/${encodeURIComponent(requestId)}`;
    const upstream = await serverFetch(downloadUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });


    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'Download failed');
      return NextResponse.json({ error: errText || 'Download failed' }, { status: upstream.status });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Cache-Control', 'no-store');
    
    let contentType = upstream.headers.get('Content-Type') ?? 'application/pdf';
    if (contentType === 'application/octet-stream') {
      contentType = 'application/pdf';
    }
    responseHeaders.set('Content-Type', contentType);
    
    // Read the query params safely using standard URL constructor
    const parsedUrl = new URL(_request.url);
    const inline = parsedUrl.searchParams.get('inline') === 'true';
    if (inline) {
      responseHeaders.set('Content-Disposition', 'inline');
    } else {
      responseHeaders.set(
        'Content-Disposition',
        upstream.headers.get('Content-Disposition') ?? `attachment; filename="${requestId}.pdf"`,
      );
    }
    
    const contentLength = upstream.headers.get('Content-Length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    return new NextResponse(upstream.body, { status: 200, headers: responseHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

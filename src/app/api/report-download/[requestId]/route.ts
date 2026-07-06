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
  console.log(`[report-download API] GET request received for requestId:`, _request.url);
  try {
    const { requestId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      console.warn(`[report-download API] Unauthorized request - no token`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim().replace(/\/+$/, '');
    if (!baseUrl) {
      console.error(`[report-download API] Base URL not configured`);
      return NextResponse.json({ error: 'Backend API base URL is not configured' }, { status: 500 });
    }

    const downloadUrl = `${baseUrl}/Report/download/${encodeURIComponent(requestId)}`;
    console.log(`[report-download API] Fetching upstream: ${downloadUrl}`);
    const upstream = await serverFetch(downloadUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`[report-download API] Upstream response status: ${upstream.status}, ok: ${upstream.ok}`);

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'Download failed');
      console.error(`[report-download API] Upstream failed with text:`, errText);
      return NextResponse.json({ error: errText || 'Download failed' }, { status: upstream.status });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('Content-Type', upstream.headers.get('Content-Type') ?? 'application/pdf');
    
    // Read the query params safely using standard URL constructor
    const parsedUrl = new URL(_request.url);
    const inline = parsedUrl.searchParams.get('inline') === 'true';
    console.log(`[report-download API] Inline param is: ${inline}`);

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

    console.log(`[report-download API] Returning response with headers:`, Object.fromEntries(responseHeaders.entries()));
    return new NextResponse(upstream.body, { status: 200, headers: responseHeaders });
  } catch (err: any) {
    console.error(`[report-download API] Exception occurred:`, err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

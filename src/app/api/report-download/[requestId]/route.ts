import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';

/**
 * Streams the finished PDF for a completed report request. Proxies GET {base}/Report/download/{id}.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
): Promise<NextResponse> {
  try {
    const { requestId } = await params;

    const upstream = await apiClient.fetch(`/Report/download/${encodeURIComponent(requestId)}`);


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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMsg }, { status: 500 });
  }
}

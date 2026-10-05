import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiClient } from '@/services/api.service';

/**
 * Sanitizes a string to be safe for use as a filename token in Content-Disposition header.
 * Removes quotes, CRLF, and other unsafe characters to prevent header injection.
 */
function sanitizeFilename(input: unknown): string {
  if (typeof input !== 'string' || !input) return 'report';
  // Remove CRLF, quotes, backslashes, and control characters; keep only safe filename chars
  return input
    .replace(/[\r\n\x00-\x1f"'\\/:*?<>|]/g, '')
    .slice(0, 100) || 'report';
}

/**
 * Synchronously generates and downloads a report. Proxies POST {base}/Report/generate and returns the
 * PDF stream directly.
 *
 * userId is read from the user_id cookie server-side and merged into parameters
 * automatically - the client UI does NOT need to send it.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    const enrichedBody = {
      ...body,
      parameters: {
        ...(body.parameters ?? {}),
        ...(userId ? { userId, UserId: userId } : {}),
      },
    };

    // Use apiClient.fetch directly to get the binary stream response
    const upstream = await apiClient.fetch('/Report/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedBody),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => 'Generation failed');
      return NextResponse.json({ error: errText || 'Generation failed' }, { status: upstream.status });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Cache-Control', 'no-store');
    
    let contentType = upstream.headers.get('Content-Type') ?? 'application/pdf';
    if (contentType === 'application/octet-stream') {
      contentType = 'application/pdf';
    }
    responseHeaders.set('Content-Type', contentType);
    
    const safeFilename = sanitizeFilename(body.reportCode);
    responseHeaders.set(
      'Content-Disposition',
      upstream.headers.get('Content-Disposition') ?? `attachment; filename="${safeFilename}.pdf"`,
    );
    
    const contentLength = upstream.headers.get('Content-Length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    return new NextResponse(upstream.body, { status: 200, headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

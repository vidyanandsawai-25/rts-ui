import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { getAppConfig } from '@/config/app.config';

// Force Node.js runtime — SignalR JS client requires Node.js WebSocket APIs.
export const runtime = 'nodejs';

/**
 * Server-Sent Events proxy for SignalR report status updates.
 *
 * The browser connects here with EventSource('/api/report-events').
 * This route connects to the platform's SignalR hub server-side using the
 * session JWT from the httpOnly cookie — no token is ever sent to the browser.
 *
 * Events streamed to the browser:
 *   data: {"requestId":"...","status":"Completed"}
 */
export async function GET(request: NextRequest): Promise<Response> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_token')?.value;
  if (!sessionToken) return new Response('Unauthorized', { status: 401 });

  const config = getAppConfig();
  // baseUrl is e.g. "https://localhost:7293/api" — strip /api for the hub URL
  const apiBase = config.api.baseUrl?.trim().replace(/\/+$/, '');
  if (!apiBase) return new Response('Server misconfigured', { status: 500 });

  // Platform base without /api suffix — needed for the hub URL and hub-token endpoint
  const platformBase = apiBase.replace(/\/api$/i, '');

  // Get a short-lived hub token (server → server, session JWT never leaves Next.js)
  const hubTokenRes = await fetch(`${apiBase}/Report/hub-token`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
    cache: 'no-store',
  });
  if (!hubTokenRes.ok) return new Response('Unauthorized', { status: 401 });
  const { hubToken } = (await hubTokenRes.json()) as { hubToken: string };

  const hubUrl = `${platformBase}/hubs/reports`;
  const encoder = new TextEncoder();

  let conn: HubConnection | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial comment so the browser EventSource knows the connection is alive
      controller.enqueue(encoder.encode(': connected\n\n'));

      // Keepalive ping every 25 seconds (browser SSE auto-retries after ~30s silence)
      const keepaliveTimer = setInterval(() => {
        if (request.signal.aborted) return;
        try { controller.enqueue(encoder.encode(': keepalive\n\n')); } catch { /* closed */ }
      }, 25_000);

      conn = new HubConnectionBuilder()
        .withUrl(hubUrl, { accessTokenFactory: () => hubToken })
        .withAutomaticReconnect()
        .build();

      // Forward status change events to the browser — only reportRequestId and status,
      // no tokens, no sensitive data
      conn.on('ReportStatusChanged', (requestId: string, status: string) => {
        if (request.signal.aborted) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ requestId, status })}\n\n`),
          );
        } catch { /* stream already closed */ }
      });

      try {
        await conn.start();
        await conn.invoke('Subscribe');
      } catch {
        clearInterval(keepaliveTimer);
        try { controller.close(); } catch { /* already closed */ }
        return;
      }

      // Clean up when the browser closes the EventSource connection
      request.signal.addEventListener('abort', async () => {
        clearInterval(keepaliveTimer);
        try { await conn?.stop(); } catch { /* ignore */ }
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx response buffering
    },
  });
}

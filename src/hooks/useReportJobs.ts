'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchReportJobs } from '@/actions/report-actions';
import type { ReportJob, ReportJobStatus } from '@/types/report.types';

// Fallback poll interval — only used when SSE connection is not established.
const FALLBACK_POLL_MS = 15_000;
const IN_PROGRESS: ReadonlySet<ReportJobStatus> = new Set<ReportJobStatus>([
  'Pending',
  'Processing',
  'Retrying',
]);

function hasInProgress(jobs: ReportJob[]): boolean {
  return jobs.some((j) => IN_PROGRESS.has(j.status));
}

/**
 * Loads the caller's report jobs and subscribes to real-time status updates via SSE.
 *
 * Security: all platform communication happens server-side.
 * - Job list is fetched via Server Action (POST /_next/action/...) — no named API route,
 *   no token visible in the browser network tab.
 * - Real-time updates arrive via SSE (/api/report-events) — Next.js connects to SignalR
 *   server-side using the httpOnly session cookie; the browser only receives
 *   { requestId, status } event payloads, never any token.
 *
 * Fallback polling kicks in only when the SSE connection is not active.
 */
export function useReportJobs() {
  const [jobs, setJobs] = useState<ReportJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const sseConnectedRef = useRef(false); // true while SSE connection is open

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Fetch the current list via Server Action.
  // Schedules fallback poll only when SSE is not active and jobs are in progress.
  const load = useCallback(async () => {
    let keepPolling = true;
    try {
      const list = await fetchReportJobs(25);
      if (!mountedRef.current) return;
      setJobs(list);
      keepPolling = hasInProgress(list);
    } catch {
      // transient — keep polling
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        clearTimer();
        if (keepPolling && !sseConnectedRef.current) {
          timerRef.current = setTimeout(load, FALLBACK_POLL_MS);
        }
      }
    }
  }, [clearTimer]);

  // Public trigger: reload immediately (e.g. right after queuing a new report).
  const refresh = useCallback(() => {
    void load();
  }, [load]);

  // Open an SSE connection to /api/report-events.
  // Next.js connects to the platform's SignalR hub server-side — no token reaches the browser.
  useEffect(() => {
    mountedRef.current = true;
    void load();

    const sse = new EventSource('/api/report-events');
    sseRef.current = sse;

    sse.onopen = () => {
      sseConnectedRef.current = true;
      clearTimer(); // SSE is live — stop the fallback poll
    };

    sse.onmessage = (event) => {
      // Server sent a status change — reload the list immediately.
      // The event payload only contains { requestId, status } — no tokens.
      try {
        JSON.parse(event.data as string); // validate it's our event, not a keepalive
        clearTimer();
        void load();
      } catch {
        // keepalive comment (": keepalive") — ignore
      }
    };

    sse.onerror = () => {
      // SSE dropped — EventSource retries automatically.
      // Enable fallback polling until it reconnects.
      sseConnectedRef.current = false;
      void load(); // load() will schedule the fallback timer
    };

    return () => {
      mountedRef.current = false;
      clearTimer();
      sseConnectedRef.current = false;
      sse.close();
    };
  }, [load, clearTimer]);

  return { jobs, isLoading, refresh };
}

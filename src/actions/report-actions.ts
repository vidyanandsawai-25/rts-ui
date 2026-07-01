'use server';

import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import type { ReportJob } from '@/types/report.types';

/**
 * Server Action — fetches the caller's report jobs from the platform.
 * Runs on the server; the session JWT never leaves Next.js.
 * Called from client components via the Next.js Server Action protocol
 * (shows as POST /_next/action/... in the network tab — no named API route,
 * no token, no plaintext JSON API response visible).
 */
export async function fetchReportJobs(take = 25): Promise<ReportJob[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return [];

  const config = getAppConfig();
  const baseUrl = config.api.baseUrl?.trim().replace(/\/+$/, '');
  if (!baseUrl) return [];

  try {
    const res = await fetch(`${baseUrl}/Report/requests?take=${take}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return (await res.json()) as ReportJob[];
  } catch {
    return [];
  }
}

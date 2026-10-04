import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/services/api.service';
import type { ReportJob, ReportJobStatus } from '@/types/report.types';

export const dynamic = 'force-dynamic';

function normalizeStatus(status: string): ReportJobStatus {
  if (status === 'Queued') return 'Pending';
  if (status === 'PartiallyCompleted') return 'Completed';
  if (['Processing', 'Completed', 'Failed', 'Cancelled', 'Retrying'].includes(status))
    return status as ReportJobStatus;
  return 'Pending';
}

export async function GET(request: NextRequest) {
  const take = Math.min(Math.max(Number(request.nextUrl.searchParams.get('take') || 25), 1), 100);
  const result = await apiClient.get<Array<{
    jobId: string;
    reportCode: string;
    status: string;
    totalRecords?: number;
    processedRecords?: number;
    totalChunks?: number;
    completedChunks?: number;
    currentChunk?: number;
    progressPercentage?: number;
    stage?: string;
    errorMessage?: string | null;
    createdDate: string;
    completedDate?: string | null;
  }>>(`/designer-report-jobs?take=${take}`);
  if (!result.success || !Array.isArray(result.data))
    return NextResponse.json({ error: result.error || 'Report jobs could not be loaded.' }, { status: result.statusCode || 502 });

  const jobs: ReportJob[] = result.data.map((job) => ({
    reportRequestId: job.jobId,
    reportCode: job.reportCode,
    status: normalizeStatus(job.status),
    createdDate: job.createdDate,
    completedDate: job.completedDate ?? null,
    errorMessage: job.errorMessage ?? null,
    downloadAvailable: job.status === 'Completed' || job.status === 'PartiallyCompleted',
    totalRecords: job.totalRecords ?? 0,
    processedRecords: job.processedRecords ?? 0,
    totalChunks: job.totalChunks ?? 0,
    completedChunks: job.completedChunks ?? 0,
    currentChunk: job.currentChunk ?? 0,
    progressPercentage: job.progressPercentage ?? 0,
    stage: job.stage ?? job.status,
  }));
  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await apiClient.post<{
      jobId: string;
      status: string;
      totalRecords?: number;
    }>('/designer-report-jobs', body);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to create report job.' },
        { status: result.statusCode || 500 }
      );
    }
    return NextResponse.json(result.data, { status: 202 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


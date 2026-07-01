'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import type { ReportDefinition, ReportParamValues } from '@/types/report.types';

interface SubmitResponse {
  reportRequestId: string;
  status: string;
}

interface UseReportFormSubmissionOptions {
  reportCode: string;
  paramValues: ReportParamValues;
  selectedDefinition: ReportDefinition | undefined;
  setIsSubmitting: (v: boolean) => void;
  queuedMessage: string;
  errorMessage: string;
  onQueued?: () => void;
}

export function useReportFormSubmission({
  reportCode,
  paramValues,
  selectedDefinition,
  setIsSubmitting,
  queuedMessage,
  errorMessage,
  onQueued,
}: UseReportFormSubmissionOptions) {
  const submitReport = useCallback(async () => {
    if (!selectedDefinition) return;

    // Send only non-empty values as parameters
    const parameters: Record<string, string> = {};
    for (const [key, value] of Object.entries(paramValues)) {
      if (value.trim()) parameters[key] = value.trim();
    }

    setIsSubmitting(true);
    try {
      // Fire-and-forget: queue the request and return. Generation happens off-server;
      // the "My Reports" list tracks status and offers the download when ready.
      const response = await fetch('/api/report-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportCode, parameters }),
      });

      if (!response.ok) {
        toast.error(errorMessage);
        return;
      }

      await response.json().catch(() => ({}) as SubmitResponse);
      toast.info(queuedMessage);
      onQueued?.();
    } catch {
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [reportCode, paramValues, selectedDefinition, setIsSubmitting, queuedMessage, errorMessage, onQueued]);

  return { submitReport };
}

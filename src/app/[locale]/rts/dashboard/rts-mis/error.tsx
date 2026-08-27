'use client';

import { ErrorPage } from '@/components/common';
import { useLocale } from 'next-intl';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Route boundary for MIS data-load failures. */
export default function RtsMisDashboardError({ error, reset }: ErrorProps) {
  const locale = useLocale();

  return (
    <ErrorPage
      error={error}
      reset={reset}
      translationNamespace="rts.misDashboard.error"
      homeUrl={`/${locale}/rts/dashboard/rts-mis`}
    />
  );
}

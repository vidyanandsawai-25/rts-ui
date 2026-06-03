'use client';

import { ErrorPage } from '@/components/common';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
 
export default function ResidentialError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      translationNamespace="propertyTax.ptis.appartmentQC.residential.error"
    />
  );
}

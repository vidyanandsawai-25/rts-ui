'use client';

import { ErrorPage } from '@/components/common';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
 
export default function AmenitiesError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      translationNamespace="propertyTax.ptis.appartmentQC.amenities.error"
    />
  );
}

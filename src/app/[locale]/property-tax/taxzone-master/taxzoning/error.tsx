'use client';

import { useEffect } from 'react';
import { ErrorPage } from "@/components/common/ErrorPage";
import { useTaxZoneMasterError } from '@/components/modules/property-tax/taxzone-master/TaxZoneMasterErrorContext';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { setHasError } = useTaxZoneMasterError();

  useEffect(() => {
    setHasError(true);
    return () => setHasError(false);
  }, [setHasError]);

  return <ErrorPage error={error} reset={reset} translationNamespace="taxZoning.error" />;
}

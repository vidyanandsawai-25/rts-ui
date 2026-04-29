import { redirect } from 'next/navigation';
import { PtisMainScreen } from '@/components/modules/property-tax/ptis/PtisMainScreen';
import { getInitialData } from './actions';
import { parsePtisSearchParams } from '@/lib/utils/params';
import { getPtisUserSafeErrorMessage } from '@/components/modules/property-tax/ptis/shared/valuation-fetch';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * PTIS Page Component (Server Component)
 * Handles data pre-fetching and URL normalization.
 */
export default async function PtisPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { locale } = resolvedParams;
  const ptisParams = parsePtisSearchParams(resolvedSearchParams);

  let initialData!: Awaited<ReturnType<typeof getInitialData>>;
  try {
    // 1. Initial Data Fetching (Ward/Property ID/Old Details)
    initialData = await getInitialData(
      ptisParams.wardNo,
      ptisParams.propertyNo,
      ptisParams.partitionNo,
      ptisParams.propertyId
    );

    // 2. URL Normalization (Redirect if ID resolved but not in URL)
    if (initialData.propertyId && !ptisParams.propertyId) {
      const newParams = new URLSearchParams();
      for (const [key, value] of Object.entries(resolvedSearchParams)) {
        if (value == null) continue;
        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => {
          if (v != null) newParams.append(key, v);
        });
      }
      newParams.set('propertyId', initialData.propertyId.toString());
      redirect(`/${locale}/property-tax/ptis?${newParams.toString()}`);
    }
  } catch (error: unknown) {
    // Re-throw redirect errors so Next.js can handle them
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as { digest?: unknown }).digest === 'string' &&
      String((error as { digest: string }).digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }

    // For other errors, let the error boundary handle it
    throw error;
  }

  const sanitizedInitialError =
    initialData.error
      ? getPtisUserSafeErrorMessage(
          initialData.error,
          undefined,
          'Unable to load PTIS details. Please try again.'
        )
      : undefined;

  return (
    <PtisMainScreen
      locale={locale}
      propertyId={initialData.propertyId}
      initialOldDetails={initialData.oldDetails}
      ptisParams={ptisParams}
      resolvedSearchParams={resolvedSearchParams}
      error={sanitizedInitialError}
    />
  );
}

import { TaxCalculationGuideline } from '@/components/modules/configuration-settings/tax-calculation-guideline';
import { getTaxCalculationGuidelineAction } from '@/app/[locale]/configuration-settings/tax-calculation-guideline/actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tax Calculation Guideline | NTIS',
  description:
    'Configure CC / OC / Electric Bill based tax calculation guidelines for the tax engine.',
};

export default async function TaxCalculationGuidelinePage() {
  let fetchError: string | undefined;
  let statusCode: number | undefined;

  const result = await getTaxCalculationGuidelineAction();

  if (!result.success) {
    fetchError = result.error ?? 'Failed to load tax calculation guideline';
    statusCode = result.statusCode;
  }

  return (
    <TaxCalculationGuideline
      initialDto={result.data ?? null}
      fetchError={fetchError}
      statusCode={statusCode}
    />
  );
}

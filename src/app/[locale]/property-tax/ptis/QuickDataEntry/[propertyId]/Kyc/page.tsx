import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import KycFormView from '@/components/modules/property-tax/ptis/QuickDataEntry/kyc/KycFormView';
import { getPropertyKycByIdAction, getOwnerTypesAction } from './action';
import { KycDetails } from '@/types/property-kyc.types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    propertyId: string;
    locale: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function KycFormPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { locale, propertyId } = await params;
  setRequestLocale(locale);

  // Validate propertyId
  const propertyIdNum = Number(propertyId);
  if (!propertyIdNum || propertyIdNum <= 0) {
    notFound();
  }

  // ✅ Parallel API calls
  const [kycPropertyResult, ownerTypeResult] = await Promise.all([
    getPropertyKycByIdAction(propertyIdNum),
    getOwnerTypesAction(),
  ]);

  // Check if KYC fetch failed or missing data - throw error to route error.tsx
  if (!kycPropertyResult.success || !kycPropertyResult.data) {
    throw new Error(kycPropertyResult.error || 'Failed to load KYC data');
  }

  // ✅ Extracted data
  const ownerTypeList = ownerTypeResult.success ? ownerTypeResult.data : [];
  const kycDetailsData = kycPropertyResult.data;

  return <KycFormView KycDetailsData={kycDetailsData as KycDetails} OwnerTypeMasterList={ownerTypeList} locale={locale} />;
}

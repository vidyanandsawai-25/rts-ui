import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ApiError } from '@/lib/utils/api';
import KycFormView from '@/components/modules/property-tax/ptis/QuickDataEntry/kyc/KycFormView';
import { getOwnerTypes, getPropertyKycById } from '@/lib/api/property-kyc.service';
import { KycDetails } from '@/types/property-kyc.types';
import { OwnerTypeApiItem } from '@/types/property-basic-details.types';

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

  let ownerTypeList: OwnerTypeApiItem[] = [];
  let kycDetailsData: KycDetails | null = null;

  try {
    const [kycResponse, ownerTypes] = await Promise.all([
      getPropertyKycById(propertyIdNum),
      getOwnerTypes(),
    ]);

    ownerTypeList = ownerTypes;

    if (kycResponse.items) {
      const adharCardNo = kycResponse.items.adharCardNo ?? kycResponse.items.aadharCardNo ?? null;
      kycDetailsData = {
        ...kycResponse.items,
        adharCardNo,
        aadharCardNo: adharCardNo, // Kept for backward compatibility only
      };
    }
  } catch (error: unknown) {
    const t = await getTranslations({ locale, namespace: 'quickDataEntry' });
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new Error(t('kyc.errors.unauthorized'));
      } else if (error.statusCode === 403) {
        throw new Error(t('kyc.errors.forbidden'));
      } else if (error.statusCode === 404) {
        throw new Error(t('kyc.errors.notFound'));
      } else if (error.statusCode >= 500) {
        throw new Error(t('kyc.errors.serverError'));
      } else {
        throw new Error(error.contextMessage || t('kyc.errors.defaultApiError', { message: error.message }));
      }
    }

    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (msg.includes('fetch failed') || msg.includes('failed to fetch') || msg.includes('network error') || msg.includes('econnrefused')) {
      throw new Error(t('kyc.errors.failedToConnect.description'));
    }
    // Check for other known KYC errors
    if (msg.includes('invalid property id')) {
      throw new Error(t('kyc.errors.invalidPropertyId'));
    }
    if (msg.includes('kyc details not found') || msg.includes('not found')) {
      throw new Error(t('kyc.errors.kycNotFound'));
    }
    if (msg.includes('failed to fetch owner types')) {
      throw new Error(t('kyc.errors.fetchOwnerTypes'));
    }
    if (msg.includes('failed to load property kyc details')) {
      throw new Error(t('kyc.errors.fetchKycDetails'));
    }
    throw error;
  }

  if (!kycDetailsData) {
    const t = await getTranslations({ locale, namespace: 'quickDataEntry' });
    throw new Error(t('kyc.errors.kycNotFound'));
  }

  return <KycFormView KycDetailsData={kycDetailsData as KycDetails} OwnerTypeMasterList={ownerTypeList} locale={locale} />;
}

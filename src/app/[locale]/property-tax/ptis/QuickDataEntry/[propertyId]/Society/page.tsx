import { setRequestLocale, getTranslations } from 'next-intl/server';
import SocietyForm from '@/components/modules/property-tax/ptis/QuickDataEntry/society/SocietyForm';
import { getPropertySocietyDetails } from '@/lib/api/property-society.service';

interface PageProps {
  params: Promise<{
    propertyId: string;
    locale: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SocietyFormPage({ params }: PageProps) {
  const { locale, propertyId } = await params;
  setRequestLocale(locale);

  const pid = Number(propertyId);

  if (isNaN(pid)) {
    throw new Error('Invalid Property Id');
  }

  let propertySocietyDetails = null;

  try {
    propertySocietyDetails = await getPropertySocietyDetails(pid);
  } catch (error: unknown) {
    const t = await getTranslations("quickDataEntry");
    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (msg.includes('fetch failed') || msg.includes('failed to fetch') || msg.includes('network error') || msg.includes('econnrefused')) {
      throw new Error(t('society.errors.failedToConnect.description'));
    }
    throw error;
  }

  return (
    <SocietyForm
      societyData={propertySocietyDetails}
      propertyIdSearch={Number(propertyId)}
      locale={locale}
    />
  );
}

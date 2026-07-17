import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { CitizenLayout } from '@/components/layout';
import DynamicServiceFormClient from '@/components/modules/forms/DynamicServiceFormClient';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';
import { getServiceMapSSR } from './actions';

interface ServicePageProps {
  params: Promise<{ locale: string; serviceId: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale, serviceId } = await params;
  const { ulbData } = await fetchLoginBrandingAction();
  const serviceMap = await getServiceMapSSR(serviceId);

  const ulbName = locale === 'mr'
    ? (ulbData?.ulbNameLocal || ulbData?.ulbName || 'महानगरपालिका')
    : (ulbData?.ulbName || 'Municipal Corporation');

  const serviceNameObj = serviceMap.serviceName;
  const serviceName = locale === 'mr' 
    ? (serviceNameObj?.mr || serviceNameObj?.en || `Service ${serviceId}`)
    : locale === 'hi'
      ? (serviceNameObj?.hi || serviceNameObj?.en || `Service ${serviceId}`)
      : (serviceNameObj?.en || `Service ${serviceId}`);

  const title = locale === 'mr'
    ? `${serviceName} - ${ulbName}`
    : locale === 'hi'
      ? `${serviceName} - ${ulbName}`
      : `${serviceName} - ${ulbName}`;

  return {
    title,
    description: locale === 'mr'
      ? `${ulbName} - ${serviceName} साठी ऑनलाईन अर्ज करा`
      : locale === 'hi'
        ? `${ulbName} - ${serviceName} के लिए ऑनलाइन आवेदन करें`
        : `${ulbName} - Apply online for ${serviceName}`,
    icons: {
      icon: ulbData?.ulbLogo || '/favicon.ico',
    },
  };
}

export default async function ServiceFormPage({ params }: ServicePageProps) {
  const { locale, serviceId } = await params;
  setRequestLocale(locale);

  return (
    <CitizenLayout>
      <DynamicServiceFormClient serviceId={serviceId} />
    </CitizenLayout>
  );
}

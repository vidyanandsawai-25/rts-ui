import { setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { CitizenLandingPage } from '@/components/modules/rts/CitizenLandingPage';
import { CitizenLayout } from '@/components/layout';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';

interface ServicePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale } = await params;
  const { ulbData } = await fetchLoginBrandingAction();

  const ulbName = locale === 'mr'
    ? (ulbData?.ulbNameLocal || ulbData?.ulbName || 'महानगरपालिका')
    : (ulbData?.ulbName || 'Municipal Corporation');

  const title = locale === 'mr'
    ? `${ulbName} - सेवा अधिकार पोर्टल`
    : locale === 'hi'
      ? `${ulbName} - सेवा का अधिकार पोर्टल`
      : `${ulbName} - Right to Service Portal`;

  const description = locale === 'mr'
    ? `${ulbName} - महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ अंतर्गत वेळबद्ध, पारदर्शक आणि नागरिक केंद्रित सेवा`
    : locale === 'hi'
      ? `${ulbName} - महाराष्ट्र लोक सेवा अधिकार अधिनियम 2015 के अंतर्गत समयबद्ध, पारदर्शी और नागरिक केंद्रित सेवाएं`
      : `${ulbName} - Time-bound, Transparent, and Citizen-Centric Services under Maharashtra Right to Public Services Act 2015`;

  return {
    title,
    description,
    icons: {
      icon: ulbData?.ulbLogo || '/favicon.ico',
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const hasSession = cookieStore.has('rts_session');
  const { ulbData } = await fetchLoginBrandingAction();

  return (
    <CitizenLayout>
      <CitizenLandingPage isLoggedIn={hasSession} ulbData={ulbData} />
    </CitizenLayout>
  );
}

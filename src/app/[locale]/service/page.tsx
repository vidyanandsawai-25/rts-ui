import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { CitizenLandingPage } from '@/components/modules/rts/citizen/CitizenLandingPage';
import { CitizenLayout } from '@/components/layout';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';
import { getDashboardDepartments } from '@/lib/api/dashboard';
import type { DepartmentDTO } from '@/types/rts-citizen.types';

interface ServicePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { locale } = await params;
  const { ulbData } = await fetchLoginBrandingAction();
  const t = await getTranslations({ locale, namespace: 'rts.landing.metadata' });

  const ulbName =
    locale === 'mr'
      ? ulbData?.ulbNameLocal || ulbData?.ulbName || 'महानगरपालिका'
      : ulbData?.ulbName || 'Municipal Corporation';

  return {
    title: t('title', { ulbName }),
    description: t('description', { ulbName }),
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

  // Fetch departments + services from DB (parallel with branding)
  const [{ ulbData }, departments] = await Promise.all([
    fetchLoginBrandingAction(),
    getDashboardDepartments().catch((): DepartmentDTO[] => []),
  ]);

  return (
    <CitizenLayout>
      <CitizenLandingPage isLoggedIn={hasSession} ulbData={ulbData} departments={departments} />
    </CitizenLayout>
  );
}

import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { CitizenLayout } from '@/components/layout';
import DashboardClient from './DashboardClient';
import { getDashboardData } from './actions';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: DashboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { ulbData } = await fetchLoginBrandingAction();

  const ulbName = locale === 'mr'
    ? (ulbData?.ulbNameLocal || ulbData?.ulbName || 'महानगरपालिका')
    : (ulbData?.ulbName || 'Municipal Corporation');

  const title = locale === 'mr'
    ? `${ulbName} - नागरिक डॅशबोर्ड`
    : locale === 'hi'
      ? `${ulbName} - नागरिक डैशबोर्ड`
      : `${ulbName} - Citizen Dashboard`;

  return {
    title,
    icons: {
      icon: ulbData?.ulbLogo || '/favicon.ico',
    },
  };
}

export default async function ServiceDashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { departments } = await getDashboardData();

  return (
    <CitizenLayout>
      <DashboardClient departments={departments} />
    </CitizenLayout>
  );
}

import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { CitizenLayout } from '@/components/layout';
import DashboardClient from './DashboardClient';
import { getCitizenDashboardData, getCitizenDashboardRouteState } from './actions';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function ServiceDashboardPage({ params, searchParams }: DashboardPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);

  const getQueryValue = (value: string | string[] | undefined) =>
    typeof value === 'string' ? value : undefined;
  const requestedPageNumber = Number.parseInt(getQueryValue(query.pageNumber) ?? '', 10);
  const { departments, userApplications, upicId, pagination } = await getCitizenDashboardData(
    requestedPageNumber
  );
  const routeState = await getCitizenDashboardRouteState(userApplications, {
    details: getQueryValue(query.details),
    payment: getQueryValue(query.payment),
    receipt: getQueryValue(query.receipt),
  });

  return (
    <CitizenLayout>
      <DashboardClient
        departments={departments}
        userApplications={userApplications}
        upicId={upicId}
        pagination={pagination}
        routeState={routeState}
      />
    </CitizenLayout>
  );
}

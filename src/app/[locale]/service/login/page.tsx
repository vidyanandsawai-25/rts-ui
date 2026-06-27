import { setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CitizenLoginForm } from '@/components/modules/login';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ServiceLoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  if (cookieStore.has('rts_session')) {
    redirect(`/${locale}/service/dashboard`);
  }

  const { ulbData } = await fetchLoginBrandingAction();

  return <CitizenLoginForm locale={locale} ulbData={ulbData} />;
}

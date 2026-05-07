import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface RootPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LocaleRootPage({ params }: RootPageProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (authToken && refreshToken) {
    redirect(`/${locale}/home`);
  }

  redirect(`/${locale}/login`);
}

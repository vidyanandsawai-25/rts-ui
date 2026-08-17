import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, LanguageDropdown } from '@/components/common';
import { ShieldCheck } from 'lucide-react';

import type { LoginPageProps } from '@/types/login.types';
import { resolvePendingTwoFactorOrRedirect } from '@/app/[locale]/login/actions';
import { VerifyTwoFactorFormClient } from '@/components/modules/login/VerifyTwoFactorFormClient';

export default async function VerifyTwoFactorPage({ params }: Pick<LoginPageProps, 'params'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Redirects to /login if there is no pending challenge (expired, already used, or a direct hit).
  const { username, method } = await resolvePendingTwoFactorOrRedirect(locale);

  const t = await getTranslations({ locale, namespace: 'login' });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-br from-slate-100 via-cyan-100 to-blue-100 transition-all duration-500">
      <div className="absolute top-4 right-4 z-50">
        <LanguageDropdown />
      </div>
      <div className="flex min-h-full w-full flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          <Card className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 shadow-2xl backdrop-blur-md transition-all duration-500 ease-in-out">
            <CardHeader className="flex flex-col items-center space-y-1 pb-2 pt-8 text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-200/60 bg-cyan-50/80 text-cyan-600 drop-shadow-lg"
                aria-hidden
              >
                <ShieldCheck className="h-9 w-9" strokeWidth={1.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                {t('twoFactorAuth')}
              </h1>
              {username ? (
                <p className="pt-1 text-sm text-gray-500">{t('signedInAs', { username })}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-10 pt-4 sm:px-8">
              <VerifyTwoFactorFormClient locale={locale} method={method} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

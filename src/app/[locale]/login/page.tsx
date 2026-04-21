import { LoginForm } from '@/components/modules/login/LoginForm';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { LoginFormCopy, LoginPageProps } from '@/types/login.types';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations('common');

  const usernameRaw = resolvedSearchParams?.username;
  const username =
    typeof usernameRaw === 'string'
      ? usernameRaw
      : Array.isArray(usernameRaw)
        ? usernameRaw[0] || ''
        : '';

  let errorMessage = '';
  const msgParam = resolvedSearchParams?.message;
  if (typeof msgParam === 'string') {
    errorMessage = msgParam;
  }

  const errorTranslationKeyByCode: Record<string, string> = {
    sessionExpired: 'login.errors.sessionExpired',
    invalidToken: 'login.errors.invalidToken',
  };

  const errParam = resolvedSearchParams?.error;
  const errStr =
    typeof errParam === 'string' ? errParam : Array.isArray(errParam) ? errParam[0] : undefined;
  if (!errorMessage && errStr) {
    const mappedKey = errorTranslationKeyByCode[errStr];
    const keyToTry = mappedKey ?? `login.errors.${errStr}`;
    try {
      errorMessage = t(keyToTry);
    } catch {
      errorMessage = errStr;
    }
  }

  const resentRaw = resolvedSearchParams?.resent;
  const showResent = resentRaw === '1' || (Array.isArray(resentRaw) && resentRaw[0] === '1');
  const infoMessage = showResent ? t('login.tokenResentFlash') : '';

  const { ulbData } = await fetchLoginBrandingAction();

  const copy: LoginFormCopy = {
    loginTitle: t('login.title'),
    username: t('login.username'),
    usernamePlaceholder: t('login.usernamePlaceholder'),
    password: t('login.password'),
    passwordPlaceholder: t('login.passwordPlaceholder'),
    signIn: t('login.signIn'),
    showPassword: t('login.showPassword'),
    hidePassword: t('login.hidePassword'),
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-cyan-50/80 to-blue-100 px-4 py-10">
      <LoginForm
        key={`${locale}-${username}`}
        username={username}
        locale={locale}
        errorMessage={errorMessage}
        infoMessage={infoMessage}
        ulbData={ulbData}
        copy={copy}
      />
    </div>
  );
}

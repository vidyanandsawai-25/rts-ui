import { LoginForm } from '@/components/modules/login/LoginForm';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { LoginFormCopy, LoginPageProps } from '@/types/login.types';
import { fetchLoginBrandingAction } from '@/app/[locale]/login/actions';
import { resolveLoginPageErrorI18nSuffix } from '@/lib/utils/login-page-errors';

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
  const errParam = resolvedSearchParams?.error;
  const msgParam = resolvedSearchParams?.message;
  const errStr =
    typeof errParam === 'string' ? errParam : Array.isArray(errParam) ? errParam[0] : undefined;
  const msgStr =
    typeof msgParam === 'string' ? msgParam : Array.isArray(msgParam) ? msgParam[0] : undefined;

  const i18nSuffix = resolveLoginPageErrorI18nSuffix(errStr, msgStr);
  if (i18nSuffix) {
    try {
      errorMessage = t(`login.errors.${i18nSuffix}`);
    } catch {
      errorMessage = '';
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
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-cyan-100 to-blue-100 px-4 py-10">
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

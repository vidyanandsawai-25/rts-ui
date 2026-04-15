'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { User, Settings, Lock, Globe, ChevronDown, LogOut, Router } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UlbMaster } from '@/types/master.types';
import { Badge, Button, Card } from '@/components/common';
import { sanitizeInput } from '@/lib/utils/security';
import { locales, switchLocale, getLocaleFromPathname, type Locale } from '@/i18n/config';
import { logoutAction } from '@/app/[locale]/login/actions';

const HEADER_COLORS = {
  background: '#4b70a6',
  userCardFrom: '#243B7C',
  userCardTo: '#0C1B48',
} as const;

const menuNavBtnClass =
  'h-auto w-full rounded-none justify-start px-4 py-2.5 text-left text-sm font-normal text-blue-50/95 hover:bg-white/10 !text-blue-50/95';

const avatarBadgeClass =
  '!flex !h-9 !w-9 !shrink-0 !min-h-9 !min-w-9 !items-center !justify-center !rounded-full !border-2 !border-white/25 !bg-gradient-to-br !from-orange-400 !to-pink-500 !p-0 !text-sm !font-bold !text-white !shadow-inner';

const avatarBadgeMenuClass =
  '!flex !h-11 !w-11 !shrink-0 !min-h-11 !min-w-11 !items-center !justify-center !rounded-full !border-2 !border-white/25 !bg-gradient-to-br !from-orange-400 !to-pink-500 !p-0 !text-sm !font-bold !text-white !shadow-inner';

/** Isolated logo + error state so `logoSrc` changes remount and clear errors without an effect. */
function HeaderCouncilLogo({
  logoSrc,
  title,
  logoFallbackText,
}: {
  logoSrc?: string;
  title: string;
  logoFallbackText: string;
}) {
  const [logoHasError, setLogoHasError] = useState(false);
  if (!logoSrc || logoHasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-center text-white font-bold text-xs leading-tight px-1">
        {logoFallbackText}
      </div>
    );
  }
  return (
    <Image
      src={logoSrc}
      alt={title ? `${title} Logo` : 'Logo'}
      width={56}
      height={56}
      className="h-full w-full object-contain"
      onError={() => setLogoHasError(true)}
      unoptimized
    />
  );
}

interface HeaderProps {
  ulbData?: UlbMaster;
  /** Display name from `user_name` cookie — set in MainLayout via server `cookies()` for SSR. */
  userDisplayName?: string;
  /** Best-effort client IP from request headers (server layout). */
  clientIp?: string;
}

export function Header({ ulbData, userDisplayName, clientIp }: HeaderProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const branding = ulbData as (UlbMaster & { logoUrl?: string }) | undefined;
  const logoSrc = useMemo(() => {
    const rawLogoSrc = branding?.ulbLogo || branding?.logoUrl;
    if (typeof rawLogoSrc !== 'string') return undefined;

    const normalizedLogoSrc = rawLogoSrc.trim();
    return normalizedLogoSrc || undefined;
  }, [branding?.ulbLogo, branding?.logoUrl]);

  const title = useMemo(() => sanitizeInput(ulbData?.ulbName ?? '') || '', [ulbData?.ulbName]);

  const localName = useMemo(
    () => sanitizeInput(ulbData?.ulbNameLocal ?? '') || '',
    [ulbData?.ulbNameLocal]
  );

  const locale = getLocaleFromPathname(pathname);
  const showLocalCouncilName = locale !== 'en' && Boolean(localName);

  const headerDetails = t('app.assessmentSystem');

  const localeLabel = useMemo(() => {
    if (locale === 'en') return t('language.english');
    if (locale === 'mr') return t('language.marathi');
    return t('language.hindi');
  }, [locale, t]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
      setLangOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const pickLocale = useCallback(
    (code: Locale) => {
      if (!locales.includes(code)) return;
      try {
        switchLocale(code, pathname, router);
        setLangOpen(false);
        setMenuOpen(false);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Language switch failed:', error);
        }
        if (typeof window !== 'undefined') {
          window.alert(t('language.switchFailed'));
        }
      }
    },
    [pathname, router, t]
  );

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    setLangOpen(false);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to clear web storage during logout:', error);
        }
      }
    }
    const currentLocale = getLocaleFromPathname(pathname);
    await logoutAction(currentLocale);
  }, [logoutAction, pathname]);

  const goProfile = useCallback(() => {
    const loc = getLocaleFromPathname(pathname);
    router.push(`/${loc}/profile`);
    setMenuOpen(false);
  }, [pathname, router]);

  const goSettings = useCallback(() => {
    const loc = getLocaleFromPathname(pathname);
    router.push(`/${loc}/settings`);
    setMenuOpen(false);
  }, [pathname, router]);

  const goChangePassword = useCallback(() => {
    const loc = getLocaleFromPathname(pathname);
    router.push(`/${loc}/change-password`);
    setMenuOpen(false);
  }, [pathname, router]);

  const logoFallbackText = useMemo(() => {
    const code = sanitizeInput(ulbData?.ulbCode ?? '') || '';
    if (code) return code.slice(0, 4);
    if (title) return title.slice(0, 2).toUpperCase();
    return '';
  }, [ulbData?.ulbCode, title]);

  const userInitial = (userDisplayName?.trim().charAt(0) || '').toUpperCase();
  const displayName = userDisplayName?.trim() ?? '';
  const ulbCodeRaw = sanitizeInput(ulbData?.ulbCode ?? '') || '';
  const idSubtitle = ulbCodeRaw ? `ID: ${ulbCodeRaw}-${new Date().getFullYear()}` : '';
  const ipDisplay = clientIp?.trim() || t('userMenu.ipUnavailable');

  return (
    <header className="fixed inset-x-0 top-0 z-40 overflow-visible">
      <div
        className="relative h-20 w-full overflow-visible shadow-2xl border-b border-white/10"
        style={{ backgroundColor: HEADER_COLORS.background }}
      >
        <div
          className="pointer-events-none absolute inset-0 hidden sm:block opacity-30"
          style={{ contain: 'layout style paint' }}
        >
          <div className="absolute left-[15%] top-4 h-16 w-16 rounded-full bg-orange-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
          <div className="absolute left-[50%] top-2 h-20 w-20 rounded-full bg-blue-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
          <div className="absolute right-[15%] top-6 h-20 w-20 rounded-full bg-purple-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
        </div>

        <div className="relative flex h-full w-full items-center justify-between gap-3 overflow-visible px-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4 self-center">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center md:h-14 md:w-14">
              <div className="absolute inset-0 rounded-full bg-white/30 blur-xl opacity-70" />
              <div className="relative h-full w-full overflow-hidden rounded-full bg-white ring-2 ring-white/40 shadow-xl">
                <HeaderCouncilLogo
                  key={logoSrc ?? '__no_logo__'}
                  logoSrc={logoSrc}
                  title={title}
                  logoFallbackText={logoFallbackText}
                />
              </div>
            </div>

            <div className="min-w-0 leading-tight">
              {title ? (
                <h1
                  className="truncate text-sm sm:text-base md:text-2xl font-extrabold text-white"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    letterSpacing: '0.5px',
                  }}
                >
                  {title}
                </h1>
              ) : null}
              {showLocalCouncilName ? (
                <p className="mt-0.5 truncate text-[10px] sm:text-xs text-blue-100/90 font-medium">
                  {localName}
                </p>
              ) : null}

              <p className="mt-1 flex flex-wrap gap-1 text-[10px] sm:text-xs md:text-sm text-gray-200">
                <span>{t('app.departmentName')}</span>
                <span className="hidden sm:inline-block text-yellow-400">|</span>
                <span className="font-medium text-yellow-300">{headerDetails}</span>
              </p>
            </div>
          </div>

          <div
            ref={menuRef}
            className="relative z-[60] flex shrink-0 items-center self-center overflow-visible pl-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              aria-controls="header-user-menu"
              onClick={() => {
                setLangOpen(false);
                setMenuOpen((open) => !open);
              }}
              className="!h-auto min-h-0 max-w-[min(100vw-5.5rem,17.5rem)] rounded-xl border border-white/25 px-4 py-2.5 text-white shadow-md !justify-start ring-offset-2 ring-offset-[#4b70a6] hover:brightness-110 md:min-w-[13.5rem] md:max-w-xs [&>span]:flex [&>span]:w-full [&>span]:min-w-0 [&>span]:items-center"
              style={{
                background: `linear-gradient(to right, ${HEADER_COLORS.userCardFrom}f0, ${HEADER_COLORS.userCardTo}f0)`,
              }}
            >
              <span className="flex w-full min-w-0 flex-row items-center justify-between gap-3">
                <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 self-center leading-tight">
                  <span className="w-full truncate text-left text-xs font-semibold md:text-sm">
                    {displayName}
                  </span>
                  {idSubtitle ? (
                    <span className="w-full truncate text-left text-[10px] text-blue-100/90 md:text-xs">
                      {idSubtitle}
                    </span>
                  ) : null}
                </span>
                <Badge
                  variant="outline"
                  size="lg"
                  className={`${avatarBadgeClass} self-center`}
                  aria-hidden={!userInitial}
                >
                  {userInitial || <User className="h-4 w-4" strokeWidth={2} aria-hidden />}
                </Badge>
              </span>
            </Button>

            {menuOpen ? (
              <>
                <div
                  className="fixed inset-0 z-[55] bg-black/20"
                  aria-hidden
                  onClick={() => setMenuOpen(false)}
                />
                <Card
                  id="header-user-menu"
                  role="dialog"
                  aria-label={t('userMenu.openUserMenu')}
                  padding="none"
                  variant="bordered"
                  className="absolute right-0 top-full z-[70] mt-1.5 w-[min(calc(100vw-2rem),20rem)] max-h-[min(70vh,calc(100dvh-5.5rem))] overflow-y-auto overflow-x-hidden rounded-2xl border-white/15 bg-[#0a1628]/98 py-1 text-white shadow-2xl backdrop-blur-xl !shadow-2xl"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 self-center">
                      <span className="truncate text-sm font-semibold">{displayName}</span>
                      {ulbCodeRaw ? (
                        <span className="truncate text-xs uppercase tracking-wide text-blue-200/90">
                          {ulbCodeRaw}
                        </span>
                      ) : null}
                    </div>
                    <Badge
                      variant="outline"
                      size="lg"
                      className={`${avatarBadgeMenuClass} self-center`}
                      aria-hidden={!userInitial}
                    >
                      {userInitial || <User className="h-5 w-5" strokeWidth={2} aria-hidden />}
                    </Badge>
                  </div>

                  <nav className="py-1" aria-label={t('userMenu.openUserMenu')}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={menuNavBtnClass}
                      onClick={goProfile}
                    >
                      <span className="flex w-full items-center gap-3">
                        <User className="h-4 w-4 shrink-0 text-blue-200" aria-hidden />
                        {t('userMenu.myProfile')}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={menuNavBtnClass}
                      onClick={goSettings}
                    >
                      <span className="flex w-full items-center gap-3">
                        <Settings className="h-4 w-4 shrink-0 text-blue-200" aria-hidden />
                        {t('userMenu.settings')}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={menuNavBtnClass}
                      onClick={goChangePassword}
                    >
                      <span className="flex w-full items-center gap-3">
                        <Lock className="h-4 w-4 shrink-0 text-blue-200" aria-hidden />
                        {t('userMenu.changePassword')}
                      </span>
                    </Button>
                  </nav>

                  <div className="border-t border-white/10 py-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`${menuNavBtnClass} !justify-between font-medium`}
                      onClick={() => setLangOpen((v) => !v)}
                      aria-expanded={langOpen}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="flex items-center gap-3">
                          <Globe className="h-4 w-4 shrink-0 text-blue-200" aria-hidden />
                          {t('userMenu.language')}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-blue-200/90">
                          <span className="max-w-[5.5rem] truncate">{localeLabel}</span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </span>
                      </span>
                    </Button>
                    {langOpen ? (
                      <div className="border-t border-white/5 bg-black/20 px-2 py-1" role="listbox">
                        {locales.map((code) => {
                          const label =
                            code === 'en'
                              ? t('language.english')
                              : code === 'mr'
                                ? t('language.marathi')
                                : t('language.hindi');
                          return (
                            <Button
                              key={code}
                              type="button"
                              variant="ghost"
                              size="sm"
                              role="option"
                              aria-selected={locale === code}
                              className={`h-auto w-full rounded-lg px-3 py-2 text-left text-xs !justify-start hover:bg-white/10 sm:text-sm ${
                                locale === code
                                  ? 'bg-white/10 font-medium !text-white'
                                  : '!text-blue-50/95'
                              }`}
                              onClick={() => pickLocale(code)}
                            >
                              <span className="block w-full truncate">{label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-3 border-t border-white/10 px-4 py-3">
                    <Router className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-blue-200/90">{t('userMenu.yourIp')}</p>
                      <p className="mt-0.5 break-all font-mono text-xs text-blue-50/90">
                        {ipDisplay}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto w-full rounded-xl px-3 py-2.5 !justify-start text-sm font-medium !text-orange-400 hover:!bg-orange-500/10"
                      onClick={() => void handleLogout()}
                    >
                      <span className="flex w-full items-center gap-3">
                        <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                        {t('userMenu.logout')}
                      </span>
                    </Button>
                  </div>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

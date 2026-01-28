'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { LogOut, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { UlbMaster } from '@/types/master.types';

import { sanitizeInput } from '@/lib/utils/security';
import { locales, switchLocale, getLocaleFromPathname } from '@/i18n/config';

/**
 * Header Theme Colors
 */
const HEADER_COLORS = {
  background: '#4b70a6',
  dropdown: '#0C1B48',
  userCardFrom: '#243B7C',
  userCardTo: '#0C1B48',
  langBtnFrom: '#0052D4',
  langBtnVia: '#4364F7',
  langBtnTo: '#6FB1FC',
} as const;

/**
 * Read username from cookie - defined outside component to avoid recreation on each render
 * Uses non-capturing group for better regex clarity per code review
 */
function getUsernameFromCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  // Use non-capturing group (?:) for proper space handling in cookie parsing
  const match = document.cookie.match(/(?:^|; )user_name=([^;]+)/);
  const rawUserName = match ? match[1] : undefined;

  let decodedUserName: string | undefined;
  if (typeof rawUserName === 'string') {
    try {
      // Cookies may encode spaces as '+' or '%20'
      const plusNormalized = rawUserName.replace(/\+/g, ' ');
      decodedUserName = decodeURIComponent(plusNormalized);
    } catch {
      decodedUserName = undefined;
    }
  }

  const safeUserName =
    typeof decodedUserName === 'string' ? sanitizeInput(decodedUserName) : undefined;

  // Allow international usernames (Hindi/Marathi) - sanitizeInput handles dangerous patterns
  // Length validation uses same limit as sanitizeInput (50 chars)
  if (typeof safeUserName === 'string' && safeUserName.length > 0 && safeUserName.length <= 50) {
    return safeUserName;
  }
  return undefined;
}

interface HeaderProps {
  ulbData?: UlbMaster;
  // username prop removed, fetched client-side
}

export function Header({ ulbData }: HeaderProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);

  // Track logo error state - simplified to only track hasError
  const [logoHasError, setLogoHasError] = useState(false);

  // Reset logo error when ulbLogo prop changes - using useEffect instead of derived state pattern
  useEffect(() => {
    setLogoHasError(false);
  }, [ulbData?.ulbLogo]);

  // Initialize username state lazily to avoid hydration mismatch
  const [username, setUsername] = useState<string | undefined>(undefined);

  // Set username after mount to avoid SSR/hydration issues
  // This is a valid use case for reading from cookies/external state on mount
  useEffect(() => {
    const cookieUsername = getUsernameFromCookie();
    if (cookieUsername) {
      setUsername(cookieUsername);
    }
  }, []);

  const title = useMemo(
    () => sanitizeInput(ulbData?.ulbName) || t('app.defaultUlbName'),
    [ulbData?.ulbName, t]
  );

  // Page title translation - simple lookup, no memoization needed
  const headerDetails = t('app.assessmentSystem');

  // Handle Escape key to close dropdown
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    if (langOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [langOpen]);

  // handleLogout is synchronous - removed async as no awaits are needed
  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
        // Clear the user_name cookie for complete logout
        document.cookie = 'user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (error) {
        // Log storage clearing errors in development for debugging, but continue with redirect
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to clear web storage during logout:', error);
        }
      }
    }
    // Ensure we redirect to a locale-prefixed route (localePrefix: 'always')
    const currentLocale = getLocaleFromPathname(pathname);
    router.push(`/${currentLocale}`);
  }, [pathname, router]);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* BACKGROUND BAR */}
      <div
        className="relative h-20 w-full shadow-2xl border-b border-white/10"
        style={{ backgroundColor: HEADER_COLORS.background }}
      >
        {/* DECORATIVE PARTICLES - CSS containment isolates repaints for better performance */}
        <div
          className="pointer-events-none absolute inset-0 hidden sm:block opacity-30"
          style={{ contain: 'layout style paint' }}
        >
          <div className="absolute left-[15%] top-4 h-16 w-16 rounded-full bg-orange-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
          <div className="absolute left-[50%] top-2 h-20 w-20 rounded-full bg-blue-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
          <div className="absolute right-[15%] top-6 h-20 w-20 rounded-full bg-purple-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
        </div>

        {/* MAIN HEADER CONTENT */}
        <div className="relative flex h-full w-full items-center justify-between px-4 md:px-6">
          {/* LEFT — LOGO + TEXT */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/30 blur-xl opacity-70" />
              <div className="relative h-full w-full overflow-hidden rounded-full bg-white ring-2 ring-white/40 shadow-xl">
                {ulbData?.ulbLogo && !logoHasError ? (
                  <Image
                    src={ulbData.ulbLogo}
                    alt={`${title} Logo`}
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                    onError={() => setLogoHasError(true)}
                    // unoptimized: ULB logos come from external/dynamic sources that may not be configured in next.config
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xs">
                    {ulbData?.ulbCode ?? t('app.defaultUlbCode')}
                  </div>
                )}
              </div>
            </div>

            <div className="leading-tight">
              <h1
                className="text-sm sm:text-base md:text-2xl font-extrabold text-white"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.5px' }}
              >
                {title}
              </h1>

              <p className="mt-1 flex flex-wrap gap-1 text-[10px] sm:text-xs md:text-sm text-gray-200">
                <span>{t('app.departmentName')}</span>
                <span className="hidden sm:inline-block text-yellow-400">|</span>
                <span className="font-medium text-yellow-300">{headerDetails}</span>
              </p>
            </div>
          </div>

          {/* RIGHT — LANGUAGE + USER */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* LANGUAGE DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                aria-controls="language-dropdown"
                aria-label={t('language.selectLanguage')}
                id="language-btn"
                className="
                  flex items-center gap-2 rounded-2xl border border-white/20
                  px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm
                  font-semibold text-white shadow-lg
                  transition-all duration-300 hover:brightness-110
                "
                style={{
                  background: `linear-gradient(to right, ${HEADER_COLORS.langBtnFrom}, ${HEADER_COLORS.langBtnVia}, ${HEADER_COLORS.langBtnTo})`,
                }}
              >
                <Globe className="h-4 w-4" /> {t('language.select')}
                <svg
                  className={`h-4 w-4 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {langOpen && (
                <>
                  {/* Click-outside overlay */}
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden="true"
                    onClick={() => setLangOpen(false)}
                  />

                  {/* Dropdown panel - using listbox role for language selection */}
                  <div
                    id="language-dropdown"
                    role="listbox"
                    aria-labelledby="language-btn"
                    className="
                      absolute right-0 mt-2 w-44 rounded-xl
                      border border-white/20 backdrop-blur-xl shadow-xl
                      z-50
                    "
                    style={{ backgroundColor: `${HEADER_COLORS.dropdown}e6` }}
                  >
                    {locales.map((code: (typeof locales)[number]) => {
                      const labelMap: Record<(typeof locales)[number], string> = {
                        en: t('language.english'),
                        mr: t('language.marathi'),
                        hi: t('language.hindi'),
                      };
                      const label = labelMap[code] ?? code;
                      return (
                        <button
                          type="button"
                          key={code}
                          role="option"
                          className="w-full px-4 py-2 text-left text-xs sm:text-sm text-white hover:bg-white/10 transition"
                          onClick={() => {
                            try {
                              switchLocale(code, pathname, router);
                              setLangOpen(false);
                            } catch (error) {
                              console.error('Language switch failed:', error);
                              // Show user-visible feedback when language switch fails
                              window.alert(t('language.switchFailed'));
                            }
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* FULL USER CARD (desktop only) */}
            <div
              className="hidden md:flex items-center gap-4 rounded-3xl border border-white/20 px-3 py-2 shadow-lg backdrop-blur-xl text-white"
              style={{
                background: `linear-gradient(to bottom right, ${HEADER_COLORS.userCardFrom}e6, ${HEADER_COLORS.userCardTo}e6)`,
              }}
            >
              <div className="relative flex items-center">
                <div className="absolute inset-0 rounded-full bg-white/20 blur-xl" />
                <div className="relative h-11 w-11 rounded-full bg-red-500 flex items-center justify-center ring-2 ring-white/40 shadow-xl">
                  <UserCircleIcon className="h-7 w-7 text-white" />
                </div>
              </div>

              <div className="leading-tight">
                <p className="text-sm font-semibold">{username || t('app.defaultUser')}</p>
              </div>

              <div className="h-8 w-px bg-white/30" />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full p-2 hover:bg-red-500/20 transition"
                  onClick={handleLogout}
                  aria-label={t('actions.logout')}
                  title={t('actions.logout')}
                >
                  <LogOut className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* MOBILE USER ICON - min touch target 44px for accessibility */}
            <button
              type="button"
              className="flex h-11 w-11 md:hidden items-center justify-center rounded-full text-white bg-white/10 border border-white/20 shadow-md"
              aria-label={t('actions.logout')}
              onClick={handleLogout}
              title={t('actions.logout')}
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

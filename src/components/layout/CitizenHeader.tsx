'use client';

import { useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { LogOut, User } from 'lucide-react';

import { LanguageSelector } from '@/components/modules/dashboard/LanguageSelector';
import { logoutCitizenAction } from '@/app/[locale]/service/login/actions';

/** Exact same background color as admin Header.tsx */
const HEADER_BG = '#4b70a6';

interface CitizenHeaderProps {
  mobile?: string;
  locale: string;
  ulbData?: any;
}

export function CitizenHeader({ mobile, locale: propLocale, ulbData }: CitizenHeaderProps) {
  const t = useTranslations('rts.header');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();
  const activeLocale = currentLocale || propLocale;

  const getUlbName = () => {
    const rawName = ulbData?.ulbName || '';
    if (rawName.toUpperCase().includes('THANE')) {
      return activeLocale === 'mr'
        ? 'ठाणे महानगरपालिका'
        : activeLocale === 'hi'
          ? 'ठाणे नगर निगम'
          : 'Thane Municipal Corporation';
    }
    if (rawName.toUpperCase().includes('AKOLA')) {
      return activeLocale === 'mr'
        ? 'अकोला महानगरपालिका'
        : activeLocale === 'hi'
          ? 'अकोला नगर निगम'
          : 'Akola Municipal Corporation';
    }
    return activeLocale === 'mr'
      ? (ulbData?.ulbNameLocal || ulbData?.ulbName || '')
      : (ulbData?.ulbName || ulbData?.ulbNameLocal || '');
  };

  const getUlbLocalName = () => {
    const rawName = ulbData?.ulbName || '';
    if (rawName.toUpperCase().includes('THANE') || rawName.toUpperCase().includes('AKOLA')) {
      return activeLocale === 'en' ? (ulbData?.ulbNameLocal || '') : '';
    }
    return activeLocale !== 'en' ? (ulbData?.ulbName || '') : '';
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutCitizenAction();
      router.push(`/${activeLocale}/service/login`);
      router.refresh();
    });
  };

  const ulbName = getUlbName();
  const ulbLocalName = getUlbLocalName();
  const portalSubtitle =
    activeLocale === 'mr'
      ? 'लोकसेवा हक्क अधिनियम | नागरिक पोर्टल'
      : activeLocale === 'hi'
        ? 'लोक सेवा अधिकार अधिनियम | नागरिक पोर्टल'
        : 'Right to Service Act | Citizen Portal';

  return (
    <header className="fixed inset-x-0 top-0 z-50 overflow-visible">
      {/* ── Same exact height & bg as admin Header ── */}
      <div
        className="relative h-16 sm:h-20 w-full overflow-visible shadow-2xl border-b border-white/10"
        style={{ backgroundColor: HEADER_BG }}
      >
        {/* Animated blur orbs — same as admin header */}
        <div
          className="pointer-events-none absolute inset-0 hidden sm:block opacity-30"
          style={{ contain: 'layout style paint' }}
        >
          <div className="absolute left-[15%] top-4 h-16 w-16 rounded-full bg-orange-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
          <div className="absolute left-[50%] top-2 h-20 w-20 rounded-full bg-blue-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
          <div className="absolute right-[15%] top-6 h-20 w-20 rounded-full bg-purple-400 blur-xl motion-safe:animate-pulse motion-reduce:animate-none" />
        </div>

        {/* ── Content row ── */}
        <div className="relative flex h-full w-full items-center justify-between gap-3 overflow-visible px-3 sm:px-4 md:px-6">

          {/* LEFT: Logo + Name (same pattern as admin) */}
          <Link
            href={mobile ? `/${activeLocale}/service/dashboard` : `/${activeLocale}/service`}
            className="flex min-w-0 flex-1 items-center gap-3 md:gap-4 self-center hover:opacity-90 transition-opacity cursor-pointer"
          >
            {/* Logo — same sizing as admin (h-10 w-10 mobile, h-14 w-14 md+) */}
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 md:h-14 md:w-14 shrink-0 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/30 blur-xl opacity-70" />
              <div className="relative h-full w-full overflow-hidden rounded-full bg-white ring-2 ring-white/40 shadow-xl">
                {ulbData?.ulbLogo ? (
                  <Image
                    src={ulbData.ulbLogo}
                    alt={ulbName || 'Logo'}
                    width={56}
                    height={56}
                    className="h-full w-full object-contain"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-xs leading-tight px-1">
                    {ulbName.slice(0, 2).toUpperCase() || 'RTS'}
                  </div>
                )}
              </div>
            </div>

            {/* Name block — same as admin */}
            <div className="min-w-0 leading-tight">
              {ulbName && (
                <h1
                  className="text-sm sm:text-base md:text-2xl font-extrabold text-white
                    whitespace-normal line-clamp-2 sm:line-clamp-1 md:truncate"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    letterSpacing: '0.5px',
                  }}
                >
                  {ulbName}
                </h1>
              )}

              {/* Local name (non-English) */}
              {ulbLocalName && (
                <p className="mt-0.5 truncate text-[10px] sm:text-xs text-blue-100/90 font-medium">
                  {ulbLocalName}
                </p>
              )}

              {/* Portal subtitle — hidden on very small mobile */}
              <p className="hidden sm:flex mt-0.5 flex-wrap gap-1 text-[10px] sm:text-xs md:text-sm text-gray-200">
                <span>{portalSubtitle.split('|')[0].trim()}</span>
                <span className="text-yellow-400">|</span>
                <span className="font-medium text-yellow-300">{portalSubtitle.split('|')[1]?.trim()}</span>
              </p>
            </div>
          </Link>

          {/* RIGHT: Language + Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Language Selector */}
            <LanguageSelector />

            {/* Auth */}
            {mobile ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* User badge — md+ */}
                <div className="hidden md:flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 h-9 text-white text-xs font-semibold shadow-sm">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[120px]">+91 {mobile}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-8 w-8 sm:h-9 sm:w-auto sm:px-3 flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  aria-label={t('logout')}
                  type="button"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline text-xs font-semibold">
                    {activeLocale === 'mr' ? 'बाहेर' : activeLocale === 'hi' ? 'लॉग आउट' : 'Logout'}
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push(`/${activeLocale}/service/login`)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                type="button"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activeLocale === 'mr' ? 'लॉगिन करा' : activeLocale === 'hi' ? 'लॉग इन' : 'Login'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useTransition, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { User } from 'lucide-react';

import { LanguageSelector } from '@/components/common/LanguageSelector';
import { UserProfileDropdown, Drawer } from '@/components/common';
import { TrackingPanel } from '@/components/modules/dashboard/TrackingPanel';
import { logoutCitizenAction } from '@/app/[locale]/service/login/actions';

/** Matching landing page theme deep navy (#0a3275) */
const HEADER_BG = '#0a3275';

interface CitizenHeaderProps {
  mobile?: string;
  locale: string;
  ulbData?: any;
}

export function CitizenHeader({ mobile, locale: propLocale, ulbData }: CitizenHeaderProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      router.push(`/${activeLocale}/service`);
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
              <UserProfileDropdown
                mobile={mobile}
                activeLocale={activeLocale}
                onLogout={handleLogout}
                onOpenApplications={() => setIsDrawerOpen(true)}
              />
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

      {/* Applications Drawer */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">
              {activeLocale === 'mr'
                ? 'माझे अर्ज आणि ट्रॅकिंग'
                : activeLocale === 'hi'
                  ? 'मेरे आवेदन और ट्रैकिंग'
                  : 'My Applications & Tracking'}
            </h3>
          </div>
        }
        width="lg"
      >
        <div className="p-4 sm:p-6 bg-slate-50 min-h-full">
          <TrackingPanel authUser={{ mobile }} />
        </div>
      </Drawer>
    </header>
  );
}

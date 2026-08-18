'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Phone, Mail } from 'lucide-react';
import { GooglePlayBadge, SocialLinks } from '@/components/common';
import type { UlbMaster } from '@/types/master.types';

interface CitizenFooterProps {
  ulbData?: UlbMaster;
  isLoggedIn?: boolean;
}

export function CitizenFooter({ ulbData, isLoggedIn }: CitizenFooterProps) {
  const locale = useLocale();
  const t = useTranslations('rts.citizenFooter');
  const router = useRouter();

  const getUlbName = () => {
    if (locale === 'mr') {
      return ulbData?.ulbNameLocal || ulbData?.ulbName || 'महानगरपालिका';
    }
    if (locale === 'hi') {
      return ulbData?.ulbNameLocal || ulbData?.ulbName || 'नगर निगम';
    }
    return ulbData?.ulbName || ulbData?.ulbNameLocal || 'Municipal Corporation';
  };

  const handleActionClick = (path: string) => {
    if (isLoggedIn) {
      router.push(`/${locale}/service/dashboard`);
    } else {
      router.push(`/${locale}${path}`);
    }
  };

  return (
    <footer className="mt-6 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-6 text-slate-600 shadow-sm sm:px-6 sm:py-8 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
        {/* Column 1: Logo & Brand Description */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="w-9 h-9 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              {ulbData?.ulbLogo ? (
                <Image
                  src={ulbData.ulbLogo}
                  alt={t('logoAlt')}
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-center text-white font-bold text-[8px] leading-tight px-1 rounded-full">
                  {getUlbName().slice(0, 2).toUpperCase() || 'RTS'}
                </div>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-blue-900 leading-tight">
              {getUlbName()}
            </h4>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
            {t('description')}
          </p>
        </div>

        {/* Column 2: Essential Policy Links */}
        <div className="space-y-3 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5 w-full sm:w-auto text-center sm:text-left">
            {t('policiesAndLinks')}
          </h4>
          <div className="flex flex-col items-center sm:items-start space-y-2 text-[11px] font-bold text-slate-500">
            <button
              onClick={() => handleActionClick('/service/login')}
              className="hover:text-blue-900 transition-colors text-left cursor-pointer bg-transparent border-none p-0 font-bold flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              {t('terms')}
            </button>
            <button
              onClick={() => handleActionClick('/service/login')}
              className="hover:text-blue-900 transition-colors text-left cursor-pointer bg-transparent border-none p-0 font-bold flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              {t('privacy')}
            </button>
            <button
              onClick={() => handleActionClick('/service/login')}
              className="hover:text-blue-900 transition-colors text-left cursor-pointer bg-transparent border-none p-0 font-bold flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              {t('helpdesk')}
            </button>
            <button
              onClick={() => handleActionClick('/service/login')}
              className="hover:text-blue-900 transition-colors text-left cursor-pointer bg-transparent border-none p-0 font-bold flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              {t('citizenCharter')}
            </button>
          </div>
        </div>

        {/* Column 3: Contact Details */}
        <div className="space-y-3 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5 w-full sm:w-auto text-center sm:text-left">
            {t('contactDetails')}
          </h4>
          <div className="flex flex-col items-center sm:items-start space-y-2 text-[11px] font-bold text-slate-500">
            {ulbData?.ulbAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-snug text-left">{ulbData.ulbAddress}</span>
              </div>
            )}
            {ulbData?.phoneNo && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a
                  href={`tel:${ulbData.phoneNo}`}
                  className="hover:text-blue-900 transition-colors font-bold"
                >
                  {ulbData.phoneNo}
                </a>
              </div>
            )}
            {ulbData?.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a
                  href={`mailto:${ulbData.email}`}
                  className="hover:text-blue-900 transition-colors font-bold"
                >
                  {ulbData.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Column 4: Connect With Us & Play Store */}
        <div className="space-y-3 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5 w-full sm:w-auto text-center sm:text-left">
            {t('connectWithUs')}
          </h4>

          {/* Social Icons Row */}
          <SocialLinks className="justify-center sm:justify-start pt-0.5" />

          {/* Google Play Download Badge */}
          <div className="pt-1.5 flex justify-center sm:justify-start w-full">
            <GooglePlayBadge />
          </div>
        </div>
      </div>

      {/* Small Copyright Bottom Row */}
      <div className="max-w-7xl mx-auto border-t border-slate-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-bold gap-2">
        <span className="text-center sm:text-left">
          {getUlbName()} &copy; {new Date().getFullYear()}. {t('allRightsReserved')}
        </span>
        <span className="text-center sm:text-right">{t('governmentInitiative')}</span>
      </div>
    </footer>
  );
}

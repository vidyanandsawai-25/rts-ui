'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { MapPin, Phone, Mail } from 'lucide-react';
import { GooglePlayBadge, SocialLinks } from '@/components/common';

interface CitizenFooterProps {
  ulbData?: any;
  isLoggedIn?: boolean;
}

export function CitizenFooter({ ulbData, isLoggedIn }: CitizenFooterProps) {
  const locale = useLocale();
  const router = useRouter();

  const getUlbName = () => {
    const rawName = ulbData?.ulbName || '';
    if (rawName.toUpperCase().includes('THANE')) {
      return locale === 'mr' 
        ? 'ठाणे महानगरपालिका' 
        : locale === 'hi' 
          ? 'ठाणे नगर निगम' 
          : 'Thane Municipal Corporation';
    }
    if (rawName.toUpperCase().includes('AKOLA')) {
      return locale === 'mr' 
        ? 'अकोला महानगरपालिका' 
        : locale === 'hi' 
          ? 'अकोला नगर निगम' 
          : 'Akola Municipal Corporation';
    }
    return locale === 'mr' 
      ? (ulbData?.ulbNameLocal || ulbData?.ulbName || '') 
      : (ulbData?.ulbName || ulbData?.ulbNameLocal || '');
  };

  const getTransText = (mr: string, hi: string, en: string) => {
    return locale === 'mr' ? mr : locale === 'hi' ? hi : en;
  };

  const handleActionClick = (path: string) => {
    if (isLoggedIn) {
      router.push(`/${locale}/service/dashboard`);
    } else {
      router.push(`/${locale}${path}`);
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 py-6 sm:py-8 px-3 sm:px-4 md:px-8 text-slate-600 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] -mx-3 sm:-mx-4 md:-mx-6 mt-4 sm:mt-6 rounded-none shadow-inner shrink-0 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
        {/* Column 1: Logo & Brand Description */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="w-9 h-9 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              {ulbData?.ulbLogo ? (
                <Image
                  src={ulbData.ulbLogo}
                  alt="Logo"
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
            {getTransText(
              'महाराष्ट्र लोकसेवा हक्क अधिनियम २०१५ अंतर्गत नागरिकांना वेळेत आणि पारदर्शक सेवा पुरवण्यासाठी कटिबद्ध.',
              'महाराष्ट्र लोक सेवा अधिकार अधिनियम 2015 के अंतर्गत नागरिकों को समयबद्ध और पारदर्शी सेवाएं प्रदान करने के लिए प्रतिबद्ध।',
              'Committed to providing time-bound and transparent services under the Maharashtra Right to Public Services Act 2015.'
            )}
          </p>
        </div>

        {/* Column 2: Essential Policy Links */}
        <div className="space-y-3 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5 w-full sm:w-auto text-center sm:text-left">
            {getTransText('धोरणे आणि दुवे', 'नीतियां और लिंक्स', 'Policies & Links')}
          </h4>
          <div className="flex flex-col items-center sm:items-start space-y-2 text-[11px] font-bold text-slate-500">
            <button onClick={() => handleActionClick('/service/login')} className="hover:text-blue-900 transition-colors text-left cursor-pointer bg-transparent border-none p-0 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              {getTransText('अटी व शर्ती', 'नियम और शर्तें', 'Terms & Conditions')}
            </button>
            <button onClick={() => handleActionClick('/service/login')} className="hover:text-blue-900 transition-colors text-left cursor-pointer bg-transparent border-none p-0 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              {getTransText('गोपनीयता धोरण', 'गोपनीयता नीति', 'Privacy Policy')}
            </button>
            <button onClick={() => handleActionClick('/service/login')} className="hover:text-blue-900 transition-colors text-left cursor-pointer bg-transparent border-none p-0 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              {getTransText('हेल्पडेस्क', 'हेल्पडेस्क', 'Helpdesk')}
            </button>
            <button onClick={() => handleActionClick('/service/login')} className="hover:text-blue-900 transition-colors text-left cursor-pointer bg-transparent border-none p-0 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              {getTransText('नागरिक सनद', 'नागरिक चार्टर', 'Citizen Charter')}
            </button>
          </div>
        </div>

        {/* Column 3: Contact Details */}
        <div className="space-y-3 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5 w-full sm:w-auto text-center sm:text-left">
            {getTransText('संपर्क माहिती', 'संपर्क सूत्र', 'Contact Details')}
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
                <a href={`tel:${ulbData.phoneNo}`} className="hover:text-blue-900 transition-colors font-bold">
                  {ulbData.phoneNo}
                </a>
              </div>
            )}
            {ulbData?.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a href={`mailto:${ulbData.email}`} className="hover:text-blue-900 transition-colors font-bold">
                  {ulbData.email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Column 4: Connect With Us & Play Store */}
        <div className="space-y-3 text-center sm:text-left flex flex-col items-center sm:items-start w-full">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-1.5 w-full sm:w-auto text-center sm:text-left">
            {getTransText('आमच्याशी जोडा', 'हमसे जुड़ें', 'Connect With Us')}
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
          {getUlbName()} &copy; {new Date().getFullYear()}. {getTransText('सर्व हक्क राखीव.', 'सर्वाधिकार सुरक्षित।', 'All Rights Reserved.')}
        </span>
        <span className="text-center sm:text-right">
          {getTransText('महाराष्ट्र शासन लोकसेवा हक्क उपक्रम', 'महाराष्ट्र सरकार लोक सेवा अधिकार पहल', 'Government of Maharashtra Right to Service Initiative')}
        </span>
      </div>
    </footer>
  );
}

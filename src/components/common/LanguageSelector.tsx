'use client';

/**
 * LanguageSelector - Client Component for language switching
 * Allows users to switch between English, Hindi, and Marathi
 */

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { locales, localeNames, switchLocale, getLocaleFromPathname } from '@/i18n/config';

export function LanguageSelector() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = getLocaleFromPathname(pathname);
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (locale: Locale) => {
    setIsOpen(false);
    switchLocale(locale, pathname, router);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 rounded-lg transition-colors text-white"
        title="Change language"
      >
        <Globe size={14} className="shrink-0 text-white" />
        <span className="hidden sm:inline text-xs font-semibold text-white">{localeNames[currentLocale]}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLocale === locale
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700'
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

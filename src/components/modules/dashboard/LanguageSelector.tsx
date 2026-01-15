'use client';

/**
 * LanguageSelector - Client Component for language switching
 * Allows users to switch between English, Hindi, and Marathi
 */

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Locale, locales, localeNames, defaultLocale } from '@/i18n/config';

// Extract locale from pathname (e.g., /en/dashboard -> en)
const getLocaleFromPath = (pathname: string): Locale => {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] as Locale;
  return locales.includes(firstSegment) ? firstSegment : defaultLocale;
};

export function LanguageSelector() {
  const pathname = usePathname();
  
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);
  const [isOpen, setIsOpen] = useState(false);
  
  // Update current locale when pathname changes
  useEffect(() => {
    setCurrentLocale(getLocaleFromPath(pathname));
  }, [pathname]);

  const handleLanguageChange = (locale: Locale) => {
    // Save to cookie first (expires in 1 year)
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    // eslint-disable-next-line react-hooks/immutability -- Browser APIs like document.cookie are safe to modify in event handlers
    document.cookie = `NEXT_LOCALE=${locale}; path=/; expires=${expires.toUTCString()}`;

    // Save to localStorage as backup
    localStorage.setItem('NEXT_LOCALE', locale);

    // Extract the current path without locale prefix (dynamically built from locales array)
    const localePattern = new RegExp(`^/(${locales.join('|')})`);
    const pathWithoutLocale = pathname.replace(localePattern, '') || '/';
    
    // Always include locale prefix in the path
    const path = `/${locale}${pathWithoutLocale}`;
    
    // Force hard reload to ensure middleware and layout re-run with new locale
    window.location.replace(path);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        title="Change language"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">{localeNames[currentLocale]}</span>
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

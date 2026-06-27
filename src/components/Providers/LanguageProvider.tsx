"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

type LanguageContextValue = {
  language: Locale;
  setLanguage: (lang: Locale) => void;
};

const COOKIE_KEY = "NEXT_LOCALE";

const isValidLocale = (value: unknown): value is Locale =>
  locales.includes(value as Locale);

export function useLanguage(): LanguageContextValue {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const language: Locale = isValidLocale(locale) ? locale : defaultLocale;

  const setLanguage = (lang: Locale) => {
    const next = isValidLocale(lang) ? lang : defaultLocale;

    try {
      document.cookie = `${COOKIE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // ignore
    }

    const localePattern = new RegExp(`^/(${locales.join("|")})`);
    const pathWithoutLocale = pathname.replace(localePattern, "") || "/";
    const query = searchParams.toString();
    const nextPath = `/${next}${pathWithoutLocale}${query ? `?${query}` : ""}`;

    window.location.replace(nextPath);
  };

  return { language, setLanguage };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

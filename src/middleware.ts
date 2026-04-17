/**
 * Next.js Middleware: i18n routing + auth gate
 * All locale routes except /[locale]/login require a valid session cookie pair.
 */

import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
});

function hasFullSession(request: NextRequest): boolean {
  const token = (request.cookies.get('auth_token')?.value ?? '').trim();
  const refresh = (request.cookies.get('refresh_token')?.value ?? '').trim();
  return token.length > 0 && refresh.length > 0;
}

function localeAndPathWithoutLocale(pathname: string): { locale: string; pathWithoutLocale: string } {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  const hasLocalePrefix = (locales as readonly string[]).includes(first);
  const locale = hasLocalePrefix ? first : defaultLocale;
  const rest = hasLocalePrefix ? segments.slice(1) : segments;
  const pathWithoutLocale = rest.length === 0 ? '/' : `/${rest.join('/')}`;
  return { locale, pathWithoutLocale };
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = localeAndPathWithoutLocale(pathname);

  const isLoginRoute =
    pathWithoutLocale === '/login' || pathWithoutLocale.startsWith('/login/');

  if (isLoginRoute) {
    if (hasFullSession(request)) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
    return intlMiddleware(request);
  }

  if (!hasFullSession(request)) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

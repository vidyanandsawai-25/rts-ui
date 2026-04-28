/**
 * Next.js Middleware: i18n routing + auth gate
 * All locale routes except /[locale]/login require a valid session cookie pair.
 */

import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
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
  }

  if (!isLoginRoute && !hasFullSession(request)) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Use intl middleware for locale handling
  const intlResponse = intlMiddleware(request);

  // Redirect/rewrite from intl (e.g. locale prefix) must not be replaced with a bare `next()`
  const intlDidRedirectOrRewrite =
    intlResponse.headers.has('location') || intlResponse.headers.has('x-middleware-rewrite');
  
  if (intlDidRedirectOrRewrite) {
    intlResponse.headers.set('x-pathname', pathname);
    return intlResponse;
  }

  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);

  intlResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  intlResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

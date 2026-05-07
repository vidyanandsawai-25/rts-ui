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
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }
  }

  if (!isLoginRoute && !hasFullSession(request)) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  const isAuthOrHome = 
    pathWithoutLocale === '/' ||
    pathWithoutLocale === '/home' || 
    pathWithoutLocale.startsWith('/home/') ||
    pathWithoutLocale === '/login' || 
    pathWithoutLocale.startsWith('/login/');
    
  // To pass data from middleware to Server Components, use request header overrides
  request.headers.set('x-pathname', pathname);
  request.headers.set('x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');

  // Use intl middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

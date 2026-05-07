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

  const isLoggedIn = hasFullSession(request);
  const isLoginRoute = pathWithoutLocale === '/login' || pathWithoutLocale.startsWith('/login/');

  // 1. Redirect logic
  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
  }

  // Explicitly redirect root path to home if logged in, or login if not
  if (pathWithoutLocale === '/') {
    return NextResponse.redirect(new URL(`/${locale}/${isLoggedIn ? 'home' : 'login'}`, request.url));
  }

  if (!isLoginRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // 2. Identify shell-less routes (auth or home landing)
  const isAuthOrHome = 
    pathWithoutLocale === '/' ||
    pathWithoutLocale === '/home' || 
    pathWithoutLocale.startsWith('/home/') ||
    pathWithoutLocale === '/login' || 
    pathWithoutLocale.startsWith('/login/');
    
  // 3. Prepare headers for downstream Server Components
  request.headers.set('x-pathname', pathname);
  request.headers.set('x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');

  // 4. Handle locale routing with next-intl
  const response = intlMiddleware(request);
  
  // Ensure custom headers are also set on the response object
  response.headers.set('x-pathname', pathname);
  response.headers.set('x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

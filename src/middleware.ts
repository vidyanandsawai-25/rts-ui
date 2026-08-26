/**
 * Next.js Middleware: i18n routing + auth gate
 * Protected routes require a non-expired access + refresh token pair.
 */

import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { defaultLocale, locales } from './i18n/config';
import {
  AUTH_COOKIES,
  SESSION_TOKEN_COOKIES,
  SESSION_EXPIRED_LOGIN_ERROR,
} from './components/modules/login/constants';
import { getSessionValidityFromTokens } from './lib/utils/session-validity';

const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
});

function localeAndPathWithoutLocale(pathname: string): { locale: string; pathWithoutLocale: string } {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  const hasLocalePrefix = (locales as readonly string[]).includes(first);
  const locale = hasLocalePrefix ? first : defaultLocale;
  const rest = hasLocalePrefix ? segments.slice(1) : segments;
  const pathWithoutLocale = rest.length === 0 ? '/' : `/${rest.join('/')}`;
  return { locale, pathWithoutLocale };
}

function clearAuthCookiesOnResponse(response: NextResponse): void {
  for (const name of SESSION_TOKEN_COOKIES) {
    response.cookies.delete(name);
  }
}

function applyAntiCacheHeaders(headers: Headers): void {
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
}

function redirectToLogin(
  request: NextRequest,
  locale: string,
  sessionExpired: boolean
): NextResponse {
  const url = new URL(`/${locale}/login`, request.url);
  if (sessionExpired) {
    url.searchParams.set('error', SESSION_EXPIRED_LOGIN_ERROR);
  }
  const response = NextResponse.redirect(url);
  applyAntiCacheHeaders(response.headers);
  clearAuthCookiesOnResponse(response);
  return response;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = localeAndPathWithoutLocale(pathname);

  const accessToken = request.cookies.get(AUTH_COOKIES.AUTH_TOKEN)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIES.REFRESH_TOKEN)?.value;
  const sessionExpiresAt = request.cookies.get(AUTH_COOKIES.SESSION_EXPIRES_AT)?.value;
  const hasLoggedInCookie = request.cookies.get(AUTH_COOKIES.IS_LOGGED_IN)?.value === 'true';
  const sessionState = getSessionValidityFromTokens(
    accessToken,
    refreshToken,
    sessionExpiresAt
  );
  const isLoggedIn = sessionState === 'active';
  const sessionExpired = sessionState === 'expired' || hasLoggedInCookie;
  const isSessionExpiredOrWasLoggedIn = sessionExpired;

  const isLoginRoute = pathWithoutLocale === '/login' || pathWithoutLocale.startsWith('/login/');
  const isAccountSecurityRoute = pathWithoutLocale === '/account/security';

  // An admin-required 2FA setup that the user hasn't completed yet takes priority over
  // everywhere else in the app — including the "already logged in, bounce off /login" case
  // right below, which would otherwise send them to /home instead.
  const requiresTwoFactorSetup =
    request.cookies.get(AUTH_COOKIES.REQUIRES_TWO_FACTOR_SETUP)?.value === 'true';
  if (isLoggedIn && requiresTwoFactorSetup && !isAccountSecurityRoute) {
    const res = NextResponse.redirect(
      new URL(`/${locale}/account/security?required=1`, request.url)
    );
    applyAntiCacheHeaders(res.headers);
    return res;
  }

  if (pathWithoutLocale === '/') {
    if (!isLoggedIn) {
      return redirectToLogin(request, locale, isSessionExpiredOrWasLoggedIn);
    }
    const res = NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    applyAntiCacheHeaders(res.headers);
    return res;
  }

  if (!isLoginRoute && !isLoggedIn) {
    // Navigating to any protected route without active session should trigger sessionExpired error message on login
    return redirectToLogin(request, locale, true);
  }

  const isAuthOrHome =
    pathWithoutLocale === '/' ||
    pathWithoutLocale === '/home' ||
    pathWithoutLocale.startsWith('/home/') ||
    pathWithoutLocale === '/login' ||
    pathWithoutLocale.startsWith('/login/');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');

  const intlResponse = intlMiddleware(request);

  if (intlResponse.headers.has('location')) {
    applyAntiCacheHeaders(intlResponse.headers);
    return intlResponse;
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  intlResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });
  intlResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  response.headers.set('x-pathname', pathname);
  response.headers.set('x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');

  applyAntiCacheHeaders(response.headers);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

/**
 * Next.js Middleware: i18n routing + auth gate
 * Protected routes require a non-expired access + refresh token pair.
 */

import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './i18n/config';
import {
  AUTH_COOKIES,
  LOGOUT_CLEAR_COOKIES,
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
  for (const name of LOGOUT_CLEAR_COOKIES) {
    response.cookies.delete(name);
  }
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
  clearAuthCookiesOnResponse(response);
  return response;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = localeAndPathWithoutLocale(pathname);

  // Citizen portal check
  const isCitizenRoute = pathWithoutLocale === '/service' || pathWithoutLocale.startsWith('/service/');
  const isCitizenLogin = pathWithoutLocale === '/service/login' || pathWithoutLocale.startsWith('/service/login/');
  const isCitizenDashboard = pathWithoutLocale === '/service/dashboard' || pathWithoutLocale.startsWith('/service/dashboard/');

  const accessToken = request.cookies.get(AUTH_COOKIES.AUTH_TOKEN)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIES.REFRESH_TOKEN)?.value;
  const sessionExpiresAt = request.cookies.get(AUTH_COOKIES.SESSION_EXPIRES_AT)?.value;
  const sessionState = getSessionValidityFromTokens(
    accessToken,
    refreshToken,
    sessionExpiresAt
  );
  const isLoggedIn = sessionState === 'active';
  const sessionExpired = sessionState === 'expired';

  const isLoginRoute = pathWithoutLocale === '/login' || pathWithoutLocale.startsWith('/login/');
  const sessionExpiredLogin =
    isLoginRoute &&
    request.nextUrl.searchParams.get('error') === SESSION_EXPIRED_LOGIN_ERROR;
  const requireVerification =
    isLoginRoute &&
    request.nextUrl.searchParams.get('requireVerification') === '1';

  // 1. Citizen route redirection logic
  if (isCitizenRoute) {
    const hasCitizenSession = request.cookies.has('rts_session');
    if (isCitizenLogin) {
      if (hasCitizenSession) {
        return NextResponse.redirect(new URL(`/${locale}/service/dashboard`, request.url));
      }
    } else if (isCitizenDashboard) {
      if (!hasCitizenSession) {
        return NextResponse.redirect(new URL(`/${locale}/service/login`, request.url));
      }
    }
  } else {
    // 2. Non-citizen route redirection logic
    if (isLoginRoute && isLoggedIn && !sessionExpiredLogin && !requireVerification) {
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url));
    }

    if (pathWithoutLocale === '/') {
      return NextResponse.redirect(new URL(`/${locale}/service`, request.url));
    }

    if (!isLoginRoute && !isLoggedIn) {
      return redirectToLogin(request, locale, sessionExpired);
    }
  }

  // 3. Determine if it's a home or auth-related layout page
  const isAuthOrHome =
    isCitizenRoute ||
    pathWithoutLocale === '/' ||
    pathWithoutLocale === '/home' ||
    pathWithoutLocale.startsWith('/home/') ||
    pathWithoutLocale === '/login' ||
    pathWithoutLocale.startsWith('/login/');

  // 4. Clone the request with custom routing headers for Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');
  requestHeaders.set('x-middleware-request-x-pathname', pathname);
  requestHeaders.set('x-middleware-request-x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');

  const modifiedRequest = new NextRequest(request, {
    headers: requestHeaders,
  });

  // 5. Invoke next-intl middleware with the modified request
  const response = intlMiddleware(modifiedRequest);

  // 6. Mutate next-intl's response to add headers and clear auth cookies if redirecting
  if (response.headers.has('location')) {
    if (!isCitizenRoute && (sessionExpired || sessionExpiredLogin || (isLoginRoute && !isLoggedIn))) {
      clearAuthCookiesOnResponse(response);
    }
    return response;
  }

  response.headers.set('x-pathname', pathname);
  response.headers.set('x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');
  response.headers.set('x-middleware-request-x-pathname', pathname);
  response.headers.set('x-middleware-request-x-is-auth-or-home', isAuthOrHome ? 'true' : 'false');

  if (!isCitizenRoute && isLoginRoute && (!isLoggedIn || sessionExpired || sessionExpiredLogin)) {
    clearAuthCookiesOnResponse(response);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

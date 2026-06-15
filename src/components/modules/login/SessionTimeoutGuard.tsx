'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';

import {
  AUTH_COOKIES,
  SESSION_EXPIRED_LOGIN_ERROR,
  SESSION_TIMEOUT_REDIRECT_SECONDS,
} from '@/components/modules/login/constants';
import { getCookieValue } from '@/lib/utils/cookie';
import { clearLegacyAuthClientStorage } from '@/lib/utils/legacy-auth-storage';
import {
  getSessionExpiresAtUnixFromCookie,
  SESSION_EXPIRY_CLOCK_SKEW_SECONDS,
  isSessionExpiredAtUnix,
  isSessionWarningActiveAtUnix,
} from '@/lib/utils/session-expiry-client';
import { locales } from '@/i18n/config';
import { redirectSessionExpiredOnClient } from '@/lib/utils/session-unauthorized';

/** Max delay for a single `setTimeout` (ms). */
const MAX_TIMEOUT_MS = 2_147_483_647;

function isLoginPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  const hasLocale = (locales as readonly string[]).includes(first);
  const routeSegment = hasLocale ? segments[1] : first;
  return routeSegment === 'login';
}

function hasLoggedInFlag(): boolean {
  return getCookieValue(AUTH_COOKIES.IS_LOGGED_IN) === 'true';
}

/**
 * Headless controller monitoring session expiration.
 * Dispatches 'ntis:session-warning-tick' custom event with warning duration.
 * Redirects to login when session expires.
 */
export function SessionTimeoutGuard() {
  const pathname = usePathname();
  const { locale: localeParam } = useParams();
  const locale = typeof localeParam === 'string' ? localeParam : 'en';

  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_TIMEOUT_REDIRECT_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const knownExpiryUnixRef = useRef<number | null>(null);
  const logoutStartedRef = useRef(false);
  const redirectingRef = useRef(false);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  const startCountdown = useCallback((initialSeconds: number) => {
    if (logoutStartedRef.current) return;
    logoutStartedRef.current = true;
    clearCountdown();
    clearExpiryTimer();
    setVisible(true);
    setSecondsLeft(initialSeconds);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        return next <= 0 ? 0 : next;
      });
    }, 1000);
  }, [clearCountdown, clearExpiryTimer]);

  // Synchronize warning tick event with other components safely during commit phase (after render)
  useEffect(() => {
    if (!visible) return;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ntis:session-warning-tick', {
          detail: { secondsLeft, active: secondsLeft > 0 },
        })
      );
    }

    if (secondsLeft <= 0) {
      clearCountdown();
    }
  }, [secondsLeft, visible, clearCountdown]);

  const checkClientSessionExpiry = useCallback(() => {
    if (logoutStartedRef.current || redirectingRef.current) return;

    const nowUnix = Math.floor(Date.now() / 1000);
    const expiresUnix = knownExpiryUnixRef.current ?? getSessionExpiresAtUnixFromCookie();

    if (expiresUnix !== null) {
      if (isSessionExpiredAtUnix(expiresUnix, nowUnix)) {
        redirectingRef.current = true;
        clearLegacyAuthClientStorage();
        window.location.assign(`/${locale}/login?error=${SESSION_EXPIRED_LOGIN_ERROR}`);
        return;
      }

      if (isSessionWarningActiveAtUnix(expiresUnix, nowUnix)) {
        const remaining = (expiresUnix - SESSION_EXPIRY_CLOCK_SKEW_SECONDS) - nowUnix;
        if (remaining > 0) {
          startCountdown(remaining);
        } else {
          redirectingRef.current = true;
          clearLegacyAuthClientStorage();
          window.location.assign(`/${locale}/login?error=${SESSION_EXPIRED_LOGIN_ERROR}`);
        }
      }
    }
  }, [locale, startCountdown]);

  useEffect(() => {
    if (!pathname || isLoginPath(pathname)) return;

    logoutStartedRef.current = false;
    redirectingRef.current = false;

    const expiresUnix = getSessionExpiresAtUnixFromCookie();
    knownExpiryUnixRef.current = expiresUnix;

    if (!hasLoggedInFlag() && expiresUnix === null) {
      return;
    }

    if (expiresUnix !== null && isSessionExpiredAtUnix(expiresUnix)) {
      redirectingRef.current = true;
      clearLegacyAuthClientStorage();
      window.location.assign(`/${locale}/login?error=${SESSION_EXPIRED_LOGIN_ERROR}`);
      return;
    }

    if (expiresUnix !== null && isSessionWarningActiveAtUnix(expiresUnix)) {
      const remaining = (expiresUnix - SESSION_EXPIRY_CLOCK_SKEW_SECONDS) - Math.floor(Date.now() / 1000);
      if (remaining > 0) {
        startCountdown(remaining);
      } else {
        redirectingRef.current = true;
        clearLegacyAuthClientStorage();
        window.location.assign(`/${locale}/login?error=${SESSION_EXPIRED_LOGIN_ERROR}`);
      }
      return;
    }

    if (expiresUnix !== null) {
      const msUntilWarning =
        (expiresUnix - SESSION_EXPIRY_CLOCK_SKEW_SECONDS - SESSION_TIMEOUT_REDIRECT_SECONDS) * 1000 -
        Date.now();
      if (msUntilWarning > 0 && msUntilWarning <= MAX_TIMEOUT_MS) {
        expiryTimerRef.current = setTimeout(checkClientSessionExpiry, msUntilWarning);
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkClientSessionExpiry();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      setVisible(false);
      knownExpiryUnixRef.current = null;
      clearExpiryTimer();
      document.removeEventListener('visibilitychange', onVisibility);
      clearCountdown();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('ntis:session-warning-tick', {
            detail: { secondsLeft: 0, active: false },
          })
        );
      }
    };
  }, [pathname, startCountdown, clearCountdown, clearExpiryTimer, checkClientSessionExpiry, locale]);

  // Tab-session isolation: Ensure user has a valid tab-level session when authenticated.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loggedIn = hasLoggedInFlag();
    if (!loggedIn) {
      try {
        sessionStorage.removeItem('is_tab_active_session');
      } catch {}
      return;
    }

    if (!pathname || isLoginPath(pathname)) return;

    const isNewLogin = window.location.search.includes('loginSuccess=1');
    const isTabSessionActive = sessionStorage.getItem('is_tab_active_session') === 'true';

    if (isNewLogin) {
      try {
        sessionStorage.setItem('is_tab_active_session', 'true');
      } catch {}
    } else if (!isTabSessionActive) {
      redirectingRef.current = true;
      clearLegacyAuthClientStorage();
      try {
        sessionStorage.removeItem('is_tab_active_session');
      } catch {}
      window.location.assign(`/${locale}/login?requireVerification=1`);
    }
  }, [pathname, locale]);

  useEffect(() => {
    const onUnauthorized = () => {
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      clearLegacyAuthClientStorage();
      redirectSessionExpiredOnClient();
    };
    window.addEventListener('ntis:session-unauthorized', onUnauthorized);
    return () => window.removeEventListener('ntis:session-unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (!visible || secondsLeft > 0 || redirectingRef.current) return;

    redirectingRef.current = true;
    clearLegacyAuthClientStorage();
    window.location.assign(`/${locale}/login?error=${SESSION_EXPIRED_LOGIN_ERROR}`);
  }, [visible, secondsLeft, locale]);

  return null;
}

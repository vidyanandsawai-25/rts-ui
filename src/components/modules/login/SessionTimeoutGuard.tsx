'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Clock, LogOut } from 'lucide-react';

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
  isSessionExpiredByCookie,
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
 * When the session expires on a protected page: 10s countdown, then redirect to login.
 * Uses the client-readable `session_expires_at` cookie only — no server polling in effects.
 */
export function SessionTimeoutGuard() {
  const pathname = usePathname();
  const { locale: localeParam } = useParams();
  const locale = typeof localeParam === 'string' ? localeParam : 'en';
  const t = useTranslations('common.login.sessionTimeout');

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

  const startCountdown = useCallback(() => {
    if (logoutStartedRef.current) return;
    logoutStartedRef.current = true;
    clearCountdown();
    clearExpiryTimer();
    setVisible(true);
    setSecondsLeft(SESSION_TIMEOUT_REDIRECT_SECONDS);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdown, clearExpiryTimer]);

  const checkClientSessionExpiry = useCallback(() => {
    if (logoutStartedRef.current || redirectingRef.current) return;

    const nowUnix = Math.floor(Date.now() / 1000);
    const knownExpiryUnix = knownExpiryUnixRef.current;

    // Use in-memory expiry first so redirect still works after browser expires cookies.
    if (knownExpiryUnix !== null && isSessionExpiredAtUnix(knownExpiryUnix, nowUnix)) {
      startCountdown();
      return;
    }

    if (isSessionExpiredByCookie(nowUnix)) {
      startCountdown();
    }
  }, [startCountdown]);

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
      startCountdown();
      return;
    }

    if (expiresUnix !== null) {
      const msUntilExpiry =
        (expiresUnix - SESSION_EXPIRY_CLOCK_SKEW_SECONDS) * 1000 - Date.now();
      if (msUntilExpiry > 0 && msUntilExpiry <= MAX_TIMEOUT_MS) {
        expiryTimerRef.current = setTimeout(checkClientSessionExpiry, msUntilExpiry);
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
    };
  }, [pathname, startCountdown, clearCountdown, clearExpiryTimer, checkClientSessionExpiry]);

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
      // Authenticated according to cookies, but this tab session is not marked active.
      // E.g. URL pasted in new tab or tab closed and reopened.
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

  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (visible) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      containerRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm focus:outline-none"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-desc"
    >
      <div className="w-full max-w-md rounded-2xl border border-amber-200/80 bg-white p-8 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Clock className="h-7 w-7" aria-hidden />
          </div>
        </div>
        <h2 id="session-timeout-title" className="text-center text-xl font-bold text-gray-900">
          {t('title')}
        </h2>
        <p id="session-timeout-desc" className="mt-3 text-center text-sm text-gray-600">
          {t('description')}
        </p>
        <p
          className="mt-6 text-center text-4xl font-bold tabular-nums text-amber-600"
          aria-live="polite"
        >
          {t('countdown', { seconds: secondsLeft })}
        </p>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-medium text-gray-500">
          <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t('redirectHint')}
        </p>
      </div>
    </div>
  );
}

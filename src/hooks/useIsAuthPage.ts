'use client';

import { usePathname } from 'next/navigation';

/**
 * Custom hook to determine if the current page is an authentication or home-style page
 * that should not display the main application shell (sidebar, sidebar-header).
 */
export function useIsAuthPage(initialValue = false) {
  const pathname = usePathname();

  // If we don't have a pathname yet (server-side initial render), use the initial value
  if (!pathname) {
    return initialValue;
  }

  // Standardized logic for identifying "No-Shell" pages
  // We check the segment after the locale (e.g., /en/login -> login)
  const segments = pathname.split('/').filter(Boolean);
  
  // Case 1: Root path (e.g., / or /en or /mr)
  if (segments.length <= 1) {
    const lastSegment = segments[0] || '';
    const { locales } = require('@/i18n/config');
    const isLocaleOnly = locales.includes(lastSegment) || lastSegment === '';
    return isLocaleOnly;
  }

  // Case 2: Specific auth/home segments
  const { locales } = require('@/i18n/config');
  const firstRealSegment = locales.includes(segments[0])
    ? segments[1]
    : segments[0];

  const noShellSegments = ['login', 'home'];
  
  return noShellSegments.includes(firstRealSegment);
}

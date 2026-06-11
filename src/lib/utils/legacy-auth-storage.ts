/**
 * Legacy client-side auth keys (pre–httpOnly cookie session).
 * Cleared on logout and when visiting login so tokens are never kept in localStorage.
 */
export const LEGACY_AUTH_STORAGE_KEYS = [
  'ntis_user',
  'employee_data',
  'ntis_employee_code',
  'ntis_user_id',
  'ntis_session_start',
  'ntis_session_id',
  'ntis_user_ip',
  'jwt',
  'ntis_last_activity',
] as const;

/** Removes legacy auth data from localStorage (browser only). */
export function clearLegacyAuthClientStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of LEGACY_AUTH_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
    window.sessionStorage.removeItem('is_tab_active_session');
  } catch {
    // Private mode / blocked storage
  }
}

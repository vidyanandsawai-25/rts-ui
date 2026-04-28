/** Minimal cookie store shape from `next/headers` `cookies()` */
type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

/**
 * Reads authenticated user id from httpOnly `user_id` cookie set at login.
 */
export function getUserIdFromCookies(cookieStore: CookieStoreLike): number | null {
  const raw = cookieStore.get('user_id')?.value;
  if (!raw) return null;
  const id = parseInt(raw, 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

/** 
 * Session utilities
 * 
 * Re-exports shared cookie utilities to avoid logic duplication 
 * as suggested by Copilot.
 */
import { getUserIdFromCookies, type CookieStoreLike } from './cookie';

export { getUserIdFromCookies };
export type { CookieStoreLike };

import { cookies, headers } from 'next/headers';
import { footerService } from '@/lib/api/footer.service';
import { BottomActionBar } from './BottomActionBar';
import { getUserRoleIdFromCookies } from '@/lib/utils/cookie';

/**
 * Server Component that dynamically fetches and renders footer actions
 * based on the current user role from cookies and the current route
 * derived from the `x-pathname` header.
 */
export async function DynamicFooterActions() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const userRoleId = getUserRoleIdFromCookies(cookieStore);
  const rawPathname = headerList.get('x-pathname') || '';

  // Normalize pathname: remove locale prefix (e.g., /en/path -> /path)
  const segments = rawPathname.split('/').filter(Boolean);
  const pathname = segments.length > 1 ? `/${segments.slice(1).join('/')}` : '/';

  // If we don't have basic session info, don't attempt to fetch
  if (!userRoleId) {
    return null;
  }

  // Fetch authorized actions from the backend
  // The service will fetch actions based on the userRoleId and filter them by pathname
  const actions = await footerService.getAuthorizedActions({
    userRoleId,
    targetRoute: pathname,
  });

  // If no actions are configured for this screen, don't show the bar
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="layout-content-shifted">
      <BottomActionBar actions={actions} />
    </div>
  );
}

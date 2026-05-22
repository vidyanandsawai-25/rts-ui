import { cache, Suspense } from 'react';
import { cookies, headers } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { getLayoutShellContextFromCookies } from '@/lib/utils/cookie';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { type MenuItem } from '@/types/menu.types';
import { sidebarNavigationService } from '@/lib/api/sidebar-navigation.service';
import { userScreenAccessService } from '@/lib/api/user-screen-access.service';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { buildSidebarTree } from '@/lib/utils/sidebar-tree';
import { buildSidebarTreeFromUserScreens } from '@/lib/utils/sidebar-tree-user';
import { PermissionsProvider } from '@/lib/providers/PermissionsProvider';
import type { UserScreenAccess } from '@/types/user-screen-access.types';

export interface MainLayoutProps {
  children: React.ReactNode;
  /** Locale segment for sidebar links; optional. */
  locale?: string;
}

function clientIpFromHeaders(h: Headers): string | undefined {
  const forwarded = h.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = h.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return undefined;
}

/**
 * Fetches global menu items (fallback when user-specific screens unavailable)
 */
const fetchGlobalMenuItems = cache(async () => {
  try {
    const [groupsRes, screensRes] = await Promise.all([
      sidebarNavigationService.getScreenGroups(),
      sidebarNavigationService.getScreens(),
    ]);
    if (groupsRes.success && screensRes.success) {
      const groups = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.items || [];
      const screens = Array.isArray(screensRes.data)
        ? screensRes.data
        : screensRes.data?.items || [];
      return { menuItems: buildSidebarTree(groups, screens), rawScreens: [] };
    }
  } catch (_error) {
    // Silent fail for global menu fetching
  }
  return { menuItems: [], rawScreens: [] };
});

/**
 * Fetches menu entries for a specific user (deduped per request).
 * Falls back to global screens if user-specific screens are unavailable.
 */
const fetchUserMenuItems = cache(async (userId: number, token?: string) => {
  try {
    // Fetch user-specific screens
    const screensRes = await userScreenAccessService.getScreensForUser(userId, token);
    if (screensRes.success && Array.isArray(screensRes.data) && screensRes.data.length > 0) {
      const userMenuItems = buildSidebarTreeFromUserScreens(screensRes.data);
      if (userMenuItems.length > 0) {
        return { menuItems: userMenuItems, rawScreens: screensRes.data };
      }
    }
  } catch (_error) {
    // Silent fail for user menu fetching, will try fallback
  }

  // Fallback to global screens
  return fetchGlobalMenuItems();
});

const getLayoutChromeData = cache(async () => {
  const headerList = await headers();
  const clientIp = clientIpFromHeaders(headerList);
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const userId = getUserIdFromCookies(cookieStore);

  let menuItems: MenuItem[] = [];
  let rawScreens: UserScreenAccess[] = [];
  if (authToken && userId != null) {
    // Try user-specific screens with fallback to global
    const result = await fetchUserMenuItems(userId, authToken);
    menuItems = result.menuItems;
    rawScreens = result.rawScreens;
  } else if (authToken) {
    // Logged in but no user_id cookie - use global screens
    const result = await fetchGlobalMenuItems();
    menuItems = result.menuItems;
    rawScreens = result.rawScreens;
  }

  return {
    clientIp,
    menuItems,
    rawScreens,
    ...getLayoutShellContextFromCookies(cookieStore),
  };
});

async function SidebarWithData({ locale }: { locale: string }) {
  const { menuItems } = await getLayoutChromeData();
  return <Sidebar menuItems={menuItems} locale={locale} />;
}

async function HeaderWithRequestContext() {
  const { ulbData, userDisplayName, clientIp } = await getLayoutChromeData();
  return <Header ulbData={ulbData} userDisplayName={userDisplayName} clientIp={clientIp} />;
}

async function FooterWithUlb() {
  const { ulbData } = await getLayoutChromeData();
  return <Footer ulbData={ulbData} />;
}

function HeaderSkeleton() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-40 h-20 w-full border-b border-white/10 shadow-2xl"
      style={{ backgroundColor: '#4b70a6' }}
      aria-hidden
    />
  );
}

function FooterSkeleton() {
  return <div className="mt-auto h-16 w-full shrink-0 bg-slate-100" aria-hidden />;
}

/**
 * Main layout: header, collapsible sidebar, footer.
 */
export async function MainLayout({ children, locale: localeProp }: MainLayoutProps) {
  const locale = localeProp ?? (await getLocale());

  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const isPtisRoute = pathname.includes('/property-tax/ptis');

  const { rawScreens } = await getLayoutChromeData();

  return (
    <PermissionsProvider screens={rawScreens}>
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        <Suspense fallback={null}>
          <SidebarWithData locale={locale} />
        </Suspense>

        <Suspense fallback={<HeaderSkeleton />}>
          <HeaderWithRequestContext />
        </Suspense>

        <main className="flex-1 transition-all duration-300 pt-20 flex flex-col layout-content-shifted">
          <div className="flex-1 w-full px-3 py-3 md:px-4">{children}</div>
        </main>

        {!isPtisRoute && (
          <Suspense fallback={<FooterSkeleton />}>
            <div className="layout-content-shifted">
              <FooterWithUlb />
            </div>
          </Suspense>
        )}
      </div>
    </PermissionsProvider>
  );
}

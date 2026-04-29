import { cache, Suspense } from 'react';
import { cookies, headers } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { getLayoutShellContextFromCookies } from '@/lib/utils/cookie';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { type MenuItem } from '@/types/menu.types';
import { sidebarNavigationService } from '@/lib/api/sidebar-navigation.service';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { buildSidebarTree } from '@/lib/utils/sidebar-tree';

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
 * Fetches menu entries for a specific user (deduped per request).
 * Currently retrieves global items as the backend handles user-scoping via the session.
 */
const fetchUserMenuItems = cache(async (_userId: number) => {
  try {
    // Fetch groups and screens in parallel (_userId is passed for future-proofing or logging)
    const [groupsRes, screensRes] = await Promise.all([
      sidebarNavigationService.getScreenGroups(),
      sidebarNavigationService.getScreens(),
    ]);

    if (groupsRes.success && screensRes.success) {
      const groups = groupsRes.data?.items || [];
      const screens = screensRes.data?.items || [];
      
      return buildSidebarTree(groups, screens);
    }
  } catch (_error) {
    // Silent fail for sidebar menu fetching
  }
  
  return [];
});

const getLayoutChromeData = cache(async () => {
  const headerList = await headers();
  const clientIp = clientIpFromHeaders(headerList);
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const userId = getUserIdFromCookies(cookieStore);
  
  let menuItems: MenuItem[] = [];
  if (authToken && userId != null) {
    menuItems = await fetchUserMenuItems(userId);
  }

  return {
    clientIp,
    menuItems,
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

  return (
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

      <Suspense fallback={<FooterSkeleton />}>
        <div className="layout-content-shifted">
          <FooterWithUlb />
        </div>
      </Suspense>
    </div>
  );
}

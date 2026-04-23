import { cache, Suspense } from 'react';
import { cookies, headers } from 'next/headers';
import { getLayoutShellContextFromCookies } from '@/lib/utils/cookie';
import { Header } from './Header';
import { Footer } from './Footer';

export interface MainLayoutProps {
  children: React.ReactNode;
  /** Kept for callers (e.g. dashboard); layout shell is locale-agnostic. */
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

const getLayoutChromeData = cache(async () => {
  const headerList = await headers();
  const clientIp = clientIpFromHeaders(headerList);
  const cookieStore = await cookies();
  return {
    clientIp,
    ...getLayoutShellContextFromCookies(cookieStore),
  };
});

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
 * Main layout: header, main content, footer (no sidebar).
 * Dynamic reads (`headers`, `cookies`) are isolated in Suspense boundaries so page content can stream without waiting on shell data.
 */
export function MainLayout({ children, locale }: MainLayoutProps) {
  void locale;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderWithRequestContext />
      </Suspense>
      <main className="flex flex-1 flex-col pt-20">
        <div className="w-full flex-1 px-3 py-3 md:px-4">{children}</div>
      </main>
      <Suspense fallback={<FooterSkeleton />}>
        <FooterWithUlb />
      </Suspense>
    </div>
  );
}

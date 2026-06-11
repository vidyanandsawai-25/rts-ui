import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import '../globals.css';
import { appConfig } from '@/config/app.config';
import { RuntimeConfigScript } from '@/config/RuntimeConfigScript';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n/config';
import Providers from './Providers';
import { headers } from 'next/headers';
import { MainLayout } from '@/components/layout';
import { ConditionalShell } from '@/components/layout/ConditionalShell';
import { verifyServerRouteAccess } from '@/lib/utils/server-access-guard';
import { UnauthorizedPage } from '@/components/common';
import { getUlbConfigForLogin } from '@/lib/api/ulb-config.service';

const inter = Inter({ subsets: ['latin'] });
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
});

export async function generateMetadata(): Promise<Metadata> {
  const ulbData = await getUlbConfigForLogin().catch(() => undefined);
  const logoUrl = ulbData?.ulbLogo;

  const title = ulbData?.ulbName
    ? `${ulbData.ulbName}${ulbData.ulbNameLocal ? ` (${ulbData.ulbNameLocal})` : ''} - ${appConfig.app.name}`
    : `${appConfig.app.name} - ${appConfig.app.description}`;

  const description = ulbData?.ulbName
    ? `${ulbData.ulbName} Portal - ${ulbData.ulbAddress || appConfig.app.description}`
    : appConfig.app.description;

  return {
    title,
    description,
    icons: logoUrl
      ? {
          icon: logoUrl,
        }
      : undefined,
  };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: Readonly<RootLayoutProps>) {
  const { locale } = await params;

  // Important: Pass locale to getMessages to ensure correct translations are loaded
  const messages = await getMessages({ locale });

  // Get current path from headers (set by middleware) for initial SSR detection
  const headerList = await headers();
  const isAuthOrHomeServer = headerList.get('x-is-auth-or-home') === 'true';
  const pathname = headerList.get('x-pathname') || '';

  // Resolve access permissions on the server
  let hasAccess = true;
  if (!isAuthOrHomeServer && pathname) {
    let requiredAccess: 'view' | 'edit' | 'delete' = 'view';
    const pathLower = pathname.toLowerCase();
    if (pathLower.includes('/add') || pathLower.includes('/edit/')) {
      requiredAccess = 'edit';
    } else if (pathLower.includes('/delete/')) {
      requiredAccess = 'delete';
    }
    hasAccess = await verifyServerRouteAccess(pathname, requiredAccess);
  }

  return (
    <html lang={locale}>
      <head>
        <RuntimeConfigScript />
      </head>
      <body className={`${inter.className} ${notoSansDevanagari.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <ConditionalShell
              initialIsAuthOrHome={isAuthOrHomeServer}
              shell={
                <MainLayout locale={locale}>
                  {hasAccess ? children : <UnauthorizedPage />}
                </MainLayout>
              }
            >
              {hasAccess ? children : <UnauthorizedPage />}
            </ConditionalShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

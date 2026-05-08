import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import '../globals.css';
import { appConfig } from '@/config/app.config';
import { RuntimeConfigScript } from '@/config/RuntimeConfigScript';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n/config';
import Providers from './Providers';
import { MainLayout } from '@/components/layout';


const inter = Inter({ subsets: ['latin'] });
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-devanagari',
});

export const metadata: Metadata = {
  title: `${appConfig.app.name} - ${appConfig.app.description}`,
  description: appConfig.app.description,
};

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

  return (
    <html lang={locale}>
      <head>
        <RuntimeConfigScript />
      </head>
      <body className={`${inter.className} ${notoSansDevanagari.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <MainLayout>
              {children}
            </MainLayout>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

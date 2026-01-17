import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  locale: string;
}

/**
 * Main layout component that wraps all pages
 * Provides consistent header and footer across the application
 */
export function MainLayout({ children, locale }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header locale={locale} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}

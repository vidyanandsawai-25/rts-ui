import { Header } from './Header';
import { Footer } from './Footer';

export interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component that wraps all pages
 * Provides consistent header and footer across the application
 *
 * Note: User authentication (cookies/user_name) is handled client-side in Header component
 * to allow this layout to remain statically optimizable.
 *
 * DESIGN DECISION: This is intentionally a synchronous Server Component that imports
 * Header (Client Component) and Footer (async Server Component). This mixed component
 * boundary is acceptable because:
 * 1. Header needs client-side interactivity (language switching, logout)
 * 2. Footer is async for i18n translations via getTranslations()
 * 3. MainLayout will become async when MasterService API integration is implemented
 *
 * TODO: Future implementation will include:
 * - Sidebar component for navigation
 * - SessionWatcher for authentication monitoring
 * - MasterService for ULB data fetching (will make this async when implemented)
 */
export function MainLayout({ children }: MainLayoutProps) {
  // Fallback ULB data; replace with real data source (API/database) when available
  // TODO: Replace with actual API call when backend is ready
  const ulbData = {
    id: 1,
    ulbCode: 'TMC',
    ulbName: 'Thane Municipal Corporation',
    ulbTypeId: 1,
    isActive: true,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Header ulbData={ulbData} />
      <main className="flex-1 transition-all duration-300 pt-20 flex flex-col">
        <div className="flex-1 w-full px-3 py-3 md:px-4">{children}</div>
      </main>
      <Footer ulbData={ulbData} />
    </div>
  );
}

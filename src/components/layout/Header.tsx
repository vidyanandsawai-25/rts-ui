import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ROUTES } from '@/lib/constants/routes';

/**
 * Header component for the application
 * Contains navigation and branding
 */
export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={ROUTES.HOME} className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">{t('app.title')}</span>
            </Link>
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              href={ROUTES.DASHBOARD}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {t('navigation.dashboard')}
            </Link>
            <Link
              href={ROUTES.PROFILE}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {t('navigation.profile')}
            </Link>
            <Link
              href={ROUTES.SETTINGS}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              {t('navigation.settings')}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

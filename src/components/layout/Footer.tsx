import { getTranslations } from 'next-intl/server';

/**
 * Footer component for the application
 */
export async function Footer({ locale }: { locale: string }) {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            © {currentYear}. {t('footer.copyright')}.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {t('footer.privacyPolicy')}
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {t('footer.termsOfService')}
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {t('footer.contact')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
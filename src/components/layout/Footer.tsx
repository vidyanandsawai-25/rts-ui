import type { UlbMaster } from '@/types/master.types';
import { getTranslations } from 'next-intl/server';
import { sanitizeInput } from '@/lib/utils/security';

interface FooterProps {
  ulbData?: UlbMaster;
}

/**
 * Footer component for the application (Server Component)
 */
export async function Footer({ ulbData }: FooterProps) {
  const t = await getTranslations('common');

  const currentYear = new Date().getFullYear();
  // Use translated default if ulbName not provided
  const ulbDisplayName = ulbData?.ulbName
    ? sanitizeInput(ulbData.ulbName)
    : t('app.defaultUlbName');

  return (
    <footer className="relative mt-auto z-30 print:hidden">
      {/* Gold accent line - Refined gradient */}
      <div className="h-0.5 w-full bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 opacity-80" />

      {/* Main Footer Content */}
      <div className="w-full bg-[#4b70a6] text-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            {/* Branding & Entity */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 md:gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="font-bold tracking-wide text-xs sm:text-sm text-white"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    letterSpacing: '0.5px',
                  }}
                >
                  {ulbDisplayName}
                </span>
              </div>
              <span className="hidden sm:inline-block text-white/30">|</span>
              <div className="flex items-center gap-1 text-blue-50/80 font-medium">
                <span>{t('app.departmentName')}</span>
                <span className="hidden sm:inline mx-1">•</span>
                <span>
                  © {currentYear} {t('footer.copyright')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

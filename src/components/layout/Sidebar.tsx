import { headers } from 'next/headers';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { resolveIcon } from '@/lib/utils/icon-mapping';
import { getTranslations } from 'next-intl/server';
import { locales } from '@/i18n/config';
import type { MenuItem } from '@/types/menu.types';
import { SidebarFrame } from './SidebarFrame';

export interface SidebarProps {
  menuItems: MenuItem[];
  locale: string;
}

function withLocale(locale: string, href: string): string {
  if (!href || href === '#' || href.startsWith('http')) return href;
  const path = href.startsWith('/') ? href : `/${href}`;
  return `/${locale}${path}`;
}


/**
 * App sidebar: menu tree and copy are rendered on the server (SSR).
 * Interactive frame (mobile drawer, width sync) lives in SidebarFrame (client).
 */
export async function Sidebar({ menuItems, locale }: SidebarProps) {
  const h = await headers();
  const pathname = h.get('x-pathname') || `/${locale}`;
  const localePattern = new RegExp(`^/(${locales.join('|')})`);
  const pathWithoutLocale = pathname.replace(localePattern, '') || '/';

  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <SidebarFrame 
      openMenuLabel={t('sidebar.openMenu')} 
      closeMenuLabel={t('sidebar.closeMenu')}
    >
      <div
        className={`p-4 flex items-center gap-3 border-b border-gray-100 bg-white/50 transition-all duration-300 ease-in-out sidebar-brand-row`}
      >
        <div className="bg-[#4b70a6] p-2 rounded-xl shadow-md shrink-0">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div className="sidebar-expandable-label flex flex-col transition-all duration-300 ease-in-out overflow-hidden min-w-0">
          <span className="text-[17px] font-bold text-gray-800 leading-tight whitespace-nowrap">
            {t('sidebar.brandTitle')}
          </span>
          <span className="text-[12px] font-medium text-gray-500 whitespace-nowrap">{t('sidebar.brandSubtitle')}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const itemPath = item.href.startsWith('/') ? item.href : `/${item.href}`;
            const active = pathWithoutLocale === itemPath || pathWithoutLocale.startsWith(`${itemPath}/`);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            const IconComponent = resolveIcon(item.iconName, item.name);

            const hasActiveChild =
              hasSubItems &&
              item.subItems!.some((sub) => {
                const sp = sub.href.startsWith('/') ? sub.href : `/${sub.href}`;
                return pathWithoutLocale === sp || pathWithoutLocale.startsWith(`${sp}/`);
              });

            if (hasSubItems) {
              return (
                <details
                  key={item.name}
                  className="group/sub"
                  open={hasActiveChild}
                >
                  <summary
                    className={`
                      list-none flex items-center gap-3 px-3 py-3 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer
                      [&::-webkit-details-marker]:hidden
                      ${
                        hasActiveChild
                          ? 'bg-gray-100 text-[#4b70a6]'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <IconComponent
                      className={`h-6 w-6 shrink-0 ${hasActiveChild ? 'text-[#4b70a6]' : 'text-gray-500'}`}
                    />
                    <div className="sidebar-expandable-label flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="block whitespace-nowrap text-[15px] font-medium leading-tight">{item.name}</span>
                          {item.nameHi && item.nameHi !== item.name && (
                            <span
                              className={`block whitespace-nowrap text-[11px] ${hasActiveChild ? 'text-[#4b70a6]/80' : 'text-gray-400'}`}
                            >
                              {item.nameHi}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 shrink-0 group-open/sub:hidden">
                          <ChevronRight size={14} />
                        </span>
                        <span className="text-gray-400 shrink-0 hidden group-open/sub:inline">
                          <ChevronDown size={14} />
                        </span>
                      </div>
                    </div>
                  </summary>
                  <div className="ml-5 border-l-2 border-gray-200 pl-2 space-y-1 my-1 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {item.subItems!.map((sub) => {
                      const subPath = sub.href.startsWith('/') ? sub.href : `/${sub.href}`;
                      const subActive = pathWithoutLocale === subPath || pathWithoutLocale.startsWith(`${subPath}/`);
                      return (
                        <Link
                          key={sub.name}
                          href={withLocale(locale, sub.href)}
                          className={`block px-3 py-1.5 rounded-lg text-[14px] font-medium transition-colors duration-200 ${
                            subActive
                              ? 'bg-[#4b70a6]/10 text-[#4b70a6] font-semibold'
                              : `hover:bg-gray-50 ${sub.className || 'text-gray-600'}`
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                </details>
              );
            }

            return (
              <div key={item.name}>
                <Link
                  href={withLocale(locale, item.href)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl text-[16px] font-semibold transition-all duration-300
                    ${
                      active
                        ? 'bg-gradient-to-r from-[#4b70a6] to-[#5a82b8] text-white shadow-md font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <IconComponent className={`h-6 w-6 shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
                  <div className="sidebar-expandable-label transition-all duration-300 ease-in-out overflow-hidden min-w-0">
                    <span className="block whitespace-nowrap text-[15px] font-medium leading-tight">{item.name}</span>
                    {item.nameHi && item.nameHi !== item.name && (
                      <span className={`block whitespace-nowrap text-[11px] ${active ? 'text-white/70' : 'text-gray-400'}`}>
                        {item.nameHi}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      <div className="px-2 mt-auto mb-2">
        <Link
          href={withLocale(locale, '/home')}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] font-semibold transition-all duration-300 bg-gradient-to-r from-[#4b70a6] to-[#3d5a8a] hover:from-[#3d5a8a] hover:to-[#2e466e] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-white/20"
        >
          <ArrowLeft className="h-5 w-5 shrink-0 sidebar-back-icon" />
          <div className="sidebar-expandable-label flex flex-col items-start transition-all duration-300 ease-in-out overflow-hidden min-w-0">
            <span className="block whitespace-nowrap leading-tight">{t('sidebar.backToDashboard')}</span>
            <span className="block whitespace-nowrap text-[11px] text-blue-100 font-normal">
              {t('sidebar.backToDashboardSecondary')}
            </span>
          </div>
        </Link>
      </div>

      <div className="sidebar-footer-label px-4 py-3 border-t border-gray-200 text-center transition-all duration-300 ease-in-out overflow-hidden">
        <p className="text-xs text-gray-400 whitespace-nowrap">{t('sidebar.footerCopyright')}</p>
      </div>
    </SidebarFrame>
  );
}

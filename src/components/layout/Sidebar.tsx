'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { resolveIcon } from '@/lib/utils/icon-mapping';
import { locales } from '@/i18n/config';
import type { MenuItem } from '@/types/menu.types';
import type { UserScreenAccess } from '@/types/user-screen-access.types';
import { resolveActiveScreenContext } from '@/lib/utils/active-screen-context';
import { SidebarFrame } from './SidebarFrame';

export interface SidebarProps {
  menuItems: MenuItem[];
  screens?: UserScreenAccess[];
  locale: string;
}

function withLocale(locale: string, href: string): string {
  if (!href || href === '#' || href.startsWith('http')) return href;
  const path = href.startsWith('/') ? href : `/${href}`;
  return `/${locale}${path}`;
}

/**
 * App sidebar: interactive and updates highlighting instantly on client-side routing.
 */
export function Sidebar({ menuItems, screens, locale }: SidebarProps) {
  const pathname = usePathname();
  const localePattern = new RegExp(`^/(${locales.join('|')})`);
  const pathWithoutLocale = pathname.replace(localePattern, '') || '/';

  const t = useTranslations('common');
  const activeScreenContext = useMemo(
    () => resolveActiveScreenContext(screens, pathname),
    [screens, pathname]
  );
  const brandTitle = activeScreenContext?.moduleName || t('sidebar.brandTitle');
  const brandSubtitle = activeScreenContext?.departmentName || t('sidebar.brandSubtitle');

  // Helper to extract the department segment (e.g. 'configuration-settings', 'property-tax')
  const getDepartment = (path: string): string => {
    const cleaned = path.replace(/^\//, '');
    const parts = cleaned.split('/');
    return parts[0] || '';
  };

  const currentDept = getDepartment(pathWithoutLocale);

  // Dynamically extract department segments from the menu items returned by the API,
  // while keeping 'configuration-settings' as a static filterable segment.
  const filterableDepartments = useMemo(() => {
    const depts = new Set<string>(['configuration-settings']);
    menuItems.forEach((item) => {
      if (item.href && item.href !== '#') {
        const dept = getDepartment(item.href);
        if (dept && dept !== 'home' && dept !== 'dashboard') {
          depts.add(dept);
        }
      }
      if (item.subItems) {
        item.subItems.forEach((sub) => {
          if (sub.href && sub.href !== '#') {
            const dept = getDepartment(sub.href);
            if (dept && dept !== 'home' && dept !== 'dashboard') {
              depts.add(dept);
            }
          }
        });
      }
    });
    return Array.from(depts);
  }, [menuItems]);

  const isFilterable = filterableDepartments.includes(currentDept);

  // Dynamically filter menu items based on the active department route
  const filteredMenuItems = useMemo(() => {
    if (!isFilterable) return menuItems;

    return menuItems
      .map((item) => {
        // If it is a group, filter its subItems
        if (item.subItems && item.subItems.length > 0) {
          const filteredSub = item.subItems.filter((sub) => {
            const subPath = sub.href ? (sub.href.startsWith('/') ? sub.href : `/${sub.href}`) : '';
            return getDepartment(subPath) === currentDept;
          });
          return {
            ...item,
            subItems: filteredSub,
          };
        }
        return item;
      })
      .filter((item) => {
        // Keep group item only if it still has subItems after filtering
        if (item.subItems && item.subItems.length > 0) {
          return true;
        }
        // Keep standalone item only if its path matches the current department
        if (item.href && item.href !== '#') {
          const itemPath = item.href.startsWith('/') ? item.href : `/${item.href}`;
          return getDepartment(itemPath) === currentDept;
        }
        return false;
      });
  }, [menuItems, currentDept, isFilterable]);

  // Collect all paths defined in the filtered sidebar menu items to determine most specific match
  const allPaths: string[] = [];
  filteredMenuItems.forEach((item) => {
    if (item.href && item.href !== '#') {
      allPaths.push(item.href.startsWith('/') ? item.href : `/${item.href}`);
    }
    if (item.subItems) {
      item.subItems.forEach((sub) => {
        if (sub.href && sub.href !== '#') {
          allPaths.push(sub.href.startsWith('/') ? sub.href : `/${sub.href}`);
        }
      });
    }
  });

  const isPathActive = (itemPath: string): boolean => {
    if (pathWithoutLocale === itemPath) return true;
    if (!pathWithoutLocale.startsWith(`${itemPath}/`)) return false;

    // If prefix matches, verify there is no other more specific match in the sidebar paths list
    const hasMoreSpecificMatch = allPaths.some((otherPath) => {
      if (otherPath === itemPath) return false;
      return (
        otherPath.length > itemPath.length &&
        (pathWithoutLocale === otherPath || pathWithoutLocale.startsWith(`${otherPath}/`))
      );
    });

    return !hasMoreSpecificMatch;
  };

  const isAssetRoute = pathname.includes('/assets');

  return (
    <SidebarFrame 
      openMenuLabel={t('sidebar.openMenu')} 
      closeMenuLabel={t('sidebar.closeMenu')}
    >
      <div
        className={`p-4 flex items-center gap-3 border-b transition-all duration-300 ease-in-out sidebar-brand-row ${
          isAssetRoute ? 'border-white/10 bg-transparent' : 'border-gray-100 bg-white/50'
        }`}
      >
        <div className={`p-2 rounded-xl shadow-md shrink-0 ${isAssetRoute ? 'bg-indigo-600' : 'bg-[#4b70a6]'}`}>
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div className="sidebar-expandable-label flex flex-col transition-all duration-300 ease-in-out overflow-hidden min-w-0">
          <span className={`text-[17px] font-bold leading-tight whitespace-nowrap ${isAssetRoute ? 'text-white' : 'text-gray-800'}`}>
            {brandTitle}
          </span>
          <span className={`text-[12px] font-medium whitespace-nowrap ${isAssetRoute ? 'text-slate-300' : 'text-gray-500'}`}>{brandSubtitle}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="space-y-2">
          {filteredMenuItems.map((item, idx) => {
            const itemPath = item.href.startsWith('/') ? item.href : `/${item.href}`;
            const active = isPathActive(itemPath);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            const IconComponent = resolveIcon(item.iconName, item.name);

            const hasActiveChild =
              hasSubItems &&
              item.subItems!.some((sub) => {
                const sp = sub.href.startsWith('/') ? sub.href : `/${sub.href}`;
                return isPathActive(sp);
              });

            if (hasSubItems) {
              return (
                <details
                  key={`${item.name}-${item.href}-${idx}`}
                  className="group/sub"
                  open={hasActiveChild}
                >
                  <summary
                    className={`
                      list-none flex items-center gap-3 px-3 py-3 rounded-xl text-[16px] font-semibold transition-all duration-300 cursor-pointer
                      [&::-webkit-details-marker]:hidden
                      ${
                        hasActiveChild
                          ? isAssetRoute 
                            ? 'bg-white/15 text-white' 
                            : 'bg-gray-100 text-[#4b70a6]'
                          : isAssetRoute
                            ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <IconComponent
                      className={`h-6 w-6 shrink-0 ${
                        hasActiveChild 
                          ? isAssetRoute ? 'text-white' : 'text-[#4b70a6]'
                          : isAssetRoute ? 'text-slate-400' : 'text-gray-500'
                      }`}
                    />
                    <div className="sidebar-expandable-label flex-1 min-w-0 transition-all duration-300 ease-in-out overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="block whitespace-nowrap text-[15px] font-medium leading-tight">{item.name}</span>
                          {item.nameHi && item.nameHi !== item.name && (
                            <span
                              className={`block whitespace-nowrap text-[11px] ${
                                hasActiveChild 
                                  ? isAssetRoute ? 'text-white/80' : 'text-[#4b70a6]/80' 
                                  : isAssetRoute ? 'text-slate-400' : 'text-gray-400'
                              }`}
                            >
                              {item.nameHi}
                            </span>
                          )}
                        </div>
                        <span className={`${isAssetRoute ? 'text-slate-400' : 'text-gray-400'} shrink-0 group-open/sub:hidden`}>
                          <ChevronRight size={14} />
                        </span>
                        <span className={`${isAssetRoute ? 'text-slate-400' : 'text-gray-400'} shrink-0 hidden group-open/sub:inline`}>
                          <ChevronDown size={14} />
                        </span>
                      </div>
                    </div>
                  </summary>
                  <div className={`sidebar-expandable-label ml-5 border-l-2 pl-2 space-y-1 my-1 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full ${
                    isAssetRoute ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    {item.subItems!.map((sub, sIdx) => {
                      const subPath = sub.href.startsWith('/') ? sub.href : `/${sub.href}`;
                      const subActive = isPathActive(subPath);
                      return (
                        <Link
                          key={`${sub.name}-${sub.href}-${sIdx}`}
                          href={withLocale(locale, sub.href)}
                          className={`block px-3 py-1.5 rounded-lg text-[14px] font-medium transition-colors duration-200 ${
                            subActive
                              ? isAssetRoute
                                ? 'bg-white/20 text-white font-semibold'
                                : 'bg-[#4b70a6]/10 text-[#4b70a6] font-semibold'
                              : isAssetRoute
                                ? `hover:bg-white/5 ${sub.className || 'text-slate-300 hover:text-white'}`
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
              <div key={`${item.name}-${item.href}-${idx}`}>
                <Link
                  href={withLocale(locale, item.href)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl text-[16px] font-semibold transition-all duration-300
                    ${
                      active
                        ? isAssetRoute
                          ? 'bg-white/20 text-white shadow-md font-bold'
                          : 'bg-gradient-to-r from-[#4b70a6] to-[#5a82b8] text-white shadow-md font-bold'
                        : isAssetRoute
                          ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <IconComponent className={`h-6 w-6 shrink-0 ${active ? 'text-white' : isAssetRoute ? 'text-slate-400' : 'text-gray-500'}`} />
                  <div className="sidebar-expandable-label transition-all duration-300 ease-in-out overflow-hidden min-w-0">
                    <span className="block whitespace-nowrap text-[15px] font-medium leading-tight">{item.name}</span>
                    {item.nameHi && item.nameHi !== item.name && (
                      <span className={`block whitespace-nowrap text-[11px] ${active ? 'text-white/70' : isAssetRoute ? 'text-slate-400' : 'text-gray-400'}`}>
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
          href={withLocale(locale, isAssetRoute ? '/assets/municipal-Asset' : '/home')}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[15px] font-semibold transition-all duration-300 border shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
            isAssetRoute
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              : 'bg-gradient-to-r from-[#4b70a6] to-[#3d5a8a] hover:from-[#3d5a8a] hover:to-[#2e466e] text-white border-white/20'
          }`}
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
    </SidebarFrame>
  );
}

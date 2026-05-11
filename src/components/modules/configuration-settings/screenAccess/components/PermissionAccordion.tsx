'use client';

import React from 'react';
import { Accordion, AccordionItemType } from '@/components/common/accordion';
import { AccessLevel } from '@/types/screen-access.types';
import {
  DisplayDepartment,
  DisplayScreen,
  DisplayDomain,
} from '@/hooks/configuration-settings/screenAccess/usePermissionHierarchy';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTranslations } from 'next-intl';

interface PermissionAccordionProps {
  hierarchy: DisplayDepartment[];
  roleAccess: Record<string, AccessLevel>;
  accessLevelConfig: Record<
    string,
    { label: string; shortLabel: string; icon: LucideIcon; badgeClass: string }
  >;
  onUpdate: (screenId: string, level: AccessLevel) => void;
  onBulkDomain: (screens: DisplayScreen[], level: AccessLevel) => void;
  onBulkDept: (dept: DisplayDepartment, level: AccessLevel) => void;
}

export const PermissionAccordion: React.FC<PermissionAccordionProps> = ({
  hierarchy,
  roleAccess,
  accessLevelConfig,
  onUpdate,
  onBulkDomain,
  onBulkDept,
}) => {
  const t = useTranslations('screenAccess');

  const accordionItems: AccordionItemType[] = hierarchy.map((dept) => {
    return {
      title: (
        <div className="flex items-center justify-between w-full pr-4 group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <dept.icon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-gray-800">{dept.name}</span>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {Object.entries(accessLevelConfig).map(([level, cfg]) => (
              <button
                type="button"
                key={level}
                onClick={(e) => {
                  e.stopPropagation();
                  onBulkDept(dept, level as AccessLevel);
                }}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-bold rounded border transition-all cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500',
                  cfg.badgeClass
                )}
                title={t('accessControl.actions.applyToAll', { level: cfg.label })}
                aria-label={t('accessControl.actions.applyToAll', { level: cfg.label })}
              >
                {cfg.shortLabel}
              </button>
            ))}
          </div>
        </div>
      ),
      content: (
        <div className="space-y-6 pt-2 pb-4">
          {dept.domains.map((domain: DisplayDomain) => (
            <div key={domain.id} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-gray-500">
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-xs font-bold uppercase tracking-wider">{domain.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {Object.entries(accessLevelConfig).map(([level, cfg]) => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => onBulkDomain(domain.screens, level as AccessLevel)}
                      className={cn(
                        'px-1.5 py-0.5 text-[9px] font-bold rounded border opacity-60 hover:opacity-100 transition-all',
                        cfg.badgeClass
                      )}
                      title={t('accessControl.actions.applyToAll', { level: cfg.label })}
                      aria-label={t('accessControl.actions.applyToAll', { level: cfg.label })}
                    >
                      {cfg.shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {domain.screens.map((screen: DisplayScreen) => {
                  const currentLevel = roleAccess[screen.id] || 'no-access';

                  return (
                    <div
                      key={screen.id}
                      className="flex flex-col gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-all group/card"
                    >
                      <span className="text-xs font-medium text-gray-700">{screen.name}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(accessLevelConfig).map(([level, levelCfg]) => {
                          const isActive = currentLevel === level;
                          return (
                            <button
                              type="button"
                              key={level}
                              onClick={() => onUpdate(screen.id, level as AccessLevel)}
                              className={cn(
                                'flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1',
                                isActive
                                  ? cn(
                                      'border-transparent ring-2 ring-offset-1',
                                      levelCfg.badgeClass,
                                      level === 'no-access' ? 'ring-red-500' : 'ring-indigo-500'
                                    )
                                  : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                              )}
                              title={levelCfg.label}
                              aria-label={levelCfg.label}
                            >
                              <levelCfg.icon className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{levelCfg.shortLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4 pr-1">
      <Accordion
        items={accordionItems}
        multiple
        defaultOpen={[0]}
        className="border-none divide-y-0 space-y-4"
      />
    </div>
  );
};

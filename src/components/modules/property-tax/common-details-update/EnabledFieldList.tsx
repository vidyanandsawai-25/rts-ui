/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils/cn';
import { Checkbox } from '@/components/common/checkbox';

interface EnabledFieldListProps {
  t: (key: string) => string;
  isFieldListCollapsed?: boolean;
  setIsFieldListCollapsed?: (collapsed: boolean) => void;
  filteredMenuItems: any[];
  selectedCodes: string[];
  handleMenuSelect: (code: string) => void;
  locale: string;
}

export const EnabledFieldList = ({
  t,
  filteredMenuItems,
  selectedCodes,
  handleMenuSelect,
  locale,
}: EnabledFieldListProps) => {
  return (
    <div className="flex flex-col min-h-0 border border-blue-200 rounded-xl bg-white overflow-hidden w-full lg:w-4/12">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F8FAFF] shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-[#1E3A8A]">{t('fieldList.title')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{t('fieldList.subtitle')}</p>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="text-sm font-medium text-gray-700">{t('fieldList.enabledFieldList')}</p>
          <span className="text-sm text-gray-500">
            {filteredMenuItems.length} {t('fieldList.available')}
          </span>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {filteredMenuItems.map((item) => {
            const isSelected = selectedCodes.includes(item.updateCode);
            const displayLabel = (locale === 'mr' || locale === 'hi') ? (item.updateNameMarathi || item.updateName) : item.updateName;

            return (
              <div
                key={item.updateCode}
                role="button"
                tabIndex={0}
                onClick={() => handleMenuSelect(item.updateCode)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMenuSelect(item.updateCode);
                  }
                }}
                className={cn(
                  'group w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left h-auto cursor-pointer focus:!ring-0 focus:outline-none focus:ring-offset-0',
                  isSelected
                    ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm'
                )}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isSelected ? 'text-[#1E3A8A]' : 'text-gray-700'
                      )}
                    >
                      {displayLabel}
                    </p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => handleMenuSelect(item.updateCode)}
                    className="data-[state=checked]:bg-white data-[state=checked]:border-blue-500 data-[state=checked]:text-blue-500" 
                  />
                </div>
              </div>
            );
          })}

          {filteredMenuItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-gray-500">{t('form.noFields')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


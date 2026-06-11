'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/common/ActionButton';
import { Tooltip } from '@/components/common/Tooltip';

interface PropertyInfoHeaderProps {
  wardNo: string;
  propertyNo: string;
  partitionNo: string;
  sharedLanguage: 'english' | 'marathi';
  onLanguageChange?: (language: 'english' | 'marathi') => void;
  propertyHolderName: string;
  propertyHolderNameMarathi: string;
}

/**
 * Compact header for the media panel showing ward/property/partition info
 * with language toggle and collapsible property holder name.
 */
export function PropertyInfoHeader({
  wardNo,
  propertyNo,
  partitionNo,
  sharedLanguage,
  onLanguageChange,
  propertyHolderName,
  propertyHolderNameMarathi,
}: PropertyInfoHeaderProps): React.ReactElement {
  const [showPropertyHolder, setShowPropertyHolder] = React.useState(false);
  const t = useTranslations('ptis');

  return (
    <div className="border border-indigo-300 rounded-lg bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 px-2 py-1 shadow-md flex-shrink-0">
      <div className="space-y-1">
        {/* Ward / Property / Partition Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-[8px] text-purple-700 font-semibold uppercase tracking-wide">
              {t('media.wardNo')}
            </span>
            <span className="text-sm text-purple-900 font-medium">{wardNo || '—'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-blue-700 font-semibold uppercase tracking-wide">
              {t('media.propertyNo')}
            </span>
            <span className="text-sm text-blue-900 font-medium">{propertyNo || '—'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-cyan-700 font-semibold uppercase tracking-wide">
              {t('media.partitionNo')}
            </span>
            <span className="text-sm text-cyan-900 font-medium">{partitionNo || '—'}</span>
          </div>
        </div>

        {/* Language Toggle + Expand */}
        <div className="flex justify-center items-center gap-1">
          <Tooltip
            content={sharedLanguage === 'english' ? 'Switch to Marathi' : 'Switch to English'}
          >
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                const next = sharedLanguage === 'english' ? 'marathi' : 'english';
                onLanguageChange?.(next);
              }}
              icon={Languages}
              className="text-indigo-700 bg-white border border-indigo-300 rounded hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
              aria-label="Toggle language"
            >
              {sharedLanguage === 'english' ? 'EN' : 'MR'}
            </Button>
          </Tooltip>

          <Tooltip content={showPropertyHolder ? 'Hide Property Holder' : 'Show Property Holder'}>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setShowPropertyHolder((p) => !p)}
              className="p-1 rounded-full hover:bg-indigo-200 transition-colors text-indigo-600 h-7 w-7"
              aria-label="Toggle property holder visibility"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={showPropertyHolder ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                />
              </svg>
            </Button>
          </Tooltip>
        </div>

        {/* Property Holder — Collapsible */}
        {showPropertyHolder && (
          <div className="flex flex-col pt-0.5 border-t border-indigo-200 animate-in slide-in-from-top-2 duration-200">
            <span className="text-[8px] text-indigo-700 font-semibold uppercase tracking-wide">
              {t('media.propertyHolder')}
            </span>
            <span className="text-sm text-indigo-900 font-medium truncate">
              {sharedLanguage === 'english' ? propertyHolderName : propertyHolderNameMarathi || '—'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

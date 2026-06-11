'use client';

import React from 'react';
import { Column } from '@/components/common';
import { RuleItem } from '@/types/rule-engine.types';
import { getRuleWiseDescriptions } from './useRuleBuilderHelpers';

export type RuleItemRecord = RuleItem & Record<string, unknown>;

interface UseRuleLibraryColumnsArgs {
  t: (key: string) => string;
}

/**
 * Returns the column definitions for the RuleLibrary table.
 * Extracted to keep RuleLibrary.tsx under the 200-line component limit.
 */
export function useRuleLibraryColumns({ t }: UseRuleLibraryColumnsArgs): Column<RuleItemRecord>[] {
  return React.useMemo<Column<RuleItemRecord>[]>(
    () => [
      { key: 'ruleCode', label: t('library.ruleCode'), width: '150px' },
      { key: 'ruleName', label: t('library.ruleName'), width: '130px' },
      {
        key: 'description',
        label: t('library.description'),
        render: (_val: unknown, row: RuleItemRecord) => {
          const descs = getRuleWiseDescriptions(row.conditionsJson);
          if (descs.length === 0) return <span className="text-gray-300 text-xs">—</span>;
          return (
            <div className="flex flex-col gap-0.5 text-xs text-gray-600 max-w-[320px]">
              {descs.map((desc, i) => (
                <span key={i} title={desc} className="line-clamp-1 block font-medium">
                  {descs.length > 1 ? `${i + 1}. ${desc}` : desc}
                </span>
              ))}
            </div>
          );
        },
      },
      { key: 'ruleCategory', label: t('library.category'), width: '140px' },
      { key: 'isActive', label: t('library.status'), width: '110px', isStatus: true },
    ],
    [t]
  );
}

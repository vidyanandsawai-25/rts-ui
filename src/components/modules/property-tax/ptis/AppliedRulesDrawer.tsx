'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GitMerge } from 'lucide-react';
import { Drawer, MasterTable } from '@/components/common';
import { fetchPropertyRuleLogsAction } from '@/app/[locale]/property-tax/ptis/actions';
import type { PropertyRuleLogItem } from '@/types/rule-engine';
import { useAppliedRulesColumns } from '@/hooks/ptis/rule-engine/useAppliedRulesColumns';

interface AppliedRulesDrawerProps {
  open: boolean;
  onClose: () => void;
  propertyId?: number;
  propertyNo?: string;
  locale: string;
}

export function AppliedRulesDrawer({
  open,
  onClose,
  propertyId,
  propertyNo,
  locale
}: AppliedRulesDrawerProps) {
  const t = useTranslations('ptis');
  const [appliedRules, setAppliedRules] = useState<PropertyRuleLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns = useAppliedRulesColumns(locale);

  useEffect(() => {
    if (open && propertyId) {
      const fetchLogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await fetchPropertyRuleLogsAction(propertyId);
          if (result.success && result.data) {
            const items: PropertyRuleLogItem[] = result.data.items || [];
            items.sort((a, b) => a.applyOrder - b.applyOrder);
            setAppliedRules(items);
          } else {
            setError(result.error || t('appliedRules.errorFetching'));
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          setError(errorMsg || t('appliedRules.errorFetching'));
        } finally {
          setIsLoading(false);
        }
      };
      fetchLogs();
    }
  }, [open, propertyId, t]);

  const drawerTitle = (
    <div className="flex flex-col gap-1.5" id="drawer-title-container">
      <div className="flex items-center gap-2">
        <GitMerge className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-indigo-900" id="drawer-title">
          {t('appliedRules.drawerTitle')}
        </h3>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {propertyId && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 border border-indigo-100 text-indigo-700">
            {t('appliedRules.propertyId')}: {propertyId}
          </span>
        )}
        {propertyNo && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 border border-blue-100 text-blue-700">
            {t('appliedRules.propertyNo')}: {propertyNo}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={drawerTitle}
      width="xl"
    >
      {isLoading ? (
        <div className="p-10 flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium">{t('appliedRules.loading')}</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-600 font-medium">
          {error}
        </div>
      ) : appliedRules.length === 0 ? (
        <div className="p-10 flex flex-col items-center justify-center gap-2 text-slate-400">
          <p className="text-lg font-medium">{t('appliedRules.noAppliedRules')}</p>
        </div>
      ) : (
        <div className="p-6">
          <MasterTable
            columns={columns}
            data={appliedRules as unknown as Record<string, unknown>[]}
            paginationConfig={{ enabled: false }}
            containerClassName="border border-indigo-100 rounded-lg overflow-hidden shadow-sm"
            emptyText={t('appliedRules.noAppliedRules')}
          />
        </div>
      )}
    </Drawer>
  );
}

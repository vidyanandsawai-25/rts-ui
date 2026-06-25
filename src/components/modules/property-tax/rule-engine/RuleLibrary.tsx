'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Terminal } from 'lucide-react';
import { RuleItem, RuleScope } from '@/types/rule-engine';
import TableHeader from '@/components/common/TableHeader';
import { MasterTable } from '@/components/common';
import { Select } from '@/components/common/select';
import RuleExecutionDrawer from './RuleExecutionDrawer';
import RuleViewDrawer from './RuleViewDrawer';
import { useRuleLibraryColumns, RuleItemRecord } from '@/hooks/rule-engine/useRuleLibraryColumns';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useToast } from '@/components/common/ToastProvider';
import { fetchRuleByIdAction, fetchFullRulesAction, saveRuleAction } from '@/app/[locale]/property-tax/rule-engine/actions';
import RuleLibraryFilter from './RuleLibraryFilter';
import RuleLibraryActions from './RuleLibraryActions';

interface RuleLibraryProps {
  initialRules: RuleItem[];
  scopes: RuleScope[];
  locale: string;
  onDeleteRule: (id: number) => Promise<{ success: boolean; message: string }>;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  initialSearchTerm?: string;
}

export default function RuleLibrary({
  initialRules,
  scopes,
  locale,
  onDeleteRule,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  initialSearchTerm = '',
}: RuleLibraryProps) {
  const router = useRouter();
  const confirmCtx = useConfirm();
  const toast = useToast();
  const t = useTranslations('ruleEngine');
  const tCommon = useTranslations('common');

  const [rules, setRules] = React.useState<RuleItem[]>(initialRules);
  const [filterCategory, setFilterCategory] = React.useState<string>('ALL');
  const [searchTerm, setSearchTerm] = React.useState<string>(initialSearchTerm);
  const [activeRuleForTest, setActiveRuleForTest] = React.useState<RuleItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeRuleForView, setActiveRuleForView] = React.useState<RuleItem | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = React.useState(false);
  const [loadingRuleId, setLoadingRuleId] = React.useState<number | null>(null);
  const [togglingRuleId, setTogglingRuleId] = React.useState<number | null>(null);

  const handleToggleActive = async (row: RuleItemRecord, newChecked: boolean) => {
    if (!row.id) return;
    setTogglingRuleId(row.id);
    try {
      // 1. Fetch full rule details to avoid overwriting JSON fields with empty/summary data
      const fullRule = await fetchRuleByIdAction(row.id);
      if (!fullRule) {
        toast.error('Failed to load rule details');
        return;
      }

      // 2. Prepare payload with updated isActive/isEnabled state
      const updatedPayload: RuleItem = {
        ...fullRule,
        isActive: newChecked,
      };

      // 3. Save the rule via server action
      const res = await saveRuleAction(updatedPayload);
      if (res.success) {
        // 4. Update the local state
        setRules((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, isActive: newChecked } : r))
        );
        toast.success(
          newChecked
            ? t('library.enabledSuccess')
            : t('library.disabledSuccess')
        );
      } else {
        toast.error(res.message || 'Failed to update rule status');
      }
    } catch {
      toast.error('An error occurred while updating status');
    } finally {
      setTogglingRuleId(null);
    }
  };


  const handleOpenTestDrawer = async (rule: RuleItem) => {
    if (!rule.id) return;
    setLoadingRuleId(rule.id);
    try {
      const fullRule = await fetchRuleByIdAction(rule.id);
      if (fullRule) {
        setActiveRuleForTest(fullRule);
        setIsDrawerOpen(true);
      } else {
        toast.error('Failed to load rule details');
      }
    } catch {
      toast.error('An error occurred while loading rule details');
    } finally {
      setLoadingRuleId(null);
    }
  };

  const handleOpenViewDrawer = async (rule: RuleItem) => {
    if (!rule.id) return;
    setLoadingRuleId(rule.id);
    try {
      const fullRule = await fetchRuleByIdAction(rule.id);
      if (fullRule) {
        setActiveRuleForView(fullRule);
        setIsViewDrawerOpen(true);
      } else {
        toast.error('Failed to load rule details');
      }
    } catch {
      toast.error('An error occurred while loading rule details');
    } finally {
      setLoadingRuleId(null);
    }
  };
  const handleOpenGlobalTestDrawer = async () => {
    setLoadingRuleId(-1);
    try {
      const targetCategory = filterCategory === 'ALL' ? 'ALL' : filterCategory;
      const scopeId = scopes[0]?.id || 1;
      const fullRulesResult = await fetchFullRulesAction(scopeId);
      const catRules = targetCategory === 'ALL'
        ? (fullRulesResult?.items || [])
        : (fullRulesResult?.items || []).filter(r => r.ruleCategory === targetCategory);
      const allBlocks: (Record<string, unknown> & { ruleCategory?: string })[] = [];
      const allEngineRules: Record<string, unknown>[] = [];
      catRules.forEach(rule => {
        try {
          if (rule.conditionsJson) {
            const parsed = JSON.parse(rule.conditionsJson);
            if (Array.isArray(parsed)) {
              parsed.forEach((b: Record<string, unknown>) => {
                b.ruleCategory = rule.ruleCategory;
              });
              allBlocks.push(...parsed);
            } else {
              allBlocks.push({ conditions: parsed, ruleCategory: rule.ruleCategory });
            }
          }
          if (rule.ruleJson) {
            const parsedJson = JSON.parse(rule.ruleJson);
            const rulesList = parsedJson.rules || parsedJson.Rules || [];
            if (Array.isArray(rulesList)) {
              allEngineRules.push(...rulesList);
            }
          }
        } catch {}
      });

      setActiveRuleForTest({
        id: -1,
        ruleName: 'Global Simulation',
        ruleCode: targetCategory,
        ruleCategory: targetCategory,
        ruleScopeId: scopeId,
        isActive: true,
        conditionsJson: JSON.stringify(allBlocks),
        ruleJson: JSON.stringify({ rules: allEngineRules }),
        effectJson: '{}',
      });
      setIsDrawerOpen(true);
    } catch {
      toast.error('Failed to load full rule configurations for simulation');
    } finally {
      setLoadingRuleId(null);
    }
  };

  React.useEffect(() => {
    Promise.resolve().then(() => {
      setRules(initialRules);
    });
  }, [initialRules]);

  const pushRoute = React.useCallback((page: number, size: number | string) => {
    const q = searchTerm.trim();
    router.push(`/${locale}/property-tax/rule-engine?page=${page}&pageSize=${size}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
  }, [searchTerm, locale, router]);

  React.useEffect(() => {
    if (searchTerm === initialSearchTerm) return;
    const delayDebounceFn = setTimeout(() => pushRoute(1, pageSize), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, initialSearchTerm, pushRoute, pageSize]);

  const handlePageChange = (page: number) => pushRoute(page, pageSize);
  const handlePageSizeChange = (size: string) => pushRoute(1, size);

  const handleDelete = (id: number) => {
    confirmCtx.confirm({
      variant: 'delete',
      title: t('library.deleteTitle'),
      description: t('library.deleteDescription'),
      confirmText: t('library.deleteConfirm'),
      cancelText: t('library.deleteCancel'),
      onConfirm: async () => {
        const res = await onDeleteRule(id);
        if (res.success) {
          setRules(rules.filter((r) => r.id !== id));
          toast.success(t('library.deleteSuccess'));
        } else {
          toast.error(res.message);
        }
      },
    });
  };

  const filteredRules = React.useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        (rule.ruleName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (rule.ruleCode || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || rule.ruleCategory === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [rules, filterCategory, searchTerm]);

  const categoryFilterOptions = React.useMemo(() => {
    const cats = Array.from(new Set(rules.map((r) => r.ruleCategory).filter(Boolean)));
    return [{ label: t('library.allCategories'), value: 'ALL' }, ...cats.map((cat) => ({ label: cat as string, value: cat as string }))];
  }, [rules, t]);

  const columns = useRuleLibraryColumns({
    t,
    onToggleActive: handleToggleActive,
    togglingRuleId,
  });

  return (
    <div className="flex flex-col gap-4.5 w-full select-none">
      <TableHeader
        title={t('header.configTitle')}
        subtitle={t('header.configSubtitle')}
        icon="settings"
        actionLabel={t('header.configureNew')}
        onActionClick={() => router.push(`/${locale}/property-tax/rule-engine/new`)}
        rightContent={
          <button
            onClick={handleOpenGlobalTestDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Terminal className="w-4 h-4 text-slate-600" />
            <span>{t('simulation.dryRunAll')}</span>
          </button>
        }
      />

      <RuleLibraryFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categoryFilterOptions={categoryFilterOptions}
        searchPlaceholder={t('library.searchByCodeOrName')}
      />

      <MasterTable<RuleItemRecord>
        columns={columns}
        data={filteredRules as RuleItemRecord[]}
        isPagination={true}
        pageSize={pageSize}
        totalCount={totalCount}
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        renderActions={(row) => (
          <RuleLibraryActions
            row={row}
            locale={locale}
            loadingRuleId={loadingRuleId}
            handleOpenViewDrawer={handleOpenViewDrawer}
            handleOpenTestDrawer={handleOpenTestDrawer}
            handleDelete={handleDelete}
            router={router}
          />
        )}
        footerLeftContent={
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {tCommon("table.showingEntries", { start: totalCount > 0 ? (pageNumber - 1) * pageSize + 1 : 0, end: Math.min(pageNumber * pageSize, totalCount), total: totalCount })}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
              <Select
                value={String(pageSize)}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                options={[10, 20, 30, 40, 50].map((s) => ({ label: String(s), value: String(s) }))}
                selectSize="sm"
                className="w-20"
                ariaLabel={tCommon("table.rowsPerPage") || "Rows per page"}
              />
            </div>
          </div>
        }
      />
      <RuleExecutionDrawer
        rule={activeRuleForTest}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <RuleViewDrawer
        rule={activeRuleForView}
        open={isViewDrawerOpen}
        onClose={() => setIsViewDrawerOpen(false)}
        scopeName={scopes.find((s) => s.id === activeRuleForView?.ruleScopeId)?.scopeName}
      />
    </div>
  );
}

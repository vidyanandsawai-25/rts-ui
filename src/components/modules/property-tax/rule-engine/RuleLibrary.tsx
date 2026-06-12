'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RuleItem, RuleScope } from '@/types/rule-engine.types';
import TableHeader from '@/components/common/TableHeader';
import { MasterTable, SearchSelect } from '@/components/common';
import { Select } from '@/components/common/select';
import { Input } from '@/components/common/Input';
import { EditButton, DeleteButton, ExecuteTestButton, ViewButton } from '@/components/common/ActionButtons';
import RuleExecutionDrawer from './RuleExecutionDrawer';
import RuleViewDrawer from './RuleViewDrawer';
import { useRuleLibraryColumns, RuleItemRecord } from './useRuleLibraryColumns';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useToast } from '@/components/common/ToastProvider';

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

  const handleOpenTestDrawer = (rule: RuleItem) => {
    setActiveRuleForTest(rule);
    setIsDrawerOpen(true);
  };

  const handleOpenViewDrawer = (rule: RuleItem) => {
    setActiveRuleForView(rule);
    setIsViewDrawerOpen(true);
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
    const delayDebounceFn = setTimeout(() => pushRoute(1, pageSize), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [pushRoute, pageSize]);

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

  const columns = useRuleLibraryColumns({ t });

  return (
    <div className="flex flex-col gap-4.5 w-full select-none">
      <TableHeader
        title={t('header.configTitle')}
        subtitle={t('header.configSubtitle')}
        icon="settings"
        actionLabel={t('header.configureNew')}
        onActionClick={() => router.push(`/${locale}/property-tax/rule-engine/new`)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 bg-white p-4 border border-blue-200 rounded-xl shadow-sm">
        <Input
          placeholder={t('library.searchByCodeOrName')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchSelect options={categoryFilterOptions} value={filterCategory} onChange={(_e, val) => setFilterCategory(val)} />
      </div>

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
          <div className="flex items-center gap-1.5 justify-center">
            <ViewButton onClick={() => handleOpenViewDrawer(row)} />
            <ExecuteTestButton onClick={() => handleOpenTestDrawer(row)} />
            <EditButton onClick={() => router.push(`/${locale}/property-tax/rule-engine/${row.id}`)} />
            <DeleteButton onClick={() => row.id !== undefined && handleDelete(row.id)} />
          </div>
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

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RuleItem, RuleScope } from '@/types/rule-engine.types';
import TableHeader from '@/components/common/TableHeader';
import { MasterTable, Column, SearchSelect } from '@/components/common';
import { Select } from '@/components/common/select';
import { Input } from '@/components/common/Input';
import { EditButton, DeleteButton, ExecuteTestButton } from '@/components/common/ActionButtons';
import RuleExecutionDrawer from './RuleExecutionDrawer';
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
  const tCommon = useTranslations('common');

  const [rules, setRules] = React.useState<RuleItem[]>(initialRules);
  const [filterCategory, setFilterCategory] = React.useState<string>('ALL');
  const [searchTerm, setSearchTerm] = React.useState<string>(initialSearchTerm);
  const [activeRuleForTest, setActiveRuleForTest] = React.useState<RuleItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleOpenTestDrawer = (rule: RuleItem) => {
    setActiveRuleForTest(rule);
    setIsDrawerOpen(true);
  };

  React.useEffect(() => {
    Promise.resolve().then(() => {
      setRules(initialRules);
    });
  }, [initialRules]);

  // Debounced search navigation
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const q = searchTerm.trim();
      router.push(`/${locale}/property-tax/rule-engine?page=1&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pageSize, locale, router]);

  const handlePageChange = (page: number) => {
    const q = searchTerm.trim();
    router.push(`/${locale}/property-tax/rule-engine?page=${page}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
  };

  const handlePageSizeChange = (size: string) => {
    const q = searchTerm.trim();
    router.push(`/${locale}/property-tax/rule-engine?page=1&pageSize=${size}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
  };

  const handleDelete = (id: number) => {
    confirmCtx.confirm({
      variant: 'delete',
      title: 'Delete Calculation Rule?',
      description: 'Are you sure you want to permanently delete this policy rule? This action cannot be undone and will impact property tax demand runs.',
      confirmText: 'Permanently Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const res = await onDeleteRule(id);
        if (res.success) {
          setRules(rules.filter((r) => r.id !== id));
          toast.success('Rule purged successfully');
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
    const categories = Array.from(new Set(rules.map((r) => r.ruleCategory).filter(Boolean)));
    const list = categories.map((cat) => ({ label: cat as string, value: cat as string }));
    list.unshift({ label: 'All Categories', value: 'ALL' });
    return list;
  }, [rules]);



  type RuleItemRecord = RuleItem & Record<string, unknown>;

  const columns: Column<RuleItemRecord>[] = [
    { key: 'ruleCode', label: 'Rule Code', width: '150px' },
    { key: 'ruleName', label: 'Rule Name', width: '130px' },
    {
      key: 'description',
      label: 'Description',
      render: (val: unknown) => typeof val === 'string' && val
        ? <span title={val} className="text-xs text-gray-600 line-clamp-1 max-w-[180px] block">{val}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },

    { key: 'ruleCategory', label: 'Category', width: '140px' },
    { key: 'isActive', label: 'Status', width: '110px', isStatus: true },
  ];


  return (
    <div className="flex flex-col gap-4.5 w-full select-none">
      {/* 1. Header Component */}
      <TableHeader
        title="Rule Engine Configuration"
        subtitle="Manage complex dynamic taxation policies, exemptions, modifiers and multiplier criteria visually."
        icon="settings"
        actionLabel="Configure New Rule"
        onActionClick={() => router.push(`/${locale}/property-tax/rule-engine/new`)}
      />

      {/* 2. Advanced filters block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 bg-white p-4 border border-blue-200 rounded-xl shadow-sm">
        <Input
          placeholder="Search by Code or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchSelect options={categoryFilterOptions} value={filterCategory} onChange={(_e, val) => setFilterCategory(val)} />
      </div>

      {/* 3. Rule list master table */}
      <MasterTable<RuleItemRecord>
        columns={columns}
        data={filteredRules as RuleItemRecord[]}
        isPagination={true}
        pageSize={pageSize}
        totalCount={totalCount}
        pageNumber={pageNumber}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        actionLabel="Actions"
        renderActions={(row) => (
          <div className="flex items-center gap-1.5 justify-center">
            <ExecuteTestButton onClick={() => handleOpenTestDrawer(row)} />
            <EditButton onClick={() => router.push(`/${locale}/property-tax/rule-engine/${row.id}`)} />
            <DeleteButton onClick={() => { if (row.id !== undefined) handleDelete(row.id); }} />
          </div>
        )}
        footerLeftContent={
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              {tCommon("table.showingEntries", {
                start: totalCount > 0 ? (pageNumber - 1) * pageSize + 1 : 0,
                end: Math.min(pageNumber * pageSize, totalCount),
                total: totalCount
              })}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
              <Select
                value={String(pageSize)}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                options={[10, 20, 30, 40, 50].map((s) => ({
                  label: String(s),
                  value: String(s),
                }))}
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
    </div>
  );
}

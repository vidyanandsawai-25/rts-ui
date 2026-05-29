'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RuleItem, RuleScope } from '@/types/rule-engine.types';
import TableHeader from '@/components/common/TableHeader';
import { MasterTable, Column } from '@/components/common/MasterTable';
import { Select } from '@/components/common/select';
import { Input } from '@/components/common/Input';
import { EditButton, DeleteButton } from '@/components/common/ActionButtons';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useToast } from '@/components/common/ToastProvider';

interface RuleLibraryProps {
  initialRules: RuleItem[];
  scopes: RuleScope[];
  locale: string;
  onDeleteRule: (id: number) => Promise<{ success: boolean; message: string }>;
}


export default function RuleLibrary({
  initialRules,
  locale,
  onDeleteRule,
}: RuleLibraryProps) {
  const router = useRouter();
  const confirmCtx = useConfirm();
  const toast = useToast();

  const [rules, setRules] = React.useState<RuleItem[]>(initialRules);
  const [filterCategory, setFilterCategory] = React.useState<string>('ALL');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

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



  const columns: Column<any>[] = [
    { key: 'ruleCode', label: 'Rule Code', width: '150px' },
    { key: 'ruleName', label: 'Rule Name', width: '130px' },
    {
      key: 'description',
      label: 'Description',
      render: (val: string) => val
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
        <Select options={categoryFilterOptions} value={filterCategory} onChange={(_e, val) => setFilterCategory(val)} />
      </div>

      {/* 3. Rule list master table */}
      <MasterTable<any>
        columns={columns}
        data={filteredRules}
        isPagination={true}
        pageSize={10}
        totalCount={filteredRules.length}
        pageNumber={1}
        totalPages={1}
        actionLabel="Actions"
        renderActions={(row) => (
          <div className="flex items-center gap-1.5 justify-center">
            <EditButton onClick={() => router.push(`/${locale}/property-tax/rule-engine/${row.id}`)} />
            <DeleteButton onClick={() => { if (row.id !== undefined) handleDelete(row.id); }} />
          </div>
        )}
      />
    </div>
  );
}

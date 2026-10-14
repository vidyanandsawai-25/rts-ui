'use client';

import { useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { AddButton, Card, MasterTable, SearchButton, SearchInput } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import type { MasterPage, RolePermission } from '@/types/rts/access-management.types';

export type RoleWiseScreenAccessRow = RolePermission &
  Record<string, unknown> & {
    roleName: string;
    screenCode: string;
    screenName: string;
    routePath: string;
    departmentName: string;
    moduleName: string;
    groupName: string;
    mappingState: 'Configured' | 'Explicit no access' | 'Inactive';
    createdAudit: string;
    updatedAudit: string;
    source: RolePermission;
  };

interface RoleWiseScreenAccessTabProps {
  page: MasterPage<RolePermission>;
  rows: RoleWiseScreenAccessRow[];
  columns: Column<RoleWiseScreenAccessRow>[];
  busy: boolean;
  canAdd: boolean;
  onAdd: () => void;
  title: string;
  description: string;
  search: string;
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  renderActions: (row: RoleWiseScreenAccessRow) => ReactNode;
  tableClassName: string;
  containerClassName: string;
  theadClassName: string;
}

export function RoleWiseScreenAccessTab({
  page,
  rows,
  columns,
  busy,
  canAdd,
  onAdd,
  title,
  description,
  search,
  onSearch,
  onPageChange,
  renderActions,
  tableClassName,
  containerClassName,
  theadClassName,
}: RoleWiseScreenAccessTabProps) {
  const t = useTranslations('rts.accessManagement');
  const [searchValue, setSearchValue] = useState(search);
  return (
    <section className="space-y-3">
      <Card className="flex items-center justify-between gap-3 border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <AddButton disabled={busy || !canAdd} label="Add access" onClick={onAdd} />
      </Card>
      <Card className="border border-slate-200 bg-white p-3 shadow-sm">
        <div className="max-w-xl space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-500">{t('search')}</label>
          <div className="flex gap-2">
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              onEnter={() => onSearch(searchValue)}
              ariaLabel="Search role-screen access"
              placeholder="Search by role, screen, or code"
              className="mb-0 w-full [&_input]:py-1.5 [&_input]:text-xs"
            />
            <SearchButton
              size="sm"
              label="Search"
              disabled={busy}
              onClick={() => onSearch(searchValue)}
            />
          </div>
        </div>
      </Card>
      <MasterTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        emptyText="No role-screen access records found."
        actionLabel="Actions"
        pageNumber={page.pageNumber}
        pageSize={page.pageSize}
        totalCount={page.totalCount}
        totalPages={page.totalPages}
        onPageChange={onPageChange}
        paginationConfig={{ enabled: page.totalPages > 1, showPageSizeSelector: false }}
        maxBodyHeightClassName="min-h-[200px] max-h-none"
        theadClassName={theadClassName}
        tableClassName={tableClassName}
        containerClassName={containerClassName}
        renderActions={renderActions}
      />
    </section>
  );
}

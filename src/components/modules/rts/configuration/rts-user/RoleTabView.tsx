'use client';

import type { ReactNode } from 'react';
import { AddButton, Card, MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import type { AccessRole, MasterPage } from '@/types/rts/access-management.types';

export type RoleTableRow = AccessRole &
  Record<string, unknown> & {
    departmentName: string;
    source: AccessRole;
  };

interface RoleTabViewProps {
  busy: boolean;
  title: string;
  description: string;
  onAdd: () => void;
  page: MasterPage<AccessRole>;
  rows: RoleTableRow[];
  columns: Column<RoleTableRow>[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  renderActions: (row: RoleTableRow) => ReactNode;
  tableClassName: string;
  containerClassName: string;
  theadClassName: string;
}

export function RoleTabView({
  busy,
  title,
  description,
  onAdd,
  page,
  rows,
  columns,
  onPageChange,
  onPageSizeChange,
  renderActions,
  tableClassName,
  containerClassName,
  theadClassName,
}: RoleTabViewProps) {
  return (
    <section className="space-y-3">
      <Card className="flex items-center justify-between gap-3 border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <AddButton disabled={busy} label="Add role" onClick={onAdd} />
      </Card>
      <MasterTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        emptyText="No roles found."
        actionLabel="Actions"
        pageNumber={page.pageNumber}
        pageSize={page.pageSize}
        totalCount={page.totalCount}
        totalPages={page.totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        paginationConfig={{ enabled: page.totalPages > 1, showPageSizeSelector: true }}
        pageSizeOptions={[10, 25, 50, 100]}
        maxBodyHeightClassName="min-h-[200px] max-h-none"
        theadClassName={theadClassName}
        tableClassName={tableClassName}
        containerClassName={containerClassName}
        renderActions={renderActions}
      />
    </section>
  );
}

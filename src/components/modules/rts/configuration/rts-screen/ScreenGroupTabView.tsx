'use client';

import type { ReactNode } from 'react';
import { AddButton, Card, MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import type { AccessGroup, MasterPage } from '@/types/rts/access-management.types';

export type ScreenGroupTableRow = AccessGroup & Record<string, unknown> & { source: AccessGroup };

export function ScreenGroupTabView({
  busy,
  onAdd,
  title,
  description,
  page,
  rows,
  columns,
  onPageChange,
  onPageSizeChange,
  renderActions,
  tableClassName,
  containerClassName,
  theadClassName,
}: {
  busy: boolean;
  onAdd: () => void;
  title: string;
  description: string;
  page: MasterPage<AccessGroup>;
  rows: ScreenGroupTableRow[];
  columns: Column<ScreenGroupTableRow>[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  renderActions: (row: ScreenGroupTableRow) => ReactNode;
  tableClassName: string;
  containerClassName: string;
  theadClassName: string;
}) {
  return (
    <section className="space-y-3">
      <Card className="flex items-center justify-between gap-3 border border-slate-200 bg-white p-3 shadow-sm">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <AddButton disabled={busy} label="Add group" onClick={onAdd} />
      </Card>
      <MasterTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        emptyText="No groups found."
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

'use client';

import type { ReactNode } from 'react';
import { AddButton, Card, MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import type { AccessScreen, MasterPage } from '@/types/rts/access-management.types';

export type ScreenTableRow = AccessScreen &
  Record<string, unknown> & {
    screenGroupName: string;
    departmentName: string;
    moduleName: string;
    source: AccessScreen;
  };

export function ScreensTabView({
  busy,
  canAdd,
  onAdd,
  title,
  description,
  page,
  rows,
  columns,
  onPageChange,
  onPageSizeChange,
  renderActions,
  showActions,
  tableClassName,
  containerClassName,
  theadClassName,
}: {
  busy: boolean;
  canAdd: boolean;
  onAdd: () => void;
  title: string;
  description: string;
  page: MasterPage<AccessScreen>;
  rows: ScreenTableRow[];
  columns: Column<ScreenTableRow>[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  renderActions?: (row: ScreenTableRow) => ReactNode;
  showActions?: boolean;
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
        <AddButton disabled={busy || !canAdd} label="Add screen" onClick={onAdd} />
      </Card>
      <MasterTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        emptyText="No screens found for this page or selection."
        actionLabel={showActions ? 'Actions' : undefined}
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

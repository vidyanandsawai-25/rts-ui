import { Shield, Edit2, Trash2, Loader2 } from 'lucide-react';
import { MasterTable, Badge, Button } from '@/components/common';
import { useTranslations } from 'next-intl';
import { Role, RoleTableProps } from '@/types/user-management';

export function RoleTable({
  roles,
  pageNumber,
  pageSize,
  totalCount,
  onPageChange,
  onEdit,
  onDelete,
  deletingId,
}: RoleTableProps) {
  const t = useTranslations('userManagement');

  const columns = [
    {
      key: 'name',
      label: t('table.role'),
      width: '45%',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-primary/10 to-primary/20 rounded shadow-sm">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('filters.status'),
      width: '15%',
      render: (_: unknown, row: Role) => (
        <Badge
          className={
            row.isActive
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-red-100 text-red-700 border-red-200'
          }
        >
          {row.isActive ? t('filters.active') : t('filters.inactive')}
        </Badge>
      ),
    },
  ];

  return (
    <MasterTable<Role>
      data={roles}
      emptyText={t('messages.noRoles')}
      columns={columns}
      pageSize={pageSize}
      pageNumber={pageNumber}
      totalCount={totalCount}
      totalPages={Math.ceil(totalCount / pageSize)}
      onPageChange={onPageChange}
      renderActions={(row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(row)}
            aria-label={t('actions.edit')}
            className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(row)}
            aria-label={t('actions.delete')}
            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 disabled:opacity-50"
            disabled={deletingId === row.id}
          >
            {deletingId === row.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      isPagination={true}
      actionLabel={t('table.actions')}
      getRowKey={(role) => role.id}
    />
  );
}

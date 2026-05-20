'use client';

import { Mail, Phone, CheckCircle2, XCircle, Edit2, Trash2, Loader2 } from 'lucide-react';
import { MasterTable, Badge, Button } from '@/components/common';
import { useTranslations } from 'next-intl';
import { User, UserTableProps } from '@/types/user-management';

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    Administrator:
      'bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-700 border-purple-500/30 ring-1 ring-purple-500/20',
    'Department Head':
      'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-700 border-blue-500/30 ring-1 ring-blue-500/20',
    Officer:
      'bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 text-indigo-700 border-indigo-500/30 ring-1 ring-indigo-500/20',
    Clerk:
      'bg-gradient-to-r from-slate-500/10 to-slate-600/10 text-slate-700 border-slate-500/30 ring-1 ring-slate-500/20',
  };
  return colors[role] || colors['Clerk'];
};

export function UserTable({
  users,
  totalCount,
  totalPages,
  onEdit,
  onDelete,
  pageNumber,
  pageSize,
  onPageChange,
  deletingId,
}: UserTableProps) {
  const t = useTranslations('userManagement');

  const columns = [
    {
      label: t('table.user'),
      key: 'userName' as const,
      render: (value: unknown, row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary/10 to-primary/20 flex items-center justify-center border border-primary/20">
            <span className="text-sm font-bold text-primary">{(value as string).charAt(0)}</span>
          </div>
          <div>
            <div className="font-bold text-slate-800">{value as string}</div>
            <div className="text-xs text-slate-500">
              {[row.firstName, row.middleName, row.lastName].filter(Boolean).join(' ')}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: t('table.contact'),
      key: 'mobileNo' as const,
      render: (value: unknown, row: User) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-mono">{value as string}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Mail className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      label: t('table.role'),
      key: 'roles' as const,
      render: (value: unknown) => (
        <div className="flex flex-wrap gap-1">
          {(value as string[]).map((role, idx) => (
            <Badge key={idx} className={`px-2 py-0.5 text-[10px] ${getRoleBadgeColor(role)}`}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      label: t('table.departments'),
      key: 'departmentNames' as const,
      render: (value: unknown) => {
        const items = value as string[];
        return (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {items.map((val, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="px-1.5 py-0 text-[10px] bg-slate-50 text-slate-600 border-slate-200"
              >
                {val}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      label: t('table.modules'),
      key: 'moduleNames' as const,
      render: (value: unknown) => {
        const items = value as string[];
        return (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {items.map((val, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="px-1.5 py-0 text-[10px] bg-indigo-50 text-indigo-600 border-indigo-100"
              >
                {val}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      label: t('table.status'),
      key: 'status' as const,
      render: (value: unknown) => (
        <div className="flex items-center gap-1.5">
          {(value as string) === 'Active' ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase">{t('filters.active')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100">
              <XCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase">{t('filters.inactive')}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      label: t('actions.title'),
      key: 'id' as const,
      render: (_: unknown, row: User) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(row)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
            title={t('actions.edit')}
            aria-label={t('actions.edit')}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(row.id)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 disabled:opacity-50"
            title={t('actions.delete')}
            aria-label={t('actions.delete')}
            disabled={deletingId === row.id}
          >
            {deletingId === row.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MasterTable
      data={users}
      columns={columns}
      pageNumber={pageNumber}
      pageSize={pageSize}
      totalCount={totalCount}
      totalPages={totalPages}
      onPageChange={onPageChange}
      isPagination={true}
      isPageSize={false}
      containerClassName="border-none shadow-none bg-transparent"
    />
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Filter, XCircle } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Badge, Button } from '@/components/common';
import { toast } from 'sonner';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
import { useTranslations, useLocale } from 'next-intl';
import { User, UserManagementProps, UserStatusFilter } from '@/types/user-management';
import { deleteUserAction } from '@/app/[locale]/configuration-settings/user-management/actions.mutations';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useUserTable } from '@/hooks/configuration-settings/user-management/useUserTable';
import { UserStats } from './components/UserStats';
import { UserFilters } from './components/UserFilters';
import { UserTable } from './components/UserTable';

function getStatusFilterFromUrl(value: string | null): UserStatusFilter {
  switch (value) {
    case 'active':
    case 'inactive':
    case 'highest':
    case 'lowest':
      return value;
    default:
      return 'all';
  }
}

function isActiveUser(user: User): boolean {
  return user.status?.toLowerCase() === 'active' || user.isActive === true;
}

export function UserManagementClient({
  initialUsers = [],
  initialTotalCount = 0,
}: UserManagementProps) {
  const t = useTranslations('userManagement');
  const { confirm } = useConfirm();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageFromUrl = Number(searchParams.get('page')) || 1;
  const searchFromUrl = searchParams.get('search') || '';
  const statusFromUrl = getStatusFilterFromUrl(searchParams.get('status'));

  const {
    users,
    setUsers,
    searchTerm,
    setSearchTerm,
    cardFilter,
    handleCardClick: baseHandleCardClick,
    pageNumber,
    pageSize,
    totalCount,
    filteredUsers,
  } = useUserTable(initialUsers, initialTotalCount, pageFromUrl, searchFromUrl, statusFromUrl);

  const getLocalizedFilterName = (filter: UserStatusFilter): string => {
    switch (filter) {
      case 'active':
        return t('filters.active');

      case 'inactive':
        return t('filters.inactive');

      case 'highest':
        return t('stats.highestProductive');

      case 'lowest':
        return t('stats.lowestProductive');

      case 'all':
      default:
        return t('filters.all');
    }
  };

  const handleCardClick = (filter: UserStatusFilter) => {
    baseHandleCardClick(filter);

    const params = new URLSearchParams(searchParams.toString());

    if (filter === 'active' || filter === 'inactive') {
      params.set('status', filter);
    } else {
      params.delete('status');
    }

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const locale = useLocale();
  const basePath = `/${locale}/configuration-settings/user-management`;

  const handleEdit = (user: User) => {
    router.push(`${basePath}/users/edit/${user.id}`);
  };

  const handleDelete = async (id: string) => {
    confirm({
      variant: 'delete',
      onConfirm: async () => {
        setDeletingId(id);
        try {
          const res = await deleteUserAction(id);

          if (res.success) {
            setUsers(
              users.map((user) =>
                user.id === id ? { ...user, status: 'Inactive', isActive: false } : user
              )
            );

            toast.success(t('messages.deleteSuccess'));
          } else {
            let errorMsg = res.message || t('messages.deleteError');
            if (res.message) {
              if (res.message.startsWith('messages.') || res.message.startsWith('errors.')) {
                errorMsg = t(res.message);
              } else {
                errorMsg = getCleanErrorMessage(res.message);
              }
            }
            toast.error(errorMsg);
          }
        } catch (error) {
          toast.error(getCleanErrorMessage(error, t('messages.deleteError')));
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (searchTerm === searchFromUrl) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      } else {
        params.delete('search');
      }

      params.set('page', '1');

      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pathname, router, searchFromUrl, searchParams]);

  const handleSearchChange = (newSearch: string) => {
    setSearchTerm(newSearch);
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(isActiveUser).length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-0 py-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg shadow-sm">
            <Users className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-black">{t('title')}</h1>
            <p className="text-slate-700 mt-0.5 text-sm">{t('subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 h-10">
            <Users className="w-3 h-3 mr-1" />
            {t('stats.usersCount', {
              count: initialTotalCount || totalUsers,
            })}
          </Badge>

          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 h-10">
            <UserCheck className="w-3 h-3 mr-1" />
            {activeUsers} {t('filters.active')}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <UserStats users={users} cardFilter={cardFilter} onCardClick={handleCardClick} />

          {cardFilter !== 'all' && (
            <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />

                <span className="text-sm font-medium text-indigo-700">
                  {t('filters.filtering', {
                    name: getLocalizedFilterName(cardFilter),
                  })}
                </span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCardClick('all')}
                className="h-7 text-xs text-indigo-600 hover:bg-indigo-100"
              >
                <XCircle className="w-3 h-3 mr-1" />
                {t('filters.clearFilter')}
              </Button>
            </div>
          )}

          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddClick={() => router.push(`${basePath}/users/add`)}
          />

          <UserTable
            users={filteredUsers}
            totalCount={totalCount}
            totalPages={Math.ceil(totalCount / pageSize)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            pageNumber={pageNumber}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            deletingId={deletingId}
          />
        </div>
      </div>
    </div>
  );
}

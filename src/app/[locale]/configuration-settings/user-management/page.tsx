import { UserConfiguration } from '@/components/modules/configuration-settings/user-management/UserConfiguration';
import { getTranslations } from 'next-intl/server';
import {
  getUsersAction,
  getUserRolesAction,
  getDepartmentsAction,
  getDesignationsAction,
} from './actions';
import { executeConditionalFetches } from '@/lib/utils/fetch-helpers';

interface UserManagementPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    size?: string;
    search?: string;
    status?: string;
    role?: string;
    tab?: string;
  }>;
}

type UserManagementTab = 'users' | 'roles';

function getActiveTab(tab?: string): UserManagementTab {
  return tab === 'roles' ? 'roles' : 'users';
}

function getPageNumber(value?: string): number {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function getPageSize(pageSize?: string, size?: string): number {
  const resolvedSize = Number(pageSize || size);
  return Number.isFinite(resolvedSize) && resolvedSize > 0 ? resolvedSize : 10;
}

function getStatusFilter(status?: string): boolean | undefined {
  if (!status || status === 'all') return undefined;
  return status === 'active';
}

export default async function UserManagementPage({
  params,
  searchParams,
}: UserManagementPageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  const t = await getTranslations({ locale, namespace: 'userManagement' });

  const activeTab = getActiveTab(sp?.tab);
  const isUsersTab = activeTab === 'users';
  const isRolesTab = activeTab === 'roles';

  const page = getPageNumber(sp?.page);
  const pageSize = getPageSize(sp?.pageSize, sp?.size);
  const searchTerm = sp?.search?.trim() || undefined;
  const status = getStatusFilter(sp?.status);

  const fetchData = await executeConditionalFetches({
    users: {
      condition: isUsersTab,
      fetcher: () => getUsersAction(page, pageSize, searchTerm, status),
      fallback: {
        items: [],
        totalCount: 0,
        pageNumber: page,
        pageSize,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      },
      errorMessage: t('errors.apiConnection.fetchUsersFailed'),
    },

    roles: {
      condition: isRolesTab,
      fetcher: () => getUserRolesAction(),
      fallback: [],
      errorMessage: t('errors.apiConnection.fetchRolesFailed'),
    },

    departments: {
      condition: isRolesTab,
      fetcher: () => getDepartmentsAction(),
      fallback: [],
      errorMessage: t('errors.apiConnection.fetchDepartmentsFailed'),
    },

    designations: {
      condition: isRolesTab,
      fetcher: () => getDesignationsAction(),
      fallback: [],
      errorMessage: t('errors.apiConnection.fetchDesignationsFailed'),
    },
  });

  return (
    <UserConfiguration
      translations={{
        title: t('config.title'),
        subtitle: t('config.subtitle'),
        usersTab: t('config.usersTab'),
        rolesTab: t('config.rolesTab'),
      }}
      initialData={{
        users: fetchData.users.items || [],
        totalCount: fetchData.users.totalCount || 0,
        roles: fetchData.roles || [],
        departments: fetchData.departments || [],
        designations: fetchData.designations || [],
      }}
    />
  );
}

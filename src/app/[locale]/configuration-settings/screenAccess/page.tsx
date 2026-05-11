import { getTranslations } from 'next-intl/server';
import { ScreenAccessLayout } from '@/components/modules/configuration-settings/screenAccess/ScreenAccessLayout';
import {
  getScreensAction,
  getAllScreensAction,
  getScreenGroupsAction,
  getDepartmentsAction,
  getRolesAction,
  getModulesAction,
  getScreenAccessWithAllScreensAction,
} from './action';
import { mapPagination } from './page.utils';
import { executeConditionalFetches } from '@/lib/utils/fetch-helpers';
import type { ScreenAccessPermissionData } from '@/types/screen-access.types';

export const dynamic = 'force-dynamic';

interface ScreenAccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    spage?: string;
    ssize?: string;
    search?: string;
    status?: string;
    gpage?: string;
    gsize?: string;
    gsearch?: string;
    gstatus?: string;
    tab?: string;
    subTab?: string;
    roleId?: string;
    sgroup?: string;
  }>;
}

export default async function ScreenAccessPage({ params, searchParams }: ScreenAccessPageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  // Search/Filters/Pagination Params
  const spage = Number(sp?.spage) || 1;
  const ssize = Number(sp?.ssize) || 10;
  const gpage = Number(sp?.gpage) || 1;
  const gsize = Number(sp?.gsize) || 10;

  const tab = sp?.tab || 'screen-management';
  const subTab = sp?.subTab || 'screens';

  const parsedGroup = sp?.sgroup && sp.sgroup !== 'all' ? parseInt(sp.sgroup, 10) : undefined;
  const groupFilter = !Number.isNaN(parsedGroup) ? parsedGroup : undefined;

  const parsedRoleId = sp?.roleId ? parseInt(sp.roleId, 10) : undefined;
  const roleIdFromUrl = !Number.isNaN(parsedRoleId) ? parsedRoleId : undefined;

  const t = await getTranslations({ locale, namespace: 'screenAccess' });

  const isAccessControl = tab === 'access-control';
  const isScreens = tab === 'screen-management' && subTab === 'screens';
  const isGroups = tab === 'screen-management' && subTab === 'groups';

  const defaultPaginatedFallback = (size: number) => ({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: size,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });

  const fetchData = await executeConditionalFetches({
    screens: {
      condition: isScreens,
      fetcher: () =>
        getScreensAction(
          spage,
          ssize,
          sp?.search,
          sp?.status && sp?.status !== 'all' ? sp?.status === 'active' : undefined,
          groupFilter
        ),
      fallback: defaultPaginatedFallback(ssize),
      errorMessage: 'errors.apiConnection.fetchScreensFailed',
    },
    allScreens: {
      condition: isAccessControl,
      fetcher: () => getAllScreensAction(),
      fallback: [],
      errorMessage: 'errors.apiConnection.fetchScreensFailed',
    },
    groups: {
      condition: isScreens || isGroups,
      fetcher: () =>
        getScreenGroupsAction(
          isGroups ? gpage : 1,
          isGroups ? gsize : 1000,
          isGroups ? sp?.gsearch : undefined,
          sp?.gstatus && sp?.gstatus !== 'all' ? sp?.gstatus === 'active' : undefined
        ),
      fallback: defaultPaginatedFallback(gsize),
      errorMessage: 'errors.apiConnection.fetchScreensFailed',
    },
    depts: {
      condition: isAccessControl,
      fetcher: () => getDepartmentsAction(),
      fallback: [],
      errorMessage: 'errors.apiConnection.fetchDepartmentsFailed',
    },
    roles: {
      condition: isAccessControl,
      fetcher: () => getRolesAction(),
      fallback: [],
      errorMessage: 'errors.apiConnection.fetchScreensFailed',
    },
    modules: {
      condition: isAccessControl,
      fetcher: () => getModulesAction(),
      fallback: [],
      errorMessage: 'errors.apiConnection.fetchModulesFailed',
    },
  });

  const roles = fetchData.roles;
  const screens = fetchData.screens.items;
  const allScreens = fetchData.allScreens;
  const groups = fetchData.groups.items;
  const departments = fetchData.depts;
  const modules = fetchData.modules;

  let initialRoleAccess: ScreenAccessPermissionData[] = [];
  let dataRoleId: number | undefined = undefined;

  if (isAccessControl && roles.length > 0) {
    dataRoleId = roleIdFromUrl
      ? (roles.find((r) => r.roleMasterId === roleIdFromUrl)?.roleMasterId ?? roles[0].roleMasterId)
      : roles[0].roleMasterId;
    if (dataRoleId) {
      const screenAccessRes = await getScreenAccessWithAllScreensAction(dataRoleId, allScreens);
      if (!screenAccessRes.success) {
        throw new Error(screenAccessRes.message || 'messages.errorOccurred');
      }
      initialRoleAccess = screenAccessRes.data || [];
    }
  }

  return (
    <ScreenAccessLayout
      tab={tab}
      subTab={subTab}
      screens={screens}
      allScreens={allScreens}
      groups={groups}
      departments={departments}
      modules={modules}
      roles={roles}
      initialRoleAccess={initialRoleAccess}
      dataRoleId={dataRoleId}
      screensPagination={mapPagination(fetchData.screens, ssize)}
      groupsPagination={mapPagination(fetchData.groups, gsize)}
      translations={{ title: t('title'), subtitle: t('subtitle') }}
    />
  );
}

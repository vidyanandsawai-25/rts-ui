'use client';

import { useState } from 'react';
import { PanelsTopLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Card,
  DeleteButton,
  Drawer,
  EditButton,
  SaveButton,
  SearchButton,
  SearchInput,
  Select,
  StatusBadge,
  Tabs,
  ToggleSwitch,
  useConfirm,
} from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import type {
  AccessGroup,
  AccessLookups,
  AccessQuery,
  AccessScreen,
  MasterPage,
  PermissionFlags,
  RolePermission,
} from '@/types/rts/access-management.types';
import {
  saveRtsScreenGroupAction,
  saveRtsScreenAction,
  saveRtsRoleScreenAccessAction,
  deleteRtsRoleScreenAccessAction,
  deleteRtsScreenMasterAction,
} from '@/app/[locale]/rts/configuration-settings/rts-screen/actions';
import {
  fieldClass,
  Field,
  Check,
  ErrorNotice,
  useMasterMutation,
  useMasterNavigation,
} from '../access-management/AccessMasterUi';
import {
  RTS_DASHBOARD_TABLE_CLASS,
  RTS_DASHBOARD_TABLE_CONTAINER_CLASS,
  RTS_DASHBOARD_TABLE_HEAD_CLASS,
} from '@/lib/utils/rts/dashboard-table-styles';
import { RoleWiseScreenAccessTab, type RoleWiseScreenAccessRow } from './RoleWiseScreenAccessTab';
import { ScreenGroupTabView, type ScreenGroupTableRow } from './ScreenGroupTabView';
import { ScreensTabView, type ScreenTableRow } from './ScreensTabView';

const RTS_SCREEN_MASTER_TABLE_CLASS = `${RTS_DASHBOARD_TABLE_CLASS} border-collapse text-left text-sm [&_thead_th]:!border-solid [&_thead_th]:!border-r [&_thead_th]:!border-blue-300/60 [&_thead_th:last-child]:!border-r-0 [&_tbody_td]:border-r [&_tbody_td]:border-slate-100 [&_tbody_td:last-child]:border-r-0`;

interface Props {
  query: AccessQuery;
  lookups: AccessLookups;
  groups: AccessGroup[];
  groupPage: MasterPage<AccessGroup> | null;
  screens: MasterPage<AccessScreen> | null;
  permissionPage: MasterPage<RolePermission> | null;
  allScreens?: AccessScreen[];
}

type GroupRow = ScreenGroupTableRow;
type ScreenRow = ScreenTableRow;

type AccessRow = RoleWiseScreenAccessRow;

function displayValue(value: unknown): string | number | boolean {
  if (value === null || value === undefined || value === '') return '—';
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? value
    : String(value);
}

function updatePermissionFlags(
  previous: PermissionFlags,
  key: keyof PermissionFlags,
  checked: boolean
): PermissionFlags {
  if (key === 'haveNoAccess' && checked)
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      haveFullAccess: false,
      haveNoAccess: true,
    };
  if (key === 'haveFullAccess' && checked)
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      haveFullAccess: true,
      haveNoAccess: false,
    };
  const next = { ...previous, [key]: checked, haveFullAccess: false, haveNoAccess: false };
  if ((key === 'canEdit' || key === 'canDelete') && checked) next.canView = true;
  if (key === 'canView' && !checked) {
    next.canEdit = false;
    next.canDelete = false;
  }
  if (!next.canView && !next.canEdit && !next.canDelete) next.haveNoAccess = true;
  return next;
}

function auditValue(date?: string | null, userId?: number | null): string {
  if (!date && !userId) return '—';
  const formattedDate = date ? new Date(date).toLocaleString() : 'Unknown date';
  return userId ? `${formattedDate} · User ${userId}` : formattedDate;
}

function SearchControls({
  initialValue,
  onSubmit,
}: {
  initialValue: string;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="flex gap-2">
      <SearchInput
        value={value}
        onChange={setValue}
        onEnter={() => onSubmit(value)}
        ariaLabel="Search"
        placeholder="Search by name or code"
        className="mb-0 w-full [&_input]:py-1.5 [&_input]:text-xs"
      />
      <SearchButton size="sm" label="Search" onClick={() => onSubmit(value)} />
    </div>
  );
}
export default function RtsScreenManagement({
  query,
  lookups,
  groups,
  groupPage,
  screens,
  permissionPage,
  allScreens = [],
}: Props) {
  const t = useTranslations('rts.accessManagement');
  const nav = useMasterNavigation();
  const mutation = useMasterMutation();
  const { confirm } = useConfirm();
  const busy = nav.pending || mutation.pending;
  const [groupEditor, setGroupEditor] = useState<{ group?: AccessGroup } | null>(null);
  const [screenEditor, setScreenEditor] = useState<{ screen?: AccessScreen } | null>(null);
  const [accessEditor, setAccessEditor] = useState<{ permission?: RolePermission } | null>(null);
  const departmentName = (id: number | null) =>
    lookups.departments.find((d) => d.id === id)?.departmentName ?? 'Unassigned';
  function remove(entity: 'screens' | 'groups', id: number) {
    confirm({
      variant: 'delete',
      onConfirm: async () => {
        mutation.run(() => deleteRtsScreenMasterAction(entity, id));
      },
    });
  }
  function removeAccess(id: number) {
    confirm({
      variant: 'delete',
      title: 'Delete role-screen access?',
      description:
        'This deactivates the access mapping. It remains available as read-only audit history.',
      onConfirm: async () => {
        mutation.run(() => deleteRtsRoleScreenAccessAction(id));
      },
    });
  }
  const groupRows: GroupRow[] = (groupPage?.items ?? []).map((group) => ({
    ...group,
    source: group,
  }));
  const screenRows: ScreenRow[] = (screens?.items ?? []).map((screen) => ({
      ...screen,
      screenGroupName:
        groups.find((group) => group.id === screen.screenGroupId)?.screenGroupName ??
        `Group #${screen.screenGroupId}`,
      departmentName: departmentName(screen.departmentId),
      moduleName:
        lookups.modules.find((module) => module.id === screen.moduleId)?.moduleName ??
        'Unassigned module',
      source: screen,
    }));
  const accessRows: AccessRow[] = (permissionPage?.items ?? []).map((permission) => {
    const screen = allScreens.find((item) => item.id === permission.screenId);
    const accessRole = lookups.roles.find((item) => item.id === permission.userRoleId);
    return {
      ...permission,
      roleName: accessRole?.userRoleName ?? `Role ${permission.userRoleId}`,
      screenCode: screen?.screenCode ?? `Screen ${permission.screenId}`,
      screenName: screen?.screenName ?? `Screen ${permission.screenId}`,
      routePath: screen?.routePath ?? '—',
      departmentName: departmentName(screen?.departmentId ?? accessRole?.departmentId ?? null),
      moduleName:
        lookups.modules.find((module) => module.id === screen?.moduleId)?.moduleName ?? '—',
      groupName: groups.find((group) => group.id === screen?.screenGroupId)?.screenGroupName ?? '—',
      mappingState: !permission.isActive
        ? 'Inactive'
        : permission.haveNoAccess
          ? 'Explicit no access'
          : 'Configured',
      createdAudit: auditValue(permission.createdDate, permission.createdBy),
      updatedAudit: auditValue(permission.updatedDate, permission.updatedBy),
      source: permission,
    };
  });
  const groupColumns: Column<GroupRow>[] = [
    { key: 'id', label: 'ID', align: 'center', cellClassName: 'font-mono text-xs text-slate-600' },
    { key: 'screenGroupName', label: 'Group name', cellClassName: 'font-semibold text-slate-800' },
    { key: 'screenGroupCode', label: 'Group code' },
    { key: 'screenGroupNameLocal', label: 'Local name', render: displayValue },
    { key: 'screenGroupIcon', label: 'Icon', render: displayValue },
    {
      key: 'displayOrder',
      label: 'Display order',
      align: 'center',
      render: displayValue,
    },
    {
      key: 'isActive',
      label: 'Status',
      align: 'center',
      render: (value) => <StatusBadge value={Boolean(value)} />,
    },
  ];
  const screenColumns: Column<ScreenRow>[] = [
    { key: 'id', label: 'ID', align: 'center', cellClassName: 'font-mono text-xs text-slate-600' },
    { key: 'screenGroupId', label: 'Group ID', align: 'center' },
    { key: 'screenGroupName', label: 'Group' },
    {
      key: 'departmentId',
      label: 'Department ID',
      align: 'center',
      render: displayValue,
    },
    { key: 'departmentName', label: 'Department' },
    { key: 'moduleId', label: 'Module ID', align: 'center', render: displayValue },
    { key: 'moduleName', label: 'Module' },
    { key: 'screenCode', label: 'Screen code' },
    { key: 'screenName', label: 'Screen name', cellClassName: 'font-semibold text-slate-800' },
    { key: 'screenNameLocal', label: 'Local name', render: displayValue },
    { key: 'screenIcon', label: 'Icon', render: displayValue },
    { key: 'routePath', label: 'Route path', width: '18rem', render: displayValue },
    {
      key: 'displayOrder',
      label: 'Display order',
      align: 'center',
      render: displayValue,
    },
    {
      key: 'isMenu',
      label: 'Menu',
      align: 'center',
      render: (value) => (
        <StatusBadge value={Boolean(value)} activeLabel="Yes" inactiveLabel="No" />
      ),
    },
    {
      key: 'isAuthenticationRequired',
      label: 'Authentication required',
      align: 'center',
      render: (value) => (
        <StatusBadge value={Boolean(value)} activeLabel="Yes" inactiveLabel="No" />
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      align: 'center',
      render: (value) => <StatusBadge value={Boolean(value)} />,
    },
  ];
  const accessColumns: Column<AccessRow>[] = [
    { key: 'id', label: 'Access ID', align: 'center', cellClassName: 'font-mono text-xs' },
    { key: 'userRoleId', label: 'Role ID', align: 'center' },
    { key: 'roleName', label: 'Role', cellClassName: 'font-semibold text-slate-800' },
    { key: 'screenId', label: 'Screen ID', align: 'center' },
    { key: 'screenCode', label: 'Screen code' },
    { key: 'screenName', label: 'Screen', cellClassName: 'font-semibold text-slate-800' },
    { key: 'routePath', label: 'Route path', width: '18rem', cellClassName: 'break-words' },
    { key: 'departmentName', label: 'Department' },
    { key: 'moduleName', label: 'Module' },
    { key: 'groupName', label: 'Screen group' },
    {
      key: 'canView',
      label: 'View',
      align: 'center',
      render: (value) => (
        <StatusBadge value={Boolean(value)} activeLabel="Yes" inactiveLabel="No" />
      ),
    },
    {
      key: 'canEdit',
      label: 'Edit',
      align: 'center',
      render: (value) => (
        <StatusBadge value={Boolean(value)} activeLabel="Yes" inactiveLabel="No" />
      ),
    },
    {
      key: 'canDelete',
      label: 'Delete',
      align: 'center',
      render: (value) => (
        <StatusBadge value={Boolean(value)} activeLabel="Yes" inactiveLabel="No" />
      ),
    },
    {
      key: 'haveFullAccess',
      label: 'Full access',
      align: 'center',
      render: (value) => (
        <StatusBadge value={Boolean(value)} activeLabel="Yes" inactiveLabel="No" />
      ),
    },
    {
      key: 'haveNoAccess',
      label: 'No access',
      align: 'center',
      render: (value) => (
        <StatusBadge value={Boolean(value)} activeLabel="Yes" inactiveLabel="No" />
      ),
    },
    {
      key: 'mappingState',
      label: 'Mapping state',
      width: '10rem',
      align: 'center',
      render: (value) => {
        const state = String(value);
        const className =
          state === 'Configured'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : state === 'Explicit no access'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-slate-200 bg-slate-50 text-slate-600';
        return (
          <span
            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
          >
            {state}
          </span>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      align: 'center',
      render: (value) => <StatusBadge value={Boolean(value)} />,
    },
    { key: 'createdAudit', label: 'Created', width: '13rem' },
    { key: 'updatedAudit', label: 'Updated', width: '13rem' },
  ];
  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden" aria-busy={busy}>
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <PanelsTopLeft className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              {t('screen_allocation_management')}
            </h1>
            <p className="text-xs text-slate-500">
              {t('screen_allocation_management_description')}
            </p>
          </div>
        </div>
      </Card>
      <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        {t(
          'setup_order_screen_group_department_module_screen_role_permissions_allocate_the_role_to_users'
        )}{' '}
      </p>
      <Tabs
        value={query.tab}
        onChange={(tab) =>
          nav.navigate({
            tab: String(tab),
            page: 1,
            search: '',
            departmentId: undefined,
            roleId: undefined,
            groupId: undefined,
            screenId: undefined,
            permissionStatus: undefined,
            permissionType: undefined,
          })
        }
        variant="pills"
        items={[
          { value: 'groups', label: '1. Screen groups', content: null, disabled: busy },
          { value: 'screens', label: '2. Screens', content: null, disabled: busy },
          {
            value: 'access',
            label: '3. Role Wise Screen and Permission Access',
            content: null,
            disabled: busy,
          },
        ]}
      />
      <ErrorNotice message={mutation.error} />
      <Card className="border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {query.tab !== 'access' && (
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-500">
                {t('search')}
              </label>
              <SearchControls
                key={`${query.tab}:${query.search}`}
                initialValue={query.search}
                onSubmit={(search) => nav.navigate({ search, page: 1 })}
              />
            </div>
          )}
          {query.tab !== 'groups' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">
                {t('department')}
              </label>
              <Select
                value={query.departmentId ? String(query.departmentId) : ''}
                selectSize="sm"
                disabled={busy}
                placeholder="All departments"
                options={[
                  { label: 'All departments', value: '' },
                  ...lookups.departments.map((department) => ({
                    label: department.departmentName,
                    value: String(department.id),
                  })),
                ]}
                onChange={(_, value) =>
                  nav.navigate({
                    departmentId: value || undefined,
                    roleId: undefined,
                    screenId: undefined,
                    page: 1,
                  })
                }
              />
            </div>
          )}
          {query.tab !== 'groups' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">
                {t('screen_group')}
              </label>
              <Select
                value={query.groupId ? String(query.groupId) : ''}
                selectSize="sm"
                disabled={busy}
                placeholder="All groups"
                options={[
                  { label: 'All groups', value: '' },
                  ...groups.map((group) => ({
                    label: group.screenGroupName,
                    value: String(group.id),
                  })),
                ]}
                onChange={(_, value) =>
                  nav.navigate({
                    groupId: value || undefined,
                    screenId: query.tab === 'access' ? undefined : query.screenId,
                    page: 1,
                  })
                }
              />
            </div>
          )}
          {query.tab === 'access' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">{t('roles')}</label>
              <Select
                value={query.roleId ? String(query.roleId) : ''}
                selectSize="sm"
                disabled={busy}
                placeholder="All roles"
                options={[
                  {
                    label: 'All roles',
                    value: '',
                  },
                  ...lookups.roles
                    .filter(
                      (item) => !query.departmentId || item.departmentId === query.departmentId
                    )
                    .map((item) => ({
                      label: `${item.userRoleName} — ${departmentName(item.departmentId)}${item.isActive ? '' : ' (inactive)'}`,
                      value: String(item.id),
                    })),
                ]}
                onChange={(_, value) => nav.navigate({ roleId: value || undefined, page: 1 })}
              />
            </div>
          )}
          {query.tab === 'access' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  {t('screen')}
                </label>
                <Select
                  value={query.screenId ? String(query.screenId) : ''}
                  selectSize="sm"
                  disabled={busy}
                  placeholder="All screens"
                  options={[
                    { label: 'All screens', value: '' },
                    ...allScreens
                      .filter(
                        (screen) =>
                          (!query.departmentId || screen.departmentId === query.departmentId) &&
                          (!query.groupId || screen.screenGroupId === query.groupId)
                      )
                      .map((screen) => ({
                        label: `${screen.screenCode} — ${screen.screenName}`,
                        value: String(screen.id),
                      })),
                  ]}
                  onChange={(_, value) => nav.navigate({ screenId: value || undefined, page: 1 })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  {t('status')}
                </label>
                <Select
                  value={query.permissionStatus ?? ''}
                  selectSize="sm"
                  disabled={busy}
                  placeholder="All statuses"
                  options={[
                    { label: 'All statuses', value: '' },
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                  onChange={(_, value) =>
                    nav.navigate({ permissionStatus: value || undefined, page: 1 })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  {t('permission')}
                </label>
                <Select
                  value={query.permissionType ?? ''}
                  selectSize="sm"
                  disabled={busy}
                  placeholder="All permission types"
                  options={[
                    { label: 'All permission types', value: '' },
                    { label: 'View', value: 'view' },
                    { label: 'Edit', value: 'edit' },
                    { label: 'Delete', value: 'delete' },
                    { label: 'Full access', value: 'full' },
                    { label: 'No access', value: 'none' },
                  ]}
                  onChange={(_, value) =>
                    nav.navigate({ permissionType: value || undefined, page: 1 })
                  }
                />
              </div>
            </>
          )}
        </div>
      </Card>
      {query.tab === 'screens' && !groups.length && (
        <p className="rounded border bg-amber-50 p-4 text-sm">
          {t('create_a_screen_group_in_the_first_tab_before_adding_a_screen')}{' '}
        </p>
      )}
      {query.tab === 'groups' && groupPage && (
        <ScreenGroupTabView
          busy={busy}
          onAdd={() => setGroupEditor({})}
          title={t('screen_group')}
          description={t('screen_allocation_management_description')}
          page={groupPage}
          rows={groupRows}
          columns={groupColumns}
          onPageChange={(page) => nav.navigate({ page })}
          onPageSizeChange={(pageSize) => nav.navigate({ pageSize, page: 1 })}
          theadClassName={RTS_DASHBOARD_TABLE_HEAD_CLASS}
          tableClassName={RTS_SCREEN_MASTER_TABLE_CLASS}
          containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
          renderActions={(row) => (
            <div
              className="flex justify-center gap-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <EditButton
                disabled={busy}
                title="Edit screen group"
                onClick={() => setGroupEditor({ group: row.source })}
              />
              <DeleteButton
                disabled={busy}
                title="Delete screen group"
                onClick={() => remove('groups', row.id)}
              />
            </div>
          )}
        />
      )}
      {query.tab === 'screens' && screens && (
        <ScreensTabView
          busy={busy}
          canAdd={Boolean(groups.length)}
          onAdd={() => setScreenEditor({})}
          title={t('screen')}
          description={t('screen_allocation_management_description')}
          page={screens}
          rows={screenRows}
          columns={screenColumns}
          showActions
          onPageChange={(page) => nav.navigate({ page })}
          onPageSizeChange={(pageSize) => nav.navigate({ pageSize, page: 1 })}
          theadClassName={RTS_DASHBOARD_TABLE_HEAD_CLASS}
          tableClassName={RTS_SCREEN_MASTER_TABLE_CLASS}
          containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
          renderActions={(row) => (
            <div
              className="flex justify-center gap-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <EditButton
                disabled={busy}
                title="Edit screen"
                onClick={() => setScreenEditor({ screen: row.source })}
              />
              <DeleteButton
                disabled={busy}
                title="Delete screen"
                onClick={() => remove('screens', row.id)}
              />
            </div>
          )}
        />
      )}
      {permissionPage && (
        <RoleWiseScreenAccessTab
          key={query.search}
          page={permissionPage}
          rows={accessRows}
          columns={accessColumns}
          busy={busy}
          canAdd={Boolean(lookups.roles.length && allScreens.length)}
          onAdd={() => setAccessEditor({})}
          title={t('screens_permissions')}
          description={t('role_screen_access_history_help')}
          search={query.search}
          onSearch={(search) => nav.navigate({ search, page: 1 })}
          onPageChange={(page) => nav.navigate({ page })}
          theadClassName={RTS_DASHBOARD_TABLE_HEAD_CLASS}
          tableClassName={RTS_SCREEN_MASTER_TABLE_CLASS}
          containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
          renderActions={(row) => (
            <div
              className="flex items-center justify-center gap-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <EditButton
                disabled={busy}
                title="Edit role-screen access"
                onClick={() => setAccessEditor({ permission: row.source })}
              />
              <DeleteButton
                disabled={busy || !row.isActive}
                title={row.isActive ? 'Delete role-screen access' : 'Inactive role-screen access'}
                onClick={() => removeAccess(row.id)}
              />
            </div>
          )}
        />
      )}
      {groupEditor && (
        <GroupEditor group={groupEditor.group} onClose={() => setGroupEditor(null)} />
      )}
      {screenEditor && (
        <ScreenEditor
          screen={screenEditor.screen}
          groups={groups}
          lookups={lookups}
          onClose={() => setScreenEditor(null)}
        />
      )}
      {accessEditor && (
        <AccessEditor
          permission={accessEditor.permission}
          lookups={lookups}
          allScreens={allScreens}
          onClose={() => setAccessEditor(null)}
        />
      )}
    </div>
  );
}

function AccessEditor({
  permission,
  lookups,
  allScreens,
  onClose,
}: {
  permission?: RolePermission;
  lookups: AccessLookups;
  allScreens: AccessScreen[];
  onClose: () => void;
}) {
  const t = useTranslations('rts.accessManagement');
  const selectedScreen = allScreens.find((screen) => screen.id === permission?.screenId);
  const selectedRole = lookups.roles.find((role) => role.id === permission?.userRoleId);
  const [departmentId, setDepartmentId] = useState<number | null>(
    selectedScreen?.departmentId ?? selectedRole?.departmentId ?? null
  );
  const [roleId, setRoleId] = useState<number | null>(permission?.userRoleId ?? null);
  const [screenId, setScreenId] = useState<number | null>(permission?.screenId ?? null);
  const [isActive, setIsActive] = useState(permission?.isActive ?? true);
  const [flags, setFlags] = useState<PermissionFlags>({
    canView: permission?.canView ?? false,
    canEdit: permission?.canEdit ?? false,
    canDelete: permission?.canDelete ?? false,
    haveFullAccess: permission?.haveFullAccess ?? false,
    haveNoAccess: permission?.haveNoAccess ?? true,
  });
  const mutation = useMasterMutation();
  const editMode = Boolean(permission);
  const roles = lookups.roles.filter(
    (role) => role.isActive && (!departmentId || role.departmentId === departmentId)
  );
  const screens = allScreens.filter(
    (screen) => screen.isActive && (!departmentId || screen.departmentId === departmentId)
  );
  const identity = editMode
    ? `${selectedRole?.userRoleName ?? `Role ${permission?.userRoleId}`} · ${selectedScreen?.screenCode ?? `Screen ${permission?.screenId}`} — ${selectedScreen?.screenName ?? ''}`
    : '';

  return (
    <Drawer
      open
      onClose={() => {
        if (!mutation.pending) onClose();
      }}
      title={editMode ? 'Edit role-screen access' : 'Add role-screen access'}
      width="lg"
      footer={
        <div className="flex justify-end">
          <SaveButton
            form="rts-role-screen-access-editor"
            type="submit"
            disabled={mutation.pending || !roleId || !screenId}
            isLoading={mutation.pending}
            label={editMode ? 'Save access' : 'Add access'}
          />
        </div>
      }
    >
      <form
        id="rts-role-screen-access-editor"
        className="space-y-5 bg-slate-50 p-5 text-slate-900"
        onSubmit={(event) => {
          event.preventDefault();
          if (!roleId || !screenId) return;
          mutation.run(
            () => saveRtsRoleScreenAccessAction(permission?.id, roleId, screenId, flags, isActive),
            onClose
          );
        }}
      >
        <ErrorNotice message={mutation.error} />
        <fieldset disabled={mutation.pending} className="space-y-4 text-slate-900">
          {editMode ? (
            <>
              <Field label="Role and screen">
                <input
                  readOnly
                  className={`${fieldClass} bg-slate-100 text-slate-600`}
                  value={identity}
                />
              </Field>
              <ToggleSwitch
                label="Active"
                checked={isActive}
                onChange={setIsActive}
                showPopup={false}
              />
            </>
          ) : (
            <>
              <Field label="Department *">
                <select
                  required
                  className={fieldClass}
                  value={departmentId ?? ''}
                  onChange={(event) => {
                    const value = event.target.value ? Number(event.target.value) : null;
                    setDepartmentId(value);
                    setRoleId(null);
                    setScreenId(null);
                  }}
                >
                  <option value="">{t('select_department')}</option>
                  {lookups.departments
                    .filter((department) => department.isActive)
                    .map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.departmentName}
                      </option>
                    ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role *">
                  <select
                    required
                    disabled={!departmentId}
                    className={fieldClass}
                    value={roleId ?? ''}
                    onChange={(event) => setRoleId(Number(event.target.value) || null)}
                  >
                    <option value="">{t('select_a_role')}</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.id} — {role.userRoleName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Screen *">
                  <select
                    required
                    disabled={!departmentId}
                    className={fieldClass}
                    value={screenId ?? ''}
                    onChange={(event) => setScreenId(Number(event.target.value) || null)}
                  >
                    <option value="">{t('select_screen')}</option>
                    {screens.map((screen) => (
                      <option key={screen.id} value={screen.id}>
                        {screen.id} — {screen.screenCode} — {screen.screenName}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </>
          )}
          <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-slate-900">{t('permissions')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['canView', 'View'],
                  ['canEdit', 'Edit'],
                  ['canDelete', 'Delete'],
                  ['haveFullAccess', 'Full access'],
                  ['haveNoAccess', 'No access'],
                ] as const
              ).map(([key, label]) => (
                <ToggleSwitch
                  key={key}
                  label={label}
                  checked={flags[key]}
                  onChange={(checked) =>
                    setFlags((previous) => updatePermissionFlags(previous, key, checked))
                  }
                  showPopup={false}
                />
              ))}
            </div>
          </div>
          <p className="text-xs font-medium leading-5 text-slate-700">
            {t('role_screen_permission_rules')}
          </p>
        </fieldset>
      </form>
    </Drawer>
  );
}

function GroupEditor({ group, onClose }: { group?: AccessGroup; onClose: () => void }) {
  const [draft, setDraft] = useState<Omit<AccessGroup, 'id'>>(
    group ?? {
      screenGroupName: '',
      screenGroupCode: '',
      screenGroupNameLocal: '',
      screenGroupIcon: '',
      displayOrder: 0,
      isActive: true,
    }
  );
  const mutation = useMasterMutation();
  return (
    <Drawer
      open
      onClose={() => {
        if (!mutation.pending) onClose();
      }}
      title={group ? 'Edit screen group' : 'Create screen group'}
      width="md"
    >
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.run(() => saveRtsScreenGroupAction(group?.id, draft), onClose);
        }}
      >
        <ErrorNotice message={mutation.error} />
        <fieldset disabled={mutation.pending} className="space-y-4">
          {(
            [
              ['screenGroupName', 'Group name *', 200],
              ['screenGroupCode', 'Group code *', 50],
              ['screenGroupNameLocal', 'Local name', 200],
              ['screenGroupIcon', 'Icon name', 100],
            ] as const
          ).map(([key, label, max]) => (
            <Field key={key} label={label}>
              <input
                required={key === 'screenGroupName' || key === 'screenGroupCode'}
                maxLength={max}
                className={fieldClass}
                value={draft[key] ?? ''}
                onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              />
            </Field>
          ))}
          <Field label="Display order">
            <input
              type="number"
              min={0}
              step={1}
              className={fieldClass}
              value={draft.displayOrder ?? 0}
              onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })}
            />
          </Field>
          <Check
            label="Active"
            checked={draft.isActive}
            onChange={(value) => setDraft({ ...draft, isActive: value })}
          />
          <SaveButton
            type="submit"
            disabled={mutation.pending}
            isLoading={mutation.pending}
            label="Save group"
          />
        </fieldset>
      </form>
    </Drawer>
  );
}
function ScreenEditor({
  screen,
  groups,
  lookups,
  onClose,
}: {
  screen?: AccessScreen;
  groups: AccessGroup[];
  lookups: AccessLookups;
  onClose: () => void;
}) {
  const t = useTranslations('rts.accessManagement');
  const [draft, setDraft] = useState<Omit<AccessScreen, 'id'>>(
    screen ?? {
      screenGroupId: 0,
      departmentId: null,
      moduleId: null,
      screenCode: '',
      screenName: '',
      screenNameLocal: '',
      screenIcon: '',
      routePath: '',
      displayOrder: 0,
      isActive: true,
      isMenu: true,
      isAuthenticationRequired: true,
    }
  );
  const mutation = useMasterMutation();
  return (
    <Drawer
      open
      onClose={() => {
        if (!mutation.pending) onClose();
      }}
      title={screen ? 'Edit screen' : 'Create screen'}
      width="lg"
    >
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.run(() => saveRtsScreenAction(screen?.id, draft), onClose);
        }}
      >
        <ErrorNotice message={mutation.error} />
        <fieldset disabled={mutation.pending} className="space-y-4">
          <Field label="Screen group *">
            <select
              required
              value={draft.screenGroupId || ''}
              className={fieldClass}
              onChange={(e) => setDraft({ ...draft, screenGroupId: Number(e.target.value) })}
            >
              <option value="">{t('select_group')}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.screenGroupName}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Department *">
              <select
                required
                value={draft.departmentId ?? ''}
                className={fieldClass}
                onChange={(e) =>
                  setDraft({ ...draft, departmentId: Number(e.target.value), moduleId: null })
                }
              >
                <option value="">{t('select_department')}</option>
                {lookups.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Module *">
              <select
                required
                disabled={!draft.departmentId}
                value={draft.moduleId ?? ''}
                className={fieldClass}
                onChange={(e) => setDraft({ ...draft, moduleId: Number(e.target.value) })}
              >
                <option value="">{t('select_module')}</option>
                {lookups.modules
                  .filter((m) => m.departmentId === draft.departmentId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.moduleName}
                    </option>
                  ))}
              </select>
            </Field>
            {(
              [
                ['screenName', 'Screen name *', 200],
                ['screenCode', 'Screen code *', 50],
                ['screenNameLocal', 'Local screen name', 200],
                ['screenIcon', 'Icon name', 100],
              ] as const
            ).map(([key, label, max]) => (
              <Field key={key} label={label}>
                <input
                  required={key === 'screenName' || key === 'screenCode'}
                  maxLength={max}
                  className={fieldClass}
                  value={draft[key] ?? ''}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                />
              </Field>
            ))}
          </div>
          <Field label="Route path *">
            <input
              required
              maxLength={500}
              className={fieldClass}
              placeholder="/rts/dashboard/rts-applications"
              value={draft.routePath ?? ''}
              onChange={(e) => setDraft({ ...draft, routePath: e.target.value })}
            />
          </Field>
          <p className="text-xs text-slate-500">
            {t(
              'use_a_route_without_the_locale_prefix_registration_makes_an_existing_application_screen_available_fo'
            )}{' '}
          </p>
          <Field label="Display order">
            <input
              type="number"
              min={0}
              step={1}
              className={fieldClass}
              value={draft.displayOrder ?? 0}
              onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })}
            />
          </Field>
          <div className="flex flex-wrap gap-4">
            <Check
              label="Active"
              checked={draft.isActive}
              onChange={(value) => setDraft({ ...draft, isActive: value })}
            />
            <Check
              label="Show in menu"
              checked={draft.isMenu}
              onChange={(value) => setDraft({ ...draft, isMenu: value })}
            />
            <Check
              label="Authentication required"
              checked={draft.isAuthenticationRequired}
              onChange={(value) => setDraft({ ...draft, isAuthenticationRequired: value })}
            />
          </div>
          <SaveButton
            type="submit"
            disabled={mutation.pending}
            isLoading={mutation.pending}
            label="Save screen"
          />
        </fieldset>
      </form>
    </Drawer>
  );
}

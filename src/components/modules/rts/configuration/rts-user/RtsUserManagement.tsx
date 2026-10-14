'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ExternalLink, UserRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CancelButton,
  Card,
  DeleteButton,
  Drawer,
  EditButton,
  LockButton,
  SaveButton,
  SearchButton,
  SearchInput,
  Select,
  StatusBadge,
  Tabs,
  UnlockButton,
  useConfirm,
} from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import type {
  AccessLookups,
  AccessQuery,
  AccessRole,
  AccessUser,
  MasterPage,
  UserDraft,
} from '@/types/rts/access-management.types';
import {
  getRtsUserAction,
  saveRtsUserAction,
  saveRtsRoleAction,
  changeRtsUserStatusAction,
  deleteRtsUserMasterAction,
} from '@/app/[locale]/rts/configuration-settings/rts-user/actions';
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
import { RoleTabView, type RoleTableRow } from './RoleTabView';
import { UserTabView, type UserTableRow } from './UserTabView';

const RTS_USER_MASTER_TABLE_CLASS = `${RTS_DASHBOARD_TABLE_CLASS} border-collapse text-left text-sm [&_thead_th]:!border-solid [&_thead_th]:!border-r [&_thead_th]:!border-blue-300/60 [&_thead_th:last-child]:!border-r-0 [&_tbody_td]:border-r [&_tbody_td]:border-slate-100 [&_tbody_td:last-child]:border-r-0`;

const ALLOCATION_CHIP_COLORS = [
  'border-slate-200 bg-slate-100 text-slate-700',
  'border-zinc-200 bg-zinc-100 text-zinc-700',
  'border-stone-200 bg-stone-100 text-stone-700',
  'border-red-200 bg-red-50 text-red-700',
  'border-yellow-200 bg-yellow-50 text-yellow-800',
  'border-orange-200 bg-orange-50 text-orange-700',
  'border-amber-200 bg-amber-50 text-amber-800',
  'border-lime-200 bg-lime-50 text-lime-800',
  'border-green-200 bg-green-50 text-green-700',
  'border-emerald-200 bg-emerald-50 text-emerald-700',
  'border-teal-200 bg-teal-50 text-teal-700',
  'border-cyan-200 bg-cyan-50 text-cyan-700',
  'border-sky-200 bg-sky-50 text-sky-700',
  'border-blue-200 bg-blue-50 text-blue-700',
  'border-indigo-200 bg-indigo-50 text-indigo-700',
  'border-violet-200 bg-violet-50 text-violet-700',
  'border-purple-200 bg-purple-50 text-purple-700',
  'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  'border-pink-200 bg-pink-50 text-pink-700',
  'border-rose-200 bg-rose-50 text-rose-700',
] as const;

interface AllocationChipItem {
  key: string;
  typeLabel: 'Department' | 'Module' | 'Role';
  identifier: number;
  name: string;
  departmentId?: number;
  isActive: boolean;
}

function allocationChipColor(seed: string): string {
  if (seed === 'Department:5') {
    return 'border-sky-200 bg-sky-100 text-sky-800';
  }

  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return ALLOCATION_CHIP_COLORS[hash % ALLOCATION_CHIP_COLORS.length];
}

function AllocationChipList({
  items,
  emptyLabel,
}: {
  items: AllocationChipItem[];
  emptyLabel: string;
}) {
  if (!items.length)
    return <span className="text-sm font-medium text-slate-400">{emptyLabel}</span>;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((item) => {
        const status = item.isActive ? 'Active' : 'Inactive';
        return (
          <span
            key={item.key}
            aria-label={`${item.typeLabel} ${item.identifier}, ${item.name}${item.departmentId !== undefined ? `, Department ${item.departmentId}` : ''}, ${status}`}
            className={`inline-flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${allocationChipColor(`${item.typeLabel}:${item.identifier}`)}`}
          >
            <span
              aria-hidden="true"
              className={`h-2 w-2 shrink-0 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
            />
            <span className="font-bold tabular-nums">{item.identifier}</span>
            <span aria-hidden="true" className="opacity-50">
              •
            </span>
            <span>
              {item.name}
              {item.departmentId !== undefined && (
                <>
                  <span aria-hidden="true" className="mx-1 opacity-50">
                    •
                  </span>
                  <span className="font-medium">Dept: {item.departmentId}</span>
                </>
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
}

interface Props {
  query: AccessQuery;
  lookups: AccessLookups;
  users: MasterPage<AccessUser> | null;
  roles: MasterPage<AccessRole> | null;
}

type UserRow = UserTableRow;
type RoleRow = RoleTableRow;

function displayValue(value: unknown): string | number | boolean {
  if (value === null || value === undefined || value === '') return '—';
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? value
    : String(value);
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
        placeholder="Search by name"
        className="mb-0 w-full [&_input]:py-1.5 [&_input]:text-xs"
      />
      <SearchButton size="sm" label="Search" onClick={() => onSubmit(value)} />
    </div>
  );
}

function createUserDraft(user?: AccessUser): UserDraft {
  return {
    userName: user?.userName ?? '',
    firstName: user?.firstName ?? '',
    middleName: user?.middleName ?? '',
    lastName: user?.lastName ?? '',
    userCode: user?.userCode ?? '',
    email: user?.email ?? '',
    mobileNo: user?.mobileNo ?? '',
    alternateMobileNo: user?.alternateMobileNo ?? '',
    address: user?.address ?? '',
    remark: user?.remark ?? '',
    language: user?.language ?? 'en',
    employeeTypeID: user?.employeeTypeID ?? null,
    departmentIds: (user?.departments ?? [])
      .filter((item) => item.isActive)
      .map((item) => item.departmentId),
    modules: (user?.moduleAccess ?? [])
      .filter((item) => item.isActive)
      .map(({ departmentId, moduleId }) => ({ departmentId, moduleId })),
    roles: (user?.roleAllocations ?? [])
      .filter((item) => item.isActive)
      .map(({ departmentId, userRoleId }) => ({ departmentId, userRoleId })),
  };
}

function removeDepartment(draft: UserDraft, departmentId: number): UserDraft {
  return {
    ...draft,
    departmentIds: draft.departmentIds.filter((id) => id !== departmentId),
    modules: draft.modules.filter((item) => item.departmentId !== departmentId),
    roles: draft.roles.filter((item) => item.departmentId !== departmentId),
  };
}

const editorFieldClass = `${fieldClass} border-slate-400 bg-white text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100`;

function EditorSection({
  step,
  title,
  description,
  action,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
            {step}
          </span>
          <div>
            <h2 className="font-bold text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MasterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

function AllocationOption({
  id,
  name,
  checked,
  masterActive,
  wasInactive,
  onChange,
  labels,
}: {
  id: number;
  name: string;
  checked: boolean;
  masterActive: boolean;
  wasInactive: boolean;
  onChange: (checked: boolean) => void;
  labels: {
    active: string;
    available: string;
    inactiveAllocation: string;
    masterInactive: string;
    reactivateHint: string;
    masterInactiveHint: string;
  };
}) {
  const disabled = !masterActive && !checked;
  const status = !masterActive
    ? labels.masterInactive
    : checked
      ? labels.active
      : wasInactive
        ? labels.inactiveAllocation
        : labels.available;
  const statusClass = !masterActive
    ? 'border-slate-300 bg-slate-100 text-slate-700'
    : checked
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : wasInactive
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-blue-200 bg-blue-50 text-blue-700';

  return (
    <label
      className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 transition ${
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-100'
          : checked
            ? 'cursor-pointer border-blue-300 bg-blue-50/70 shadow-sm'
            : 'cursor-pointer border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        aria-label={name}
        className="h-4 w-4 shrink-0 rounded border-slate-400 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
      />
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-semibold ${disabled ? 'text-slate-500' : 'text-slate-800'}`}
        >
          <span className="mr-1 font-mono text-xs text-slate-500">{id}</span>
          <span aria-hidden="true" className="mr-1 text-slate-400">
            •
          </span>
          {name}
        </span>
        {wasInactive && masterActive && !checked && (
          <span className="mt-0.5 block text-xs font-medium text-rose-600">
            {labels.reactivateHint}
          </span>
        )}
        {!masterActive && (
          <span className="mt-0.5 block text-xs text-slate-500">{labels.masterInactiveHint}</span>
        )}
      </span>
      <span
        className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass}`}
      >
        {status}
      </span>
    </label>
  );
}

export default function RtsUserManagement({ query, lookups, users, roles }: Props) {
  const t = useTranslations('rts.accessManagement');
  const nav = useMasterNavigation();
  const mutation = useMasterMutation();
  const { confirm } = useConfirm();
  const [editor, setEditor] = useState<{ user?: AccessUser } | null>(null);
  const [roleEditor, setRoleEditor] = useState<{ role?: AccessRole } | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState('');
  const busy = nav.pending || mutation.pending || loadingId !== null;
  const departmentName = (id: number) =>
    lookups.departments.find((d) => d.id === id)?.departmentName ?? `Department ${id}`;
  async function openUser(id: number) {
    setLoadingId(id);
    setLoadError('');
    try {
      const result = await getRtsUserAction(id);
      if (result.success) setEditor({ user: result.data });
      else setLoadError(result.error);
    } catch {
      setLoadError('Unable to load the user. Please retry.');
    } finally {
      setLoadingId(null);
    }
  }
  function removeRole(id: number) {
    confirm({
      variant: 'delete',
      onConfirm: async () => {
        mutation.run(() => deleteRtsUserMasterAction('roles', id));
      },
    });
  }
  const userRows: UserRow[] = (users?.items ?? []).map((user) => ({
    ...user,
    departmentAllocations: user.departments ?? [],
    moduleAllocations: user.moduleAccess ?? [],
    roleAllocationsSummary: user.roleAllocations ?? [],
    source: user,
  }));
  const roleRows: RoleRow[] = (roles?.items ?? []).map((role) => ({
    ...role,
    departmentName: departmentName(role.departmentId),
    source: role,
  }));
  const userColumns: Column<UserRow>[] = [
    { key: 'id', label: 'ID', align: 'center', cellClassName: 'font-mono text-xs text-slate-600' },
    { key: 'userName', label: 'Username', cellClassName: 'font-semibold text-slate-800' },
    { key: 'firstName', label: 'First name', render: displayValue },
    { key: 'middleName', label: 'Middle name', render: displayValue },
    { key: 'lastName', label: 'Last name', render: displayValue },
    {
      key: 'userCode',
      label: 'User code',
      align: 'center',
      render: (value) =>
        value === null || value === undefined || value === '' ? (
          '—'
        ) : (
          <span className="inline-flex min-w-[4.5rem] items-center justify-center whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {String(value)}
          </span>
        ),
    },
    { key: 'email', label: 'Email', render: displayValue },
    { key: 'mobileNo', label: 'Mobile number', render: displayValue },
    { key: 'alternateMobileNo', label: 'Alternate mobile', render: displayValue },
    { key: 'address', label: 'Address', render: displayValue },
    { key: 'remark', label: 'Remark', render: displayValue },
    { key: 'language', label: 'Language', render: displayValue },
    {
      key: 'employeeTypeID',
      label: 'Employee type ID',
      align: 'center',
      render: displayValue,
    },
    {
      key: 'departmentAllocations',
      label: 'Department allocations',
      width: '32rem',
      headerClassName: 'min-w-[32rem]',
      cellClassName: 'min-w-[32rem] align-top leading-5',
      render: (_value, row) => (
        <AllocationChipList
          emptyLabel={t('none')}
          items={row.departmentAllocations
            .filter((item) => item.isActive)
            .map((item) => ({
              key: `department-allocation-${item.id}`,
              typeLabel: 'Department',
              identifier: item.departmentId,
              name: departmentName(item.departmentId),
              isActive: item.isActive,
            }))}
        />
      ),
    },
    {
      key: 'moduleAllocations',
      label: 'Module allocations',
      width: '32rem',
      headerClassName: 'min-w-[32rem]',
      cellClassName: 'min-w-[32rem] align-top leading-5',
      render: (_value, row) => (
        <AllocationChipList
          emptyLabel={t('none')}
          items={row.moduleAllocations
            .filter((item) => item.isActive)
            .map((item) => ({
              key: `module-allocation-${item.id}`,
              typeLabel: 'Module',
              identifier: item.moduleId,
              name:
                lookups.modules.find((module) => module.id === item.moduleId)?.moduleName ??
                `Module ${item.moduleId}`,
              departmentId: item.departmentId,
              isActive: item.isActive,
            }))}
        />
      ),
    },
    {
      key: 'roleAllocationsSummary',
      label: 'Role allocations',
      width: '32rem',
      headerClassName: 'min-w-[32rem]',
      cellClassName: 'min-w-[32rem] align-top leading-5',
      render: (_value, row) => (
        <AllocationChipList
          emptyLabel={t('none')}
          items={row.roleAllocationsSummary
            .filter((item) => item.isActive)
            .map((item) => ({
              key: `role-allocation-${item.id}`,
              typeLabel: 'Role',
              identifier: item.userRoleId,
              name:
                lookups.roles.find((role) => role.id === item.userRoleId)?.userRoleName ??
                `Role ${item.userRoleId}`,
              departmentId: item.departmentId,
              isActive: item.isActive,
            }))}
        />
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      align: 'center',
      render: (value) => (
        <StatusBadge value={Boolean(value)} activeLabel="Active" inactiveLabel="Locked" />
      ),
    },
  ];
  const roleColumns: Column<RoleRow>[] = [
    { key: 'id', label: 'ID', align: 'center', cellClassName: 'font-mono text-xs text-slate-600' },
    { key: 'userRoleName', label: 'Role name', cellClassName: 'font-semibold text-slate-800' },
    { key: 'departmentId', label: 'Department ID', align: 'center' },
    { key: 'departmentName', label: 'Department' },
    {
      key: 'isActive',
      label: 'Status',
      align: 'center',
      render: (value) => <StatusBadge value={Boolean(value)} />,
    },
  ];
  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden" aria-busy={busy}>
      <Card className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              {t('user_management')}
            </h1>
            <p className="text-xs text-slate-500">{t('user_management_description')}</p>
          </div>
        </div>
      </Card>
      <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
        {t(
          'users_receive_screen_permissions_through_their_allocated_roles_configure_each_role_s_screens_in_scre'
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
            moduleId: undefined,
            roleId: undefined,
            groupId: undefined,
          })
        }
        variant="pills"
        items={[
          { value: 'users', label: 'Users', content: null, disabled: busy },
          { value: 'roles', label: 'Roles', content: null, disabled: busy },
        ]}
      />
      <ErrorNotice message={loadError || mutation.error} />
      <Card className="border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className={`space-y-1 sm:col-span-2 ${query.tab === 'users' ? 'lg:col-span-3' : ''}`}
          >
            <label className="text-[10px] font-bold uppercase text-slate-500">{t('search')}</label>
            <SearchControls
              key={`${query.tab}:${query.search}`}
              initialValue={query.search}
              onSubmit={(search) => nav.navigate({ search, page: 1 })}
            />
          </div>
          {query.tab === 'roles' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">
                {t('department')}
              </label>
              <Select
                value={query.departmentId ? String(query.departmentId) : ''}
                selectSize="sm"
                disabled={busy}
                ariaLabel={t('department')}
                placeholder="All departments"
                options={[
                  { label: 'All departments', value: '' },
                  ...lookups.departments.map((department) => ({
                    label: department.departmentName,
                    value: String(department.id),
                  })),
                ]}
                onChange={(_, value) => nav.navigate({ departmentId: value || undefined, page: 1 })}
              />
            </div>
          )}
        </div>
      </Card>
      {query.tab === 'users' && users && (
        <UserTabView
          busy={busy}
          title={t('user_management')}
          description={t('user_management_description')}
          onAdd={() => setEditor({})}
          page={users}
          rows={userRows}
          columns={userColumns}
          onPageChange={(page) => nav.navigate({ page })}
          onPageSizeChange={(pageSize) => nav.navigate({ pageSize, page: 1 })}
          theadClassName={RTS_DASHBOARD_TABLE_HEAD_CLASS}
          tableClassName={RTS_USER_MASTER_TABLE_CLASS}
          containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
          renderActions={(row) => (
            <div
              className="flex justify-center gap-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <EditButton
                disabled={busy}
                title="Edit and allocate user"
                aria-label="Edit / allocate"
                onClick={() => openUser(row.id)}
              />
              {row.isActive ? (
                <LockButton
                  size="sm"
                  label="Lock"
                  disabled={busy}
                  onClick={() =>
                    confirm({
                      onConfirm: async () =>
                        mutation.run(() => changeRtsUserStatusAction(row.id, false)),
                    })
                  }
                />
              ) : (
                <UnlockButton
                  size="sm"
                  label="Unlock"
                  disabled={busy}
                  onClick={() =>
                    confirm({
                      onConfirm: async () =>
                        mutation.run(() => changeRtsUserStatusAction(row.id, true)),
                    })
                  }
                />
              )}
            </div>
          )}
        />
      )}
      {query.tab === 'roles' && roles && (
        <RoleTabView
          busy={busy}
          title={t('roles')}
          description={t('roles_grant_screen_permissions')}
          onAdd={() => setRoleEditor({})}
          page={roles}
          rows={roleRows}
          columns={roleColumns}
          onPageChange={(page) => nav.navigate({ page })}
          onPageSizeChange={(pageSize) => nav.navigate({ pageSize, page: 1 })}
          theadClassName={RTS_DASHBOARD_TABLE_HEAD_CLASS}
          tableClassName={RTS_USER_MASTER_TABLE_CLASS}
          containerClassName={RTS_DASHBOARD_TABLE_CONTAINER_CLASS}
          renderActions={(row) => (
            <div
              className="flex justify-center gap-1.5"
              onClick={(event) => event.stopPropagation()}
            >
              <EditButton
                disabled={busy}
                title="Edit role"
                onClick={() => setRoleEditor({ role: row.source })}
              />
              <DeleteButton
                disabled={busy}
                title="Delete role"
                onClick={() => removeRole(row.id)}
              />
            </div>
          )}
        />
      )}
      {editor && (
        <UserEditor user={editor.user} lookups={lookups} onClose={() => setEditor(null)} />
      )}
      {roleEditor && (
        <RoleEditor role={roleEditor.role} lookups={lookups} onClose={() => setRoleEditor(null)} />
      )}
    </div>
  );
}

function UserEditor({
  user,
  lookups,
  onClose,
}: {
  user?: AccessUser;
  lookups: AccessLookups;
  onClose: () => void;
}) {
  const t = useTranslations('rts.accessManagement');
  const locale = useLocale();
  const [draft, setDraft] = useState<UserDraft>(() => createUserDraft(user));
  const mutation = useMasterMutation();
  const allocationLabels = {
    active: t('active'),
    available: t('available'),
    inactiveAllocation: t('inactive_allocation'),
    masterInactive: t('master_inactive'),
    reactivateHint: t('select_to_reactivate'),
    masterInactiveHint: t('activate_in_master_before_assigning'),
  };
  const close = () => {
    if (!mutation.pending) onClose();
  };
  const patch = <K extends keyof UserDraft>(key: K, value: UserDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const profileFields: {
    key: keyof Pick<
      UserDraft,
      | 'userName'
      | 'firstName'
      | 'middleName'
      | 'lastName'
      | 'userCode'
      | 'email'
      | 'mobileNo'
      | 'alternateMobileNo'
    >;
    label: string;
    max: number;
  }[] = [
    { key: 'userName', label: 'Username *', max: 100 },
    { key: 'userCode', label: 'User code', max: 50 },
    { key: 'firstName', label: 'First name', max: 100 },
    { key: 'middleName', label: 'Middle name', max: 100 },
    { key: 'lastName', label: 'Last name', max: 100 },
    { key: 'email', label: 'Email', max: 100 },
    { key: 'mobileNo', label: 'Mobile number', max: 30 },
    { key: 'alternateMobileNo', label: 'Alternate mobile', max: 30 },
  ];
  return (
    <Drawer
      open
      onClose={close}
      title={user ? `User: ${user.userName}` : 'Create user'}
      width="xl"
      footer={
        <div className="flex justify-end gap-2">
          <CancelButton disabled={mutation.pending} onClick={close} label="Close" />
          <SaveButton
            form="rts-user-editor"
            type="submit"
            disabled={mutation.pending}
            isLoading={mutation.pending}
            label="Save user & allocations"
          />
        </div>
      }
    >
      <form
        id="rts-user-editor"
        className="space-y-5 bg-slate-50 p-5 text-slate-900"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.run(() => saveRtsUserAction(user?.id, draft), onClose);
        }}
      >
        <ErrorNotice message={mutation.error} />
        {!user && (
          <p className="text-sm text-slate-600">
            {t(
              'the_backend_generates_the_initial_password_and_requires_a_password_change_enter_the_user_s_correct_e'
            )}{' '}
          </p>
        )}
        <fieldset disabled={mutation.pending} className="space-y-5">
          <legend className="sr-only">{t('edit_user_and_allocations')}</legend>
          <EditorSection step={1} title={t('user_details')}>
            <div className="grid gap-3 sm:grid-cols-2">
              {profileFields.map(({ key, label, max }) => (
                <Field key={key} label={label}>
                  <input
                    className={editorFieldClass}
                    type={key === 'email' ? 'email' : 'text'}
                    required={key === 'userName'}
                    maxLength={max}
                    value={draft[key]}
                    onChange={(e) => patch(key, e.target.value)}
                  />
                </Field>
              ))}
              <Field label="Language">
                <select
                  className={editorFieldClass}
                  value={draft.language}
                  onChange={(e) => patch('language', e.target.value)}
                >
                  {!['en', 'mr', 'hi'].includes(draft.language) && (
                    <option value={draft.language}>{draft.language || 'Unspecified'}</option>
                  )}
                  <option value="en">{t('english')}</option>
                  <option value="mr">{t('marathi')}</option>
                  <option value="hi">{t('hindi')}</option>
                </select>
              </Field>
              <Field label="Employee type ID (optional)">
                <input
                  type="number"
                  min={1}
                  className={editorFieldClass}
                  value={draft.employeeTypeID ?? ''}
                  onChange={(e) =>
                    patch('employeeTypeID', e.target.value ? Number(e.target.value) : null)
                  }
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Address">
                <textarea
                  className={`${editorFieldClass} min-h-24 resize-y`}
                  maxLength={400}
                  value={draft.address}
                  onChange={(e) => patch('address', e.target.value)}
                />
              </Field>
              <Field label="Remark">
                <textarea
                  className={`${editorFieldClass} min-h-24 resize-y`}
                  maxLength={400}
                  value={draft.remark}
                  onChange={(e) => patch('remark', e.target.value)}
                />
              </Field>
            </div>
          </EditorSection>

          <EditorSection
            step={2}
            title={t('departments')}
            description={t(
              'removing_a_department_also_removes_its_module_and_role_selections_when_you_save'
            )}
            action={
              <MasterLink href={`/${locale}/rts/configuration-settings/rts-departments`}>
                {t('manage_departments')}
              </MasterLink>
            }
          >
            <div className="grid max-h-64 gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
              {lookups.departments.map((dept) => {
                const allocation = user?.departments?.find((item) => item.departmentId === dept.id);
                const checked = draft.departmentIds.includes(dept.id);
                return (
                  <AllocationOption
                    key={dept.id}
                    id={dept.id}
                    name={dept.departmentName}
                    checked={checked}
                    masterActive={dept.isActive}
                    wasInactive={Boolean(allocation && !allocation.isActive)}
                    labels={allocationLabels}
                    onChange={(selected) =>
                      setDraft((current) =>
                        selected
                          ? {
                              ...current,
                              departmentIds: current.departmentIds.includes(dept.id)
                                ? current.departmentIds
                                : [...current.departmentIds, dept.id],
                            }
                          : removeDepartment(current, dept.id)
                      )
                    }
                  />
                );
              })}
            </div>
          </EditorSection>

          <EditorSection
            step={3}
            title={t('modules_and_roles_by_department')}
            description={
              draft.departmentIds.length
                ? t('select_reactivate_or_remove_allocations')
                : t('select_a_department_to_allocate_its_modules_and_roles')
            }
          >
            <div className="flex flex-wrap gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <span className="mr-auto font-medium">
                {t('globally_inactive_items_manage_in_master')}
              </span>
              <MasterLink href={`/${locale}/configuration-settings/module-master`}>
                {t('manage_modules')}
              </MasterLink>
              <MasterLink href={`/${locale}/rts/configuration-settings/rts-user?tab=roles`}>
                {t('manage_roles')}
              </MasterLink>
            </div>
            {draft.departmentIds.map((deptId) => (
              <section
                key={deptId}
                className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <h3 className="font-bold text-blue-900">
                  {lookups.departments.find((d) => d.id === deptId)?.departmentName ??
                    `Department ${deptId} (unavailable)`}
                </h3>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                      {t('modules')}
                    </h4>
                    {lookups.modules
                      .filter((module) => module.departmentId === deptId)
                      .map((module) => {
                        const allocation = user?.moduleAccess?.find(
                          (item) => item.departmentId === deptId && item.moduleId === module.id
                        );
                        const checked = draft.modules.some(
                          (item) => item.departmentId === deptId && item.moduleId === module.id
                        );
                        return (
                          <AllocationOption
                            key={module.id}
                            id={module.id}
                            name={module.moduleName}
                            checked={checked}
                            masterActive={module.isActive}
                            wasInactive={Boolean(allocation && !allocation.isActive)}
                            labels={allocationLabels}
                            onChange={(selected) =>
                              patch(
                                'modules',
                                selected
                                  ? checked
                                    ? draft.modules
                                    : [
                                        ...draft.modules,
                                        { departmentId: deptId, moduleId: module.id },
                                      ]
                                  : draft.modules.filter(
                                      (item) =>
                                        !(
                                          item.departmentId === deptId &&
                                          item.moduleId === module.id
                                        )
                                    )
                              )
                            }
                          />
                        );
                      })}
                    {!lookups.modules.some((module) => module.departmentId === deptId) && (
                      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
                        {t('no_modules_for_department')}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                      {t('roles_grant_screen_permissions')}
                    </h4>
                    {lookups.roles
                      .filter((role) => role.departmentId === deptId)
                      .map((role) => {
                        const allocation = user?.roleAllocations?.find(
                          (item) => item.departmentId === deptId && item.userRoleId === role.id
                        );
                        const checked = draft.roles.some(
                          (item) => item.departmentId === deptId && item.userRoleId === role.id
                        );
                        return (
                          <AllocationOption
                            key={role.id}
                            id={role.id}
                            name={role.userRoleName}
                            checked={checked}
                            masterActive={role.isActive}
                            wasInactive={Boolean(allocation && !allocation.isActive)}
                            labels={allocationLabels}
                            onChange={(selected) =>
                              patch(
                                'roles',
                                selected
                                  ? checked
                                    ? draft.roles
                                    : [
                                        ...draft.roles,
                                        { departmentId: deptId, userRoleId: role.id },
                                      ]
                                  : draft.roles.filter(
                                      (item) =>
                                        !(
                                          item.departmentId === deptId &&
                                          item.userRoleId === role.id
                                        )
                                    )
                              )
                            }
                          />
                        );
                      })}
                    {!lookups.roles.some((role) => role.departmentId === deptId) && (
                      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
                        {t('create_a_role_in_the_roles_tab_first')}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </EditorSection>
        </fieldset>
      </form>
    </Drawer>
  );
}
function RoleEditor({
  role,
  lookups,
  onClose,
}: {
  role?: AccessRole;
  lookups: AccessLookups;
  onClose: () => void;
}) {
  const t = useTranslations('rts.accessManagement');
  const [name, setName] = useState(role?.userRoleName ?? '');
  const [deptId, setDeptId] = useState(role?.departmentId ?? 0);
  const [active, setActive] = useState(role?.isActive ?? true);
  const mutation = useMasterMutation();
  return (
    <Drawer
      open
      onClose={() => {
        if (!mutation.pending) onClose();
      }}
      title={role ? 'Edit role' : 'Create role'}
      width="md"
    >
      <form
        className="space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.run(() => saveRtsRoleAction(role?.id, name, deptId, active), onClose);
        }}
      >
        <ErrorNotice message={mutation.error} />
        <fieldset disabled={mutation.pending} className="space-y-4">
          <Field label="Role name *">
            <input
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Department *">
            <select
              required
              disabled={!!role}
              value={deptId || ''}
              onChange={(e) => setDeptId(Number(e.target.value))}
              className={fieldClass}
            >
              <option value="">{t('select_department')}</option>
              {lookups.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </Field>
          {role && (
            <p className="text-sm text-slate-500">
              {t('the_department_is_fixed_to_preserve_existing_user_and_screen_allocations')}{' '}
            </p>
          )}
          <Check label="Active" checked={active} onChange={setActive} />
          <SaveButton
            type="submit"
            disabled={mutation.pending}
            isLoading={mutation.pending}
            label="Save role"
          />
        </fieldset>
      </form>
    </Drawer>
  );
}

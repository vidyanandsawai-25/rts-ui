'use client';

import { useState } from 'react';
import { Shield, Briefcase } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Badge, Tabs, TabPanel, TabList, Tab, Button, SearchInput } from '@/components/common';
import { Role, Designation, RoleDesignationMasterProps } from '@/types/user-management';
import {
  deleteUserRoleAction,
  deleteDesignationAction,
} from '@/app/[locale]/configuration-settings/user-management/actions.mutations';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { useRoleTable } from '@/hooks/configuration-settings/user-management/useRoleTable';
import { useDesignationTable } from '@/hooks/configuration-settings/user-management/useDesignationTable';
import { RoleTable } from './components/RoleTable';
import { DesignationTable } from './components/DesignationTable';

export function RoleDesignationMasterClient({
  initialRoles = [],
  initialDesignations = [],
}: RoleDesignationMasterProps) {
  const t = useTranslations('userManagement');
  const { confirm } = useConfirm();
  const [deletingRoleId, setDeletingRoleId] = useState<string | number | null>(null);
  const [deletingDesignationId, setDeletingDesignationId] = useState<string | number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const locale = useLocale();
  const basePath = `/${locale}/configuration-settings/user-management`;

  // Handle sub-tab selection via search params
  const activeSubTab = searchParams.get('subtab') || 'roles';

  const handleSubTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('subtab', val);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const {
    roles,
    setRoles,
    searchTerm: roleSearch,
    setSearchTerm: setRoleSearch,
    pageNumber: rolePage,
    setPageNumber: setRolePage,
    pageSize,
    filteredRoles,
  } = useRoleTable(initialRoles);

  const {
    designations,
    setDesignations,
    searchTerm: desSearch,
    setSearchTerm: setDesSearch,
    pageNumber: desPage,
    setPageNumber: setDesPage,
    filteredDesignations,
  } = useDesignationTable(initialDesignations);

  const handleRoleEdit = (role: Role) => {
    router.push(`${basePath}/roles/edit/${role.id}`);
  };

  const handleDeleteRole = async (role: Role) => {
    confirm({
      variant: 'delete',
      onConfirm: async () => {
        setDeletingRoleId(role.id);
        try {
          const res = await deleteUserRoleAction(role.id);
          if (res.success) {
            setRoles(
              roles.map((r) =>
                r.id === role.id ? { ...r, isActive: false, status: 'Inactive' } : r
              )
            );
            toast.success(t('messages.roleDeleteSuccess'));
          } else {
            toast.error(res.message || t('messages.roleDeleteError'));
          }
        } finally {
          setDeletingRoleId(null);
        }
      },
    });
  };

  const handleDesignationEdit = (des: Designation) => {
    router.push(`${basePath}/designations/edit/${des.id}`);
  };

  const handleDeleteDesignation = async (des: Designation) => {
    confirm({
      variant: 'delete',
      onConfirm: async () => {
        setDeletingDesignationId(des.id);
        try {
          const res = await deleteDesignationAction(des.id);
          if (res.success) {
            setDesignations(
              designations.map((d) =>
                d.id === des.id ? { ...d, isActive: false, status: 'Inactive' } : d
              )
            );
            toast.success(t('messages.designationDeleteSuccess'));
          } else {
            toast.error(res.message || t('messages.designationDeleteError'));
          }
        } finally {
          setDeletingDesignationId(null);
        }
      },
    });
  };

  const isRoles = activeSubTab === 'roles';

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg shadow-sm">
            {isRoles ? (
              <Shield className="w-5 h-5 text-blue-600" />
            ) : (
              <Briefcase className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">
              {isRoles ? t('roles.title') : t('roles.designationsTab')}
            </h1>
            <p className="text-slate-700 mt-0.5 text-sm">
              {isRoles ? t('roles.subtitle') : t('roles.subtitleDesignation')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 h-10">
            {isRoles ? (
              <>
                <Shield className="w-3 h-3 mr-1" />
                {roles.length} {t('roles.rolesTab')}
              </>
            ) : (
              <>
                <Briefcase className="w-3 h-3 mr-1" />
                {designations.length} {t('roles.designationsTab')}
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs value={activeSubTab} onChange={(v) => handleSubTabChange(v as string)}>
          <div className="flex items-center justify-between mb-4">
            <TabList className="bg-slate-100 p-1 rounded-lg">
              <Tab
                value="roles"
                className="flex items-center gap-2 px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Shield className="w-4 h-4" />
                {t('roles.rolesTab')}
              </Tab>
              <Tab
                value="designations"
                className="flex items-center gap-2 px-4 py-1.5 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Briefcase className="w-4 h-4" />
                {t('roles.designationsTab')}
              </Tab>
            </TabList>

            <div className="flex items-center gap-4">
              <SearchInput
                placeholder={isRoles ? t('filters.searchRole') : t('filters.searchDesignation')}
                value={isRoles ? roleSearch : desSearch}
                onChange={(val) => (isRoles ? setRoleSearch(val) : setDesSearch(val))}
                className="mb-0 w-64 [&_input]:text-black [&_input]:opacity-100"
              />
              <Button
                onClick={() => router.push(`${basePath}/${isRoles ? 'roles' : 'designations'}/add`)}
                aria-label={isRoles ? t('roles.addRole') : t('roles.addDesignation')}
                className="flex items-center gap-2"
              >
                {isRoles ? <Shield className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                {isRoles ? t('roles.addRole') : t('roles.addDesignation')}
              </Button>
            </div>
          </div>

          <TabPanel value="roles" className="mt-0 border-none p-0 shadow-none">
            <RoleTable
              roles={filteredRoles.slice((rolePage - 1) * pageSize, rolePage * pageSize)}
              pageNumber={rolePage}
              pageSize={pageSize}
              totalCount={filteredRoles.length}
              onPageChange={setRolePage}
              onEdit={handleRoleEdit}
              onDelete={handleDeleteRole}
              deletingId={deletingRoleId}
            />
          </TabPanel>

          <TabPanel value="designations" className="mt-0 border-none p-0 shadow-none">
            <DesignationTable
              designations={filteredDesignations.slice(
                (desPage - 1) * pageSize,
                desPage * pageSize
              )}
              pageNumber={desPage}
              pageSize={pageSize}
              totalCount={filteredDesignations.length}
              onPageChange={setDesPage}
              onEdit={handleDesignationEdit}
              onDelete={handleDeleteDesignation}
              deletingId={deletingDesignationId}
            />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

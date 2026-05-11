'use client';

import { Monitor, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/common/Card';
import { Tabs, TabList, Tab, TabPanel } from '@/components/common/Tabs';
import TableHeader from '@/components/common/TableHeader';
import { ScreenMasterManagement } from './ScreenMasterManagement';
import { RolePermissionManager } from './RolePermissionManager';
import { PageContainer } from '@/components/common/PageContainer';
import { useQueryTransition } from '@/hooks/useQueryTransition';
import type {
  ScreenMasterData,
  ScreenGroupMasterData,
  DepartmentMasterData,
  ModuleMasterData,
  RoleMasterData,
  PaginationData,
  ScreenAccessPermissionData,
} from '@/types/screen-access.types';

interface ScreenAccessLayoutProps {
  tab: string;
  subTab: string;
  screens: ScreenMasterData[];
  allScreens: ScreenMasterData[];
  groups: ScreenGroupMasterData[];
  departments: DepartmentMasterData[];
  modules: ModuleMasterData[];
  roles: RoleMasterData[];
  initialRoleAccess: ScreenAccessPermissionData[];
  dataRoleId?: number;
  translations: {
    title: string;
    subtitle: string;
  };
  screensPagination: PaginationData;
  groupsPagination: PaginationData;
}

export function ScreenAccessLayout({
  tab,
  subTab,
  screens,
  allScreens,
  groups,
  departments,
  modules,
  roles,
  initialRoleAccess,
  dataRoleId,
  translations,
  screensPagination,
  groupsPagination,
}: ScreenAccessLayoutProps) {
  const t = useTranslations('screenAccess');
  const { updateQueries } = useQueryTransition();

  const handleTabChange = (value: string | number) => {
    const val = String(value);
    const updates: Record<string, string | null> = {
      tab: val,
      subTab: val === 'screen-management' ? 'screens' : null,
      action: null,
      id: null,
      roleId: null,
    };

    updateQueries(updates);
  };

  return (
    <PageContainer className="flex flex-col min-h-screen">
      <TableHeader title={translations.title} subtitle={translations.subtitle} icon={Monitor} />

      <Card className="flex-1 flex flex-col bg-white shadow-2xl mt-4 relative overflow-hidden">
        <Tabs
          value={tab}
          onChange={handleTabChange}
          className="flex-1 flex flex-col"
          justify="center"
          fullWidth
        >
          {/* Tab Headers */}
          <div className="border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
            <TabList className="w-full bg-transparent p-0 gap-2 overflow-hidden flex justify-center">
              <Tab
                value="screen-management"
                className="gap-2 data-[state=active]:bg-white flex flex-col justify-center items-center py-4"
              >
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-sm">{t('tabs.screenManagement')}</span>
              </Tab>
              <Tab
                value="access-control"
                className="gap-2 px-6 data-[state=active]:bg-white flex flex-col justify-center items-center py-4"
              >
                <Shield className="w-4 h-4 text-violet-600" />
                <span className="font-semibold text-sm">{t('tabs.accessControl')}</span>
              </Tab>
            </TabList>
          </div>

          {/* Screen Management Tab */}
          <TabPanel value="screen-management" className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScreenMasterManagement
              subTab={subTab}
              initialScreens={screens}
              initialGroups={groups}
              screensPagination={screensPagination}
              groupsPagination={groupsPagination}
            />
          </TabPanel>

          {/* Access Control Tab */}
          <TabPanel value="access-control" className="flex-1 flex flex-col p-0 overflow-hidden">
            <RolePermissionManager
              key={dataRoleId}
              screens={allScreens}
              departments={departments}
              modules={modules}
              roles={roles}
              initialRoleAccess={initialRoleAccess}
            />
          </TabPanel>
        </Tabs>
      </Card>
    </PageContainer>
  );
}

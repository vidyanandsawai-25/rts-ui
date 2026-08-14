'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Settings, Users, Shield, AlertCircle } from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel, TableHeader, PageContainer } from '@/components/common';
import { UserConfigurationClientProps } from '@/types/user-management';
import { useTranslations } from 'next-intl';

export function UserConfigurationClient({
  userManagement,
  roleDesignationMaster,
  translations,
  fetchError,
}: UserConfigurationClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tCommon = useTranslations('common');

  const activeTab = searchParams.get('tab') || 'users';

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', val);

    if (val === 'roles') {
      params.set('subtab', searchParams.get('subtab') || 'roles');
    } else {
      // Clean up subtab when going back to users
      params.delete('subtab');
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <PageContainer>
      <div className="space-y-3 overflow-x-hidden">
        <TableHeader icon={Settings} title={translations.title} subtitle={translations.subtitle} />

        {fetchError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold">
                {tCommon('messages.fetchError') || 'Error fetching data'}
              </p>
              <p className="text-xs text-red-700 mt-1 font-mono">{fetchError}</p>
            </div>
          </div>
        )}

        <Tabs
          value={activeTab}
          onChange={(val) => handleTabChange(val as string)}
          className="w-full"
        >
          <TabList className="grid w-full grid-cols-2 max-w-[1000px] overflow-hidden">
            <Tab value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {translations.usersTab}
            </Tab>
            <Tab value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {translations.rolesTab}
            </Tab>
          </TabList>

          <TabPanel value="users" className="mt-0">
            {userManagement}
          </TabPanel>

          <TabPanel value="roles" className="mt-0">
            {roleDesignationMaster}
          </TabPanel>
        </Tabs>
      </div>
    </PageContainer>
  );
}

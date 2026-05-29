'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { resolveUlbConfigurationErrorMessage } from '@/lib/utils/ulb-configuration-error';
import { Tabs } from '@/components/common/Tabs';
import { useUlbConfigurationForm } from '@/hooks/configuration-settings/ulb-configuration/useUlbConfigurationForm';
import { useUlbConfigurationSave } from '@/hooks/configuration-settings/ulb-configuration/useUlbConfigurationSave';
import { useDepartmentLicenses } from '@/hooks/configuration-settings/ulb-configuration/useDepartmentLicenses';
import type {
  ULBConfigurationModuleProps,
  UlbSectionKey,
  UlbTabId,
} from '@/types/ulbconfig-master.types';
import { ULBProgressHeader } from './ULBProgressHeader';
import { ULBTabList } from './ULBTabList';
import { ULBInfoTab } from './tabs/ULBInfoTab';
import { ULBLogoImagesTab } from './tabs/ULBLogoImagesTab';
import { ULBProjectLicenseTab } from './tabs/ULBProjectLicenseTab';
import { ULBDepartmentLicenseTab } from './tabs/ULBDepartmentLicenseTab';

const TOTAL_STEPS = 4;
const FOOTER_CLASS =
  'mt-auto flex flex-shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-4 py-3';
const PANEL_CLASS = 'mt-0 flex min-h-0 flex-1 flex-col outline-none';

export default function ULBConfigurationClient({
  initialUlbData,
  initialDeptData,
  initialLicenceData,
  fetchError,
  statusCode,
}: ULBConfigurationModuleProps) {
  const t = useTranslations('ulb_configuration');
  const [activeTab, setActiveTab] = useState<UlbTabId>('ulb-info');
  const [ulbMasterId, setUlbMasterId] = useState<number | undefined>(initialUlbData?.id);

  const form = useUlbConfigurationForm(initialUlbData);
  const depts = useDepartmentLicenses(initialDeptData, initialLicenceData);
  const { loadDepartmentsFromApi } = depts;

  const deptServerKey = useMemo(
    () =>
      [
        initialLicenceData.length,
        ...initialLicenceData.map(
          (l) => `${l.departmentLicenceDetailsId ?? 0}:${l.licenceEndDate ?? ''}`
        ),
      ].join('-'),
    [initialLicenceData]
  );

  // Load departments from Department Master API when the tab opens (no static fallback).
  useEffect(() => {
    if (activeTab !== 'department-license') return;
    void loadDepartmentsFromApi(initialLicenceData);
  }, [activeTab, deptServerKey, initialLicenceData, loadDepartmentsFromApi]);

  const { save, isSaving } = useUlbConfigurationSave({
    formData: form.formData,
    ulbMasterId,
    onSaved: (ulb) => {
      setUlbMasterId(ulb.id);
      form.syncFromUlbMaster(ulb);
    },
  });

  const goTo = useCallback((next: UlbTabId) => setActiveTab(next), []);

  const handleSaveSection = useCallback(
    async (section: UlbSectionKey) => {
      if (section !== 'ulb-info' && !ulbMasterId && !form.validateSection('ulb-info')) {
        toast.error(t('messages.completeUlbInfoFirst'));
        setActiveTab('ulb-info');
        return;
      }

      if (!form.validateSection(section)) {
        const validationKey = form.getSectionValidationError(section);
        toast.error(
          validationKey
            ? resolveUlbConfigurationErrorMessage(validationKey, t, t('messages.validation'))
            : t('messages.validation')
        );
        return;
      }

      const saved = await save(section);
      if (!saved) return;

      form.markSectionComplete(section, true);
    },
    [form, save, t, ulbMasterId]
  );

  const handleApplyMaster = useCallback(() => {
    depts.applyMaster({
      startDate: form.formData.licenseStartDate,
      duration: form.formData.licenseDuration,
      endDate: form.formData.licenseEndDate,
    });
  }, [depts, form.formData.licenseDuration, form.formData.licenseEndDate, form.formData.licenseStartDate]);

  const handleSaveDepartments = useCallback(async () => {
    const saved = await depts.saveLicences();
    if (!saved) return;
    form.setDepartmentLicenseComplete(true);
  }, [depts, form]);

  const handleFinalSave = useCallback(async () => {
    if (!form.validateSection('ulb-info')) {
      toast.error(t('messages.validation'));
      setActiveTab('ulb-info');
      return;
    }
    if (!form.validateSection('project-license-info')) {
      toast.error(t('messages.validation'));
      setActiveTab('project-license-info');
      return;
    }

    const savedUlb = await save();
    if (!savedUlb) return;

    const savedDepts = await depts.saveLicences();
    if (!savedDepts) return;

    form.setDepartmentLicenseComplete(true);
    toast.success(t('messages.success'));
  }, [depts, form, save, t]);

  if (fetchError) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-900">{t('messages.fetchError')}</h2>
        <p className="max-w-md text-sm text-slate-600">{fetchError}</p>
        {statusCode ? (
          <p className="text-xs text-slate-400">HTTP {statusCode}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="-mx-3 -my-3 flex min-h-0 flex-1 flex-col bg-[#f5f8ff] md:-mx-4">
      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-3 pt-2">
        <ULBProgressHeader
          completedCount={form.completedCount}
          totalSteps={TOTAL_STEPS}
          urgentAlertCount={form.urgentAlertCount}
        />

        <Tabs
          value={activeTab}
          onChange={(val) => setActiveTab(val as UlbTabId)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <ULBTabList activeTab={activeTab} completionStatus={form.completionStatus} t={t} />

          <Tabs.TabPanel value="ulb-info" className={PANEL_CLASS}>
            <ULBInfoTab
              formData={form.formData}
              t={t}
              onFieldChange={form.setField}
              onStateChange={form.handleStateChange}
              onSave={() => {
                if (!isSaving) void handleSaveSection('ulb-info');
              }}
              onNext={() => goTo('logo-images')}
              footerClassName={FOOTER_CLASS}
            />
          </Tabs.TabPanel>

          <Tabs.TabPanel value="logo-images" className={PANEL_CLASS}>
            <ULBLogoImagesTab
              t={t}
              logoUrl={form.formData.ulbLogo}
              onLogoChange={(url) => form.setField('ulbLogo', url)}
              onSave={() => {
                if (!isSaving) void handleSaveSection('logo-images');
              }}
              onPrevious={() => goTo('ulb-info')}
              onNext={() => goTo('project-license-info')}
              isSaving={isSaving}
              footerClassName={FOOTER_CLASS}
            />
          </Tabs.TabPanel>

          <Tabs.TabPanel value="project-license-info" className={PANEL_CLASS}>
            <ULBProjectLicenseTab
              formData={form.formData}
              masterRenewalAlerts={form.masterRenewalAlerts}
              t={t}
              onFieldChange={form.setField}
              onLicenseFieldChange={form.handleLicenseChange}
              onGenerateLicenseKey={form.generateLicenseKey}
              onSave={() => {
                if (!isSaving) void handleSaveSection('project-license-info');
              }}
              onPrevious={() => goTo('logo-images')}
              onNext={() => goTo('department-license')}
              isSaving={isSaving}
              footerClassName={FOOTER_CLASS}
            />
          </Tabs.TabPanel>

          <Tabs.TabPanel value="department-license" className={PANEL_CLASS}>
            <ULBDepartmentLicenseTab
              t={t}
              filtered={depts.filtered}
              totalCount={depts.departments.length}
              activeCount={depts.activeCount}
              searchQuery={depts.searchQuery}
              onSearchChange={depts.setSearchQuery}
              master={{
                startDate: form.formData.licenseStartDate,
                duration: form.formData.licenseDuration,
                endDate: form.formData.licenseEndDate,
              }}
              onToggle={depts.toggle}
              onDateChange={depts.updateDate}
              onApplyMaster={handleApplyMaster}
              onEnableAll={() =>
                depts.enableAll({
                  startDate: form.formData.licenseStartDate,
                  duration: form.formData.licenseDuration,
                  endDate: form.formData.licenseEndDate,
                })
              }
              onDisableAll={depts.disableAll}
              onPrevious={() => goTo('project-license-info')}
              onSaveProgress={() => {
                if (!isSaving && !depts.isSavingLicences) void handleSaveDepartments();
              }}
              onFinalize={() => {
                if (!isSaving && !depts.isSavingLicences) void handleFinalSave();
              }}
              isSaving={isSaving || depts.isSavingLicences}
              isLoadingDepartments={depts.isLoadingDepartments}
              footerClassName={FOOTER_CLASS}
            />
          </Tabs.TabPanel>
        </Tabs>
      </div>
    </div>
  );
}


'use client';

import { Drawer } from '@/components/common/Drawer';
import { Button } from '@/components/common/ActionButton';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/select';
import { Monitor, Save, Layout, FolderTree, Settings } from 'lucide-react';
import {
  ScreenGroupMasterData,
  ScreenMasterData,
  ModuleMasterData,
} from '@/types/screen-access.types';
import { useScreenForm } from '@/hooks/configuration-settings/screenAccess/useScreenForm';

import { SCREEN_CODE_MAX, SCREEN_NAME_MAX, ROUTE_PATH_MAX } from '@/lib/constants/screen-access.constants';
import { FormSection, FieldLabel, ErrorMsg, ToggleField } from './FormHelpers';
import { TEXT_SANITIZE, DESCRIPTION_SANITIZE } from '@/lib/utils/validation-rules';

interface ScreenFormProps {
  initialData?: Partial<ScreenMasterData>;
  isEdit?: boolean;
  groups: ScreenGroupMasterData[];
  modules: ModuleMasterData[];
}

export function ScreenForm({ initialData, isEdit: isEditProp, groups, modules }: ScreenFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleSubmit,
    handleBlur,
    handleCancel,
    showError,
    isEdit,
    t,
  } = useScreenForm({ initialData, isEdit: isEditProp });

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      width="lg"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit
                ? t('screenManagement.screens.form.editTitle')
                : t('screenManagement.screens.form.addTitle')}
            </h2>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
            {t('screenManagement.screens.form.cancelButton')}
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('screenManagement.screens.form.saveButton')}
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6 pb-40">
        {/* Section 1: Identity */}
        <FormSection
          title={t('screenManagement.screens.form.sectionIdentity')}
          icon={<Layout className="w-4 h-4" />}
          color="blue"
        >
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <FieldLabel
                htmlFor="screenCode"
                label={t('screenManagement.screens.form.screenCode')}
                required
              />
              <Input
                id="screenCode"
                value={formData.screenCode || ''}
                onChange={(e) => {
                  const val = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9_-]/g, '')
                    .slice(0, 20);
                  handleChange('screenCode', val);
                }}
                onBlur={() => handleBlur('screenCode')}
                maxLength={SCREEN_CODE_MAX}
                placeholder={t('screenManagement.screens.form.screenCodePlaceholder')}
                className="font-mono uppercase"
              />
              {showError('screenCode') && <ErrorMsg error={errors.screenCode} />}
            </div>
            <div className="col-span-8">
              <FieldLabel
                htmlFor="screenName"
                label={t('screenManagement.screens.form.screenName')}
                required
              />
              <Input
                id="screenName"
                value={formData.screenName || ''}
                onChange={(e) => {
                  const val = e.target.value
                    .replace(DESCRIPTION_SANITIZE, '')
                    .replace(/[&()\/-]/g, '');
                  handleChange('screenName', val);
                }}
                onBlur={() => handleBlur('screenName')}
                maxLength={SCREEN_NAME_MAX}
                placeholder={t('screenManagement.screens.form.screenNamePlaceholder')}
              />
              {showError('screenName') && <ErrorMsg error={errors.screenName} />}
            </div>
            <div className="col-span-12">
              <FieldLabel
                htmlFor="routePath"
                label={t('screenManagement.screens.form.route')}
                required
              />
              <Input
                id="routePath"
                value={formData.routePath || ''}
                onChange={(e) => {
                  const val = e.target.value
                    .replace(TEXT_SANITIZE, '')
                    .replace(/[&()]/g, '')
                    .slice(0, ROUTE_PATH_MAX);
                  handleChange('routePath', val);
                }}
                onBlur={() => handleBlur('routePath')}
                maxLength={ROUTE_PATH_MAX}
                placeholder={t('screenManagement.screens.form.routePlaceholder')}
                className="font-mono"
              />
              {showError('routePath') && <ErrorMsg error={errors.routePath} />}
            </div>
          </div>
        </FormSection>

        {/* Section 2: Classification */}
        <FormSection
          title={t('screenManagement.screens.form.sectionClassification')}
          icon={<FolderTree className="w-4 h-4" />}
          color="violet"
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <FieldLabel label={t('screenManagement.screens.form.screenGroup')} required />
              <Select
                value={String(formData.screenGroupId || '')}
                onChange={(_, val) => {
                  handleChange('screenGroupId', val ? parseInt(val, 10) : undefined);
                  handleBlur('screenGroupId');
                }}
                options={groups
                  .filter((g) => g.isActive)
                  .map((g) => ({
                    value: String(g.screenGroupId),
                    label:
                      g.screenGroupName && !/\?{2,}/.test(g.screenGroupName)
                        ? g.screenGroupName
                        : g.screenGroupLocalName || g.screenGroupName,
                  }))}
                placeholder={t('screenManagement.screens.form.selectGroup')}
              />
              {showError('screenGroupId') && <ErrorMsg error={errors.screenGroupId} />}
            </div>
            <div>
              <FieldLabel
                label={t('screenManagement.screens.form.module', {
                  defaultValue: 'Module',
                })}
                required
              />
              <Select
                value={String(formData.moduleId || '')}
                onChange={(_, val) => {
                  const numVal = val ? parseInt(val, 10) : undefined;
                  handleChange('moduleId', numVal);

                  if (numVal) {
                    const selectedModule = modules.find((m) => m.moduleId === numVal);
                    if (selectedModule) {
                      handleChange('departmentMasterId', selectedModule.departmentMasterId);
                    }
                  } else {
                    handleChange('departmentMasterId', undefined);
                  }

                  handleBlur('moduleId');
                }}
                options={modules
                  .filter(
                    (m) => m.isActive !== false || String(m.moduleId) === String(formData.moduleId)
                  )
                  .map((m) => ({
                    value: String(m.moduleId),
                    label:
                      m.moduleName +
                      (m.isActive === false
                        ? ` (${t('filters.inactive', { defaultValue: 'Inactive' })})`
                        : ''),
                  }))}
                placeholder={t('screenManagement.screens.form.selectModule', {
                  defaultValue: 'Select Module',
                })}
              />
              {showError('moduleId') && <ErrorMsg error={errors.moduleId as string} />}
            </div>
          </div>
        </FormSection>

        {/* Section 3: Configuration */}
        {isEdit && (
          <FormSection
            title={t('screenManagement.screens.form.sectionConfig')}
            icon={<Settings className="w-4 h-4" />}
            color="amber"
          >
            <div className="grid grid-cols-2 gap-6">
              <ToggleField
                label={t('screenManagement.screens.form.status')}
                value={!!formData.isActive}
                onChange={(val) => handleChange('isActive', val)}
              />
              <ToggleField
                label="Show in Menu"
                value={!!formData.isMenu}
                onChange={(val) => handleChange('isMenu', val)}
              />
            </div>
          </FormSection>
        )}
      </div>
    </Drawer>
  );
}

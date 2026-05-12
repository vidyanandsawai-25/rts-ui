'use client';

import { Drawer } from '@/components/common/Drawer';
import { Button } from '@/components/common/ActionButton';
import { Input } from '@/components/common/Input';
import { Save, FolderTree, Layout, Settings } from 'lucide-react';
import { ScreenGroupMasterData } from '@/types/screen-access.types';
import { useScreenGroupForm } from '@/hooks/configuration-settings/screenAccess/useScreenGroupForm';

import { GROUP_CODE_MAX, GROUP_NAME_MAX } from '@/lib/constants/screen-access.constants';
import { FormSection, FieldLabel, ErrorMsg, ToggleField } from './FormHelpers';

interface ScreenGroupFormProps {
  initialData?: Partial<ScreenGroupMasterData>;
  isEdit?: boolean;
}

export function ScreenGroupForm({ initialData, isEdit: isEditProp }: ScreenGroupFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleBlur,
    handleSubmit,
    handleCancel,
    showError,
    isEdit,
    t,
  } = useScreenGroupForm({ initialData, isEdit: isEditProp });

  return (
    <Drawer
      open={open}
      onClose={handleCancel}
      width="md"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg shadow-md">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit
                ? t('screenManagement.groups.form.editTitle')
                : t('screenManagement.groups.form.addTitle')}
            </h2>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
            {t('screenManagement.groups.form.cancelButton')}
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="bg-violet-700 hover:bg-violet-800 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {t('screenManagement.groups.form.saveButton')}
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Identity & Content */}
        <FormSection
          title={t('screenManagement.groups.form.sectionIdentity')}
          icon={<Layout className="w-4 h-4" />}
          color="violet"
        >
          <div className="space-y-4">
            <div>
              <FieldLabel
                htmlFor="screenGroupCode"
                label={t('screenManagement.groups.form.groupCode')}
                required
              />
              <Input
                id="screenGroupCode"
                value={formData.screenGroupCode || ''}
                onChange={(e) => handleChange('screenGroupCode', e.target.value.toUpperCase())}
                onBlur={() => handleBlur('screenGroupCode')}
                maxLength={GROUP_CODE_MAX}
                placeholder={t('screenManagement.groups.form.groupCodePlaceholder')}
                className="font-mono uppercase"
              />
              {showError('screenGroupCode') && <ErrorMsg error={errors.screenGroupCode} />}
            </div>
            <div>
              <FieldLabel
                htmlFor="screenGroupName"
                label={t('screenManagement.groups.form.groupName')}
                required
              />
              <Input
                id="screenGroupName"
                value={formData.screenGroupName || ''}
                onChange={(e) => handleChange('screenGroupName', e.target.value)}
                onBlur={() => handleBlur('screenGroupName')}
                maxLength={GROUP_NAME_MAX}
                placeholder={t('screenManagement.groups.form.groupNamePlaceholder')}
              />
              {showError('screenGroupName') && <ErrorMsg error={errors.screenGroupName} />}
            </div>
            <div>
              <FieldLabel
                htmlFor="displayOrder"
                label={t('screenManagement.groups.form.displayOrder')}
                required
              />
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder ?? ''}
                onChange={(e) =>
                  handleChange(
                    'displayOrder',
                    e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                  )
                }
                onBlur={() => handleBlur('displayOrder')}
                placeholder={t('screenManagement.groups.form.orderPlaceholder')}
              />
              {showError('displayOrder') && <ErrorMsg error={errors.displayOrder} />}
            </div>
          </div>
        </FormSection>

        {/* Configuration */}
        {isEdit && (
          <FormSection
            title={t('screenManagement.groups.form.sectionConfig')}
            icon={<Settings className="w-4 h-4" />}
            color="amber"
          >
            <div className="grid grid-cols-1 gap-6">
              <ToggleField
                label={t('screenManagement.groups.form.isActive')}
                value={!!formData.isActive}
                onChange={(val) => handleChange('isActive', val)}
              />
            </div>
          </FormSection>
        )}
      </div>
    </Drawer>
  );
}

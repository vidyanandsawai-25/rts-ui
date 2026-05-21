'use client';

import { Label, Input, Button, Drawer, ToggleSwitch, ValidationMessage } from '@/components/common';
import { useTranslations } from 'next-intl';
import { RoleFormProps } from '@/types/user-management';

export function RoleForm({
  isOpen,
  onClose,
  editingRole,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  errors,
}: RoleFormProps) {
  const t = useTranslations('userManagement');

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width="md"
      title={
        <div className="flex flex-col">
          <span className="font-semibold text-xl text-slate-700">
            {editingRole ? t('roles.editRole') : t('roles.addRole')}
          </span>
          <span className="text-sm text-slate-700 font-normal">{t('roles.subtitle')}</span>
        </div>
      }
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="flex-1 border-1">
            {t('actions.cancel')}
          </Button>
          <Button
            type="submit"
            form="role-form"
            disabled={isSubmitting}
            className="flex-1 text-white"
          >
            {isSubmitting
              ? t('actions.saving')
              : editingRole
                ? t('actions.updateRole')
                : t('actions.createRole')}
          </Button>
        </div>
      }
    >
      <form id="role-form" onSubmit={onSubmit} className="space-y-6 p-6">
        <div className="space-y-2">
          <Label>{t('table.role')} *</Label>
          <Input
            required
            maxLength={25}
            value={formData.name}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
              setFormData({ ...formData, name: val });
            }}
            placeholder={t('table.role')}
            className="h-10"
          />
          {errors?.name && (
            <ValidationMessage message={errors.name} />
          )}
        </div>

        {editingRole && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-semibold">{t('filters.status')}</Label>
              <p className="text-xs text-slate-500">
                {formData.isActive ? t('filters.active') : t('filters.inactive')}
              </p>
            </div>
            <ToggleSwitch
              checked={formData.isActive}
              onChange={(checked) => setFormData({ ...formData, isActive: checked })}
              showPopup={false}
            />
          </div>
        )}
      </form>
    </Drawer>
  );
}

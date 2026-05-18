'use client';

import { Label, Input, TextArea, Button, Drawer, ToggleSwitch } from '@/components/common';
import { useTranslations } from 'next-intl';
import { DesignationFormProps } from '@/types/user-management';

export function DesignationForm({
  isOpen,
  onClose,
  editingDesignation,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
}: DesignationFormProps) {
  const t = useTranslations('userManagement');

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      width="md"
      title={
        <div className="flex flex-col">
          <span className="font-semibold text-xl text-slate-700">
            {editingDesignation ? t('roles.editDesignation') : t('roles.addDesignation')}
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
            form="designation-form"
            disabled={isSubmitting}
            className="flex-1 text-white"
          >
            {isSubmitting
              ? t('actions.saving')
              : editingDesignation
                ? t('actions.updateDesignation')
                : t('actions.createDesignation')}
          </Button>
        </div>
      }
    >
      <form id="designation-form" onSubmit={onSubmit} className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t('form.code')} *</Label>
            <Input
              required
              value={formData.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder={t('form.code')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('roles.designationsTab')} *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t('roles.designationsTab')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('form.description')}</Label>
          <TextArea
            key={editingDesignation?.id || 'new'}
            defaultValue={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            placeholder={t('form.description')}
            className="text-black"
          />
        </div>

        {editingDesignation && (
          <div className="pt-2">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">{t('filters.status')}</Label>
              </div>
              <ToggleSwitch
                checked={formData.isActive}
                onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                showPopup={false}
              />
            </div>
          </div>
        )}
      </form>
    </Drawer>
  );
}

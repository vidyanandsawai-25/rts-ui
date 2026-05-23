'use client';

import { Label, Input, TextArea, Button, Drawer, ToggleSwitch, ValidationMessage } from '@/components/common';
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
  errors,
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
              maxLength={10}
              value={formData.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value.replace(/[^a-zA-Z\u0900-\u097F0-9]/g, '');
                setFormData({ ...formData, code: val });
              }}
              placeholder={t('form.code')}
            />
            {errors?.code && (
              <ValidationMessage message={errors.code} />
            )}
          </div>
          <div className="space-y-2">
            <Label>{t('roles.designationsTab')} *</Label>
            <Input
              required
              maxLength={20}
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
                setFormData({ ...formData, name: val });
              }}
              placeholder={t('roles.designationsTab')}
            />
            {errors?.name && (
              <ValidationMessage message={errors.name} />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('form.description')}</Label>
          <TextArea
            maxLength={50}
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              const val = e.target.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
              setFormData({ ...formData, description: val });
            }}
            rows={3}
            placeholder={t('form.description')}
            className="text-black"
          />
          {errors?.description && (
            <ValidationMessage message={errors.description} />
          )}
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

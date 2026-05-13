'use client';

import { Label } from '@/components/common/label';
import { Input, ValidationMessage, ToggleSwitch } from '@/components/common';
import { useTranslations } from 'next-intl';

interface CategoryFormFieldsProps {
  formData: {
    categoryCode: string;
    categoryName: string;
    displayOrder: string;
    isActive: boolean;
  };
  errors: Record<string, string>;
  isPending: boolean;
  isEdit: boolean;
  onChange: (field: string, value: string | boolean) => void;
}

export function CategoryFormFields({
  formData,
  errors,
  isPending,
  isEdit,
  onChange,
}: CategoryFormFieldsProps) {
  const t = useTranslations('configMaster');

  return (
    <div className="space-y-5 p-6">
      {/* Category Code */}
      <div className="space-y-2">
        <Label htmlFor="categoryCode" required className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('modals.addCategory.form.code')}
        </Label>
        <Input
          id="categoryCode"
          placeholder={t('modals.addCategory.form.placeholders.code')}
          value={formData.categoryCode}
          onChange={(e) => onChange('categoryCode', e.target.value)}
          className={errors.categoryCode ? 'border-red-500' : ''}
          disabled={isPending}
        />
        <ValidationMessage message={errors.categoryCode} visible={!!errors.categoryCode} />
      </div>

      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="categoryName" required className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('modals.addCategory.form.name')}
        </Label>
        <Input
          id="categoryName"
          placeholder={t('modals.addCategory.form.placeholders.name')}
          value={formData.categoryName}
          onChange={(e) => onChange('categoryName', e.target.value)}
          className={errors.categoryName ? 'border-red-500' : ''}
          disabled={isPending}
        />
        <ValidationMessage message={errors.categoryName} visible={!!errors.categoryName} />
      </div>

      {/* Display Order */}
      <div className="space-y-2">
        <Label htmlFor="displayOrder" required className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('modals.addCategory.form.displayOrder')}
        </Label>
        <Input
          id="displayOrder"
          type="number"
          min="0"
          placeholder="0"
          value={formData.displayOrder}
          onChange={(e) => onChange('displayOrder', e.target.value)}
          className={errors.displayOrder ? 'border-red-500' : ''}
          disabled={isPending}
        />
        <ValidationMessage message={errors.displayOrder} visible={!!errors.displayOrder} />
      </div>

      {/* Status Toggle - Only show in Edit mode */}
      {isEdit && (
        <div className="space-y-2">
          <Label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('modals.addCategory.form.status')}
          </Label>
          <ToggleSwitch
            checked={formData.isActive}
            onChange={(checked) => onChange('isActive', checked)}
            activeLabel={t('modals.addCategory.form.active')}
            inactiveLabel={t('modals.addCategory.form.inactive')}
            disabled={isPending}
            showPopup={false}
          />
        </div>
      )}
    </div>
  );
}

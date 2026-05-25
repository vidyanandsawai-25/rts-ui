'use client';

import { Label } from '@/components/common/label';
import { Input, ValidationMessage, TextArea, RequiredFieldsNote, StatusToggleCard } from '@/components/common';
import { useTranslations } from 'next-intl';
import { CODE_SANITIZE, TEXT_SANITIZE } from '@/lib/utils/validation-rules';

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
    <div className="space-y-6 p-6">
      <RequiredFieldsNote text={t('modals.addCategory.form.requiredFields')} />

      {/* Category Code */}
      <div className="space-y-2">
        <Label htmlFor="categoryCode" required className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('modals.addCategory.form.code')}
        </Label>
        <Input
          id="categoryCode"
          placeholder={t('modals.addCategory.form.placeholders.code')}
          value={formData.categoryCode}
          onChange={(e) => {
            const val = e.target.value
              .replace(CODE_SANITIZE, '')
              .replace(/_+/g, '_')
              .replace(/^_+/g, '');
            onChange('categoryCode', val);
          }}
          className={errors.categoryCode ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={20}
          aria-invalid={errors.categoryCode ? 'true' : 'false'}
          aria-describedby={errors.categoryCode ? 'categoryCode-error' : undefined}
        />
        <ValidationMessage id="categoryCode-error" message={errors.categoryCode} visible={!!errors.categoryCode} />
      </div>

      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="categoryName" required className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {t('modals.addCategory.form.name')}
        </Label>
        <TextArea
          id="categoryName"
          placeholder={t('modals.addCategory.form.placeholders.name')}
          value={formData.categoryName}
          onChange={(e) => {
            const val = e.target.value
              .replace(TEXT_SANITIZE, '')
              .replace(/[,.\-\/&]{2,}/g, (match) => match[0])
              .trimStart()
              .replace(/^[,.\-\/&]+/g, '');
            onChange('categoryName', val);
          }}
          className={errors.categoryName ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={100}
          rows={2}
          aria-invalid={errors.categoryName ? 'true' : 'false'}
          aria-describedby={errors.categoryName ? 'categoryName-error' : undefined}
        />
        <ValidationMessage id="categoryName-error" message={errors.categoryName} visible={!!errors.categoryName} />
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
          max="99999"
          placeholder="0"
          value={formData.displayOrder}
          onChange={(e) => onChange('displayOrder', e.target.value)}
          onKeyDown={(e) => {
            if (/^[eE+\-.]$/.test(e.key)) e.preventDefault();
          }}
          className={errors.displayOrder ? 'border-red-500' : ''}
          disabled={isPending}
          maxLength={5}
          aria-invalid={errors.displayOrder ? 'true' : 'false'}
          aria-describedby={errors.displayOrder ? 'displayOrder-error' : undefined}
        />
        <ValidationMessage id="displayOrder-error" message={errors.displayOrder} visible={!!errors.displayOrder} />
      </div>

      {/* Status Toggle - Only show in Edit mode */}
      {isEdit && (
        <StatusToggleCard
          isActive={formData.isActive}
          onToggle={(checked) => onChange('isActive', checked)}
          activeLabel={t('modals.addCategory.form.active')}
          inactiveLabel={t('modals.addCategory.form.inactive')}
          statusLabel={t('modals.addCategory.form.status')}
          description={formData.isActive ? t('modals.addCategory.form.activeDescription') : t('modals.addCategory.form.inactiveDescription')}
          disabled={isPending}
        />
      )}
    </div>
  );
}


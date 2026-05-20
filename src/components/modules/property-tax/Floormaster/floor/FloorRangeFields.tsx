'use client';

import { useTranslations } from 'next-intl';
import { Input, ValidationMessage } from '@/components/common';


/* ================= TYPES ================= */
import type { FloorRangeFieldsProps } from '@/types/floor.types';

/* ================= COMPONENT ================= */
/**
 * Range-specific form fields for FloorForm.
 * Handles: Range Start, Range End, Prefix inputs + their validation messages.
 * Parent (FloorForm) owns state, validation logic, and submit handler.
 */
export function FloorRangeFields({
  formData,
  errors,
  showError,
  onChange,
  onBlur,
}: Readonly<FloorRangeFieldsProps>) {
  const t = useTranslations('floor.floor');

  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={String(t('form.range.start'))}
            type="number"
            min={1}
            max={999}
            required
            placeholder={String(t('form.range.startPlaceholder'))}
            value={formData.rangeFrom || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 3) {
                onChange('rangeFrom', parseInt(value, 10) || 0);
              }
            }}
            onBlur={() => onBlur('rangeFrom')}
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.rangeFrom}
            visible={showError('rangeFrom')}
          />
        </div>
        
        <div>
          <Input
            label={String(t('form.range.end'))}
            type="number"
            min={1}
            max={999}
            required
            placeholder={String(t('form.range.endPlaceholder'))}
            value={formData.rangeTo || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 3) {
                onChange('rangeTo', parseInt(value, 10) || 0);
              }
            }}
            onBlur={() => onBlur('rangeTo')}
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.rangeTo}
            visible={showError('rangeTo')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={t('form.englishName.prefix')}
            placeholder="FL"
            value={formData.prefix}
            onChange={(e) => {
              // Allow only letters, numbers, /, -, _ (block @, #, (, ) etc)
              const sanitized = e.target.value.replace(/[^A-Za-z0-9/_-]/g, '');
              if (sanitized.length <= 2) onChange('prefix', sanitized);
            }}
            onBlur={() => onBlur('prefix')}
            fullWidth
            maxLength={2}
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.prefix}
            visible={showError('prefix')}
          />
        </div>

        <div>
          <Input
            label={t('form.englishName.suffix')}
            placeholder="F"
            value={formData.suffix}
            onChange={(e) => {
              // Allow only letters, numbers, /, -, _ (block @, #, (, ) etc)
              const sanitized = e.target.value.replace(/[^A-Za-z0-9/_-]/g, '');
              if (sanitized.length <= 2) onChange('suffix', sanitized);
            }}
            onBlur={() => onBlur('suffix')}
            fullWidth
            maxLength={2}
            className="text-gray-700"
          />
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
        {t('form.rangeExample')}
      </div>
    </div>
  );
}

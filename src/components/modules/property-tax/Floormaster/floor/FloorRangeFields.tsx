'use client';

import { useTranslations } from 'next-intl';
import { Input, ValidationMessage } from '@/components/common';


/* ================= TYPES ================= */
import type { FloorRangeFieldsProps } from '@/types/floor.types';

/* ================= COMPONENT ================= */
/**
 * Range-specific form fields for FloorForm.
 * Handles: Range Start, Range End, Prefix, Suffix inputs + their validation messages.
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
            label={t('form.range.start')}
            type="number"
            min={1}
            required
            placeholder={t('form.range.startPlaceholder')}
            value={formData.rangeFrom || ''}
            onChange={(e) => onChange('rangeFrom', parseInt(e.target.value) || 0)}
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
            label={t('form.range.end')}
            type="number"
            min={1}
            required
            placeholder={t('form.range.endPlaceholder')}
            value={formData.rangeTo || ''}
            onChange={(e) => onChange('rangeTo', parseInt(e.target.value) || 0)}
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

      <Input
        label={t('form.englishName.prefix')}
        placeholder={t('form.englishName.prefixPlaceholder')}
        value={formData.prefix}
        onChange={(e) => onChange('prefix', e.target.value)}
        onBlur={() => onBlur('prefix')}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.prefix}
        visible={showError('prefix')}
      />

      <Input
        label={t('form.englishName.suffix')}
        placeholder={t('form.englishName.suffixPlaceholder')}
        value={formData.suffix}
        onChange={(e) => onChange('suffix', e.target.value)}
        onBlur={() => onBlur('suffix')}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.suffix}
        visible={showError('suffix')}
      />

      <Input
        label={t('form.floorCode')}
        placeholder={t('form.floorCodePlaceholder')}
        value={formData.floorCode}
        onChange={(e) => onChange('floorCode', e.target.value)}
        onBlur={() => onBlur('floorCode')}
        fullWidth
        required
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.floorCode}
        visible={showError('floorCode')}
      />

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
        {t('form.rangeExample')}
      </div>
    </div>
  );
}

'use client';

import { Input, Select, TextArea, RequiredFieldsNote, StatusToggleCard } from '@/components/common';
import type {
  GrievanceCategoryFormFieldsProps,
  GrievanceCategory,
} from '@/types/grievance-category-master/grievanceCategory.types';
import { useTranslations } from 'next-intl';

function limitToMaxWords(text: string, maxWords: number): string {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;

  let wordCount = 0;
  let index = 0;
  const regex = /\S+/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    wordCount++;
    if (wordCount === maxWords) {
      index = match.index + match[0].length;
      break;
    }
  }

  return text.slice(0, index);
}

export function GrievanceCategoryFormFields({
  formData,
  fieldErrors,
  onFieldChange,
  departmentOptions,
  priorityOptions,
  escalationOptions,
  t,
  isEdit,
  isSubmitting,
  tCommonNote,
}: GrievanceCategoryFormFieldsProps) {
  const tCommonStatus = useTranslations('common.status');

  return (
    <div className="p-6 space-y-8 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
      {/* Form Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <RequiredFieldsNote text={tCommonNote('mandatory')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Category Code */}
        <div>
          <Input
            label={t.fields.code}
            required
            placeholder={t.fields.codePlaceholder}
            value={formData.categoryCode}
            onChange={(e) => onFieldChange('categoryCode', e.target.value)}
            error={fieldErrors.categoryCode}
            disabled={isSubmitting}
            maxLength={20}
            className="h-11 rounded-xl"
          />
        </div>

        {/* Category Name */}
        <div>
          <Input
            label={t.fields.name}
            required
            placeholder={t.fields.namePlaceholder}
            value={formData.categoryName}
            onChange={(e) => onFieldChange('categoryName', e.target.value)}
            error={fieldErrors.categoryName}
            disabled={isSubmitting}
            maxLength={100}
            className="h-11 rounded-xl"
          />
        </div>

        {/* Department */}
        <div>
          <Select
            label={t.fields.department}
            required
            options={departmentOptions}
            placeholder={t.fields.departmentPlaceholder}
            value={formData.departmentId ? String(formData.departmentId) : ''}
            onChange={(_, val) => onFieldChange('departmentId', val ? Number(val) : null)}
            error={fieldErrors.departmentId}
            disabled={isSubmitting}
            className="h-11 rounded-xl cursor-pointer"
          />
        </div>

        {/* Priority */}
        <div>
          <Select
            label={t.fields.priority}
            required
            options={priorityOptions}
            placeholder={t.fields.priorityPlaceholder}
            value={formData.priority}
            onChange={(_, val) => onFieldChange('priority', val as GrievanceCategory['priority'])}
            error={fieldErrors.priority}
            disabled={isSubmitting}
            className="h-11 rounded-xl cursor-pointer"
          />
        </div>

        {/* SLA */}
        <div>
          <Input
            type="number"
            min={0}
            max={365}
            label={t.fields.sla}
            required
            placeholder={t.fields.slaPlaceholder}
            value={formData.resolutionSla}
            onChange={(e) => onFieldChange('resolutionSla', e.target.value)}
            onInput={(e) => {
              if (e.currentTarget.value.length > 3) {
                e.currentTarget.value = e.currentTarget.value.slice(0, 3);
              }
            }}
            onKeyDown={(e) => {
              if (/^[eE+\-]$/.test(e.key)) e.preventDefault();
            }}
            error={fieldErrors.resolutionSla}
            disabled={isSubmitting}
            maxLength={3}
            className="h-11 rounded-xl"
          />
        </div>

        {/* Escalation */}
        <div>
          <Select
            label={t.fields.escalation}
            required
            options={escalationOptions}
            placeholder={t.fields.escalationPlaceholder}
            value={formData.escalationLevel}
            onChange={(_, val) =>
              onFieldChange('escalationLevel', val as GrievanceCategory['escalationLevel'])
            }
            error={fieldErrors.escalationLevel}
            disabled={isSubmitting}
            className="h-11 rounded-xl cursor-pointer"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <TextArea
          label={t.fields.description}
          placeholder={t.fields.descPlaceholder}
          value={formData.description}
          onChange={(e) => {
            const truncated = limitToMaxWords(e.target.value, 1000);
            onFieldChange('description', truncated);
          }}
          disabled={isSubmitting}
          error={!!fieldErrors.description}
          errorMessage={fieldErrors.description}
          maxLength={1000}
          rows={4}
          showCharCount={true}
          className="rounded-2xl resize-none p-4"
        />
      </div>

      {/* Status Toggle Card - Only show on edit */}
      {isEdit && formData.isActive !== undefined && (
        <StatusToggleCard
          isActive={formData.isActive}
          onToggle={(checked) => onFieldChange('isActive', checked)}
          statusLabel={t.fields.active}
          description={t.fields.activeDesc}
          activeLabel={tCommonStatus('active')}
          inactiveLabel={tCommonStatus('inactive')}
          disabled={isSubmitting}
        />
      )}
    </div>
  );
}

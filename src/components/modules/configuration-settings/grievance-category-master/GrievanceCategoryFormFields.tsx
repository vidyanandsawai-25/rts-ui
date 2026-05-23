'use client';

import { Input, Select, TextArea, RequiredFieldsNote, StatusToggleCard } from '@/components/common';
import type {
  GrievanceCategoryFormFieldsProps,
  GrievanceCategory,
} from '@/types/grievance-category-master/grievanceCategory.types';
import { useTranslations } from 'next-intl';
import { CODE_SANITIZE, TEXT_SANITIZE, DESCRIPTION_SANITIZE } from '@/lib/utils/validation-rules';

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
            id="categoryCode"
            label={t.fields.code}
            required
            placeholder={t.fields.codePlaceholder}
            value={formData.categoryCode}
            onChange={(e) => {
              const val = e.target.value
                .replace(CODE_SANITIZE, '')
                .replace(/_+/g, '_')
                .replace(/^_+/g, '');
              onFieldChange('categoryCode', val);
            }}
            error={fieldErrors.categoryCode}
            disabled={isSubmitting}
            maxLength={20}
            className="h-11 rounded-xl"
            aria-invalid={fieldErrors.categoryCode ? 'true' : 'false'}
            aria-describedby={fieldErrors.categoryCode ? 'categoryCode-error' : undefined}
          />
        </div>

        {/* Category Name */}
        <div>
          <Input
            id="categoryName"
            label={t.fields.name}
            required
            placeholder={t.fields.namePlaceholder}
            value={formData.categoryName}
            onChange={(e) => {
              const val = e.target.value
                .replace(TEXT_SANITIZE, '')
                .replace(/[,.\-\/&]{2,}/g, (match) => match[0])
                .trimStart()
                .replace(/^[,.\-\/&]+/g, '');
              onFieldChange('categoryName', val);
            }}
            error={fieldErrors.categoryName}
            disabled={isSubmitting}
            maxLength={100}
            className="h-11 rounded-xl"
            aria-invalid={fieldErrors.categoryName ? 'true' : 'false'}
            aria-describedby={fieldErrors.categoryName ? 'categoryName-error' : undefined}
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
            id="resolutionSla"
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
              if (/^[eE+\-.,]$/.test(e.key)) e.preventDefault();
            }}
            error={fieldErrors.resolutionSla}
            disabled={isSubmitting}
            maxLength={3}
            className="h-11 rounded-xl"
            aria-invalid={fieldErrors.resolutionSla ? 'true' : 'false'}
            aria-describedby={fieldErrors.resolutionSla ? 'resolutionSla-error' : undefined}
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
          id="description"
          label={t.fields.description}
          placeholder={t.fields.descPlaceholder}
          value={formData.description}
          onChange={(e) => {
            const val = e.target.value
              .replace(DESCRIPTION_SANITIZE, '')
              .replace(/[\/,.\-()&]{2,}/g, (match) => match[0]);
            onFieldChange('description', val);
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

'use client';

import React, { useMemo } from 'react';
import { Input, ValidationMessage, Select, ToggleSwitch } from '@/components/common';
import { SocialAttributeFormModel, SocialAttribute } from '@/types/social-attribute.types';

interface FormFieldsSectionProps {
  formData: SocialAttributeFormModel;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isChild: boolean;
  handleToggleIsChild: () => void;
  handleToggleIsRequiredWhenParentTrue: () => void;
  handleToggleIsDiscountApplicable: () => void;
  errors: Partial<Record<keyof SocialAttributeFormModel, string>>;
  showError: (field: keyof SocialAttributeFormModel) => boolean;
  t: (key: string) => string;
  parentAttributes: SocialAttribute[];
}

export const FormFieldsSection = ({
  formData,
  handleChange,
  handleBlur,
  isChild,
  handleToggleIsChild,
  handleToggleIsRequiredWhenParentTrue,
  handleToggleIsDiscountApplicable,
  errors,
  showError,
  t,
  parentAttributes,
}: FormFieldsSectionProps) => {
  const dataTypeOptions = useMemo(
    () => [
      { label: t('form.fields.dataType.placeholder'), value: '' },
      { label: 'DECIMAL', value: 'DECIMAL' },
      { label: 'BIT', value: 'BIT' },
      { label: 'INTEGER', value: 'INT' },
      { label: 'TEXT', value: 'TEXT' },
      { label: 'DATE', value: 'DATE' },
    ],
    [t]
  );

  const parentAttributeOptions = useMemo(
    () => [
      { label: t('form.fields.parentAttribute.placeholder'), value: '' },
      ...parentAttributes
        .filter((attr) => attr.id !== formData.id) // Cannot be own parent
        .map((attr) => ({
          label: `${attr.socialAttributeName} (${attr.socialAttributeCode})`,
          value: String(attr.id),
        })),
    ],
    [parentAttributes, formData.id, t]
  );

  return (
    <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
      {/* Code */}
      <Input
        name="socialAttributeCode"
        label={t('form.fields.socialAttributeCode.label')}
        required
        placeholder={t('form.fields.socialAttributeCode.placeholder')}
        value={formData.socialAttributeCode}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.socialAttributeCode}
        visible={showError('socialAttributeCode')}
      />

      {/* Name */}
      <Input
        name="socialAttributeName"
        label={t('form.fields.socialAttributeName.label')}
        required
        placeholder={t('form.fields.socialAttributeName.placeholder')}
        value={formData.socialAttributeName}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage
        message={errors.socialAttributeName}
        visible={showError('socialAttributeName')}
      />

      {/* Data Type */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-slate-700">
          {t('form.fields.dataType.label')} <span className="text-red-500">*</span>
        </label>
        <Select
          name="dataType"
          value={formData.dataType}
          onChange={handleChange}
          onBlur={handleBlur}
          options={dataTypeOptions}
          selectSize="md"
          className="w-full text-gray-700"
          ariaLabel={t('form.fields.dataType.label') || 'Data Type'}
        />
        <ValidationMessage message={errors.dataType} visible={showError('dataType')} />
      </div>

      {/* Unit */}
      <Input
        name="unit"
        label={t('form.fields.unit.label')}
        placeholder={t('form.fields.unit.placeholder')}
        value={formData.unit}
        onChange={handleChange}
        onBlur={handleBlur}
        fullWidth
        className="text-gray-700"
      />
      <ValidationMessage message={errors.unit} visible={showError('unit')} />

      {/* Is Child Attribute Toggle */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
        <div>
          <div className="text-sm font-medium text-slate-700">{t('form.fields.isChild.label')}</div>
        </div>
        <ToggleSwitch checked={isChild} onChange={handleToggleIsChild} showPopup={false} />
      </div>

      {/* Parent Attribute & Conditional field (Required when parent true) */}
      {isChild && (
        <>
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-slate-700">
              {t('form.fields.parentAttribute.label')}
            </label>
            <Select
              name="parentAttributeId"
              value={formData.parentAttributeId != null ? String(formData.parentAttributeId) : ''}
              onChange={handleChange}
              onBlur={handleBlur}
              options={parentAttributeOptions}
              selectSize="md"
              className="w-full text-gray-700"
              ariaLabel={t('form.fields.parentAttribute.label') || 'Parent Attribute'}
            />
          </div>

          {formData.parentAttributeId != null && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <div>
                <div className="text-sm font-medium text-slate-700">
                  {t('form.fields.isRequiredWhenParentTrue.label')}
                </div>
              </div>
              <ToggleSwitch
                checked={formData.isRequiredWhenParentTrue}
                onChange={handleToggleIsRequiredWhenParentTrue}
                showPopup={false}
              />
            </div>
          )}
        </>
      )}

      {/* Discount Applicable */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3">
        <div>
          <div className="text-sm font-medium text-slate-700">
            {t('form.fields.isDiscountApplicable.label')}
          </div>
        </div>
        <ToggleSwitch
          checked={formData.isDiscountApplicable}
          onChange={handleToggleIsDiscountApplicable}
          showPopup={false}
        />
      </div>
    </div>
  );
};

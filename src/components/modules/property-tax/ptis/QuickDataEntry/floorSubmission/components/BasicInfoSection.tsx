'use client';

import React from 'react';
import { SearchSelect } from '@/components/common';
import { BasicInfoSectionProps } from '@/types/floor-details.types';
import { FloorData } from '@/types/room-details.types';
import { getSelectOptions } from '@/lib/utils/form-options.util';
import { normalizeToStringArray } from '@/lib/utils/dropdown-helpers';
import { FieldWrapper } from './SectionField';
import { validateField } from '@/lib/validations/validateFloorSubmission';
import { toast } from 'sonner';

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  t,
  editingFloorForm,
  setEditingFloorForm,
  formErrors,
  setFormErrors,
  floorOptions,
  floorLookup,
  subFloorOptions,
  subFloorLookup,
  getFloorDescription,
  getSubFloorDescription,
  handleOpenDropdown,
}) => {
  const [lastTypedIndex, setLastTypedIndex] = React.useState<{ conYr: number; asstYr: number }>({ conYr: -1, asstYr: -1 });

  const handleYearChange = (
    field: 'conYr' | 'asstYr',
    rawVal: string,
    errorTranslationKey: string
  ) => {
    const value = rawVal.replace(/\D/g, '').slice(0, 4);
    const prevVal = String(editingFloorForm[field] || '');
    
    // Only set animation for the newly added character index
    if (value.length > prevVal.length) {
      setLastTypedIndex((prev) => ({ ...prev, [field]: value.length - 1 }));
    } else {
      setLastTypedIndex((prev) => ({ ...prev, [field]: -1 })); // Reset on delete or backspace
    }

    const newForm = { ...editingFloorForm, [field]: value };
    setEditingFloorForm(newForm);
    
    let currentError = '';
    if (value.length === 4) {
      const validation = validateField(field, value);
      if (!validation.isValid) {
        currentError = validation.error || errorTranslationKey;
      }
    }

    setFormErrors((prev) => {
      const updated = { ...prev, [field]: currentError };
      
      const conYrVal = String(newForm.conYr || '');
      const asstYrVal = String(newForm.asstYr || '');
      
      if (conYrVal.length === 4 && asstYrVal.length === 4) {
        const conYear = parseInt(conYrVal, 10);
        const asstYear = parseInt(asstYrVal, 10);
        if (!isNaN(conYear) && !isNaN(asstYear) && conYear > asstYear) {
          const errMsg = t('floor.asstYrError') || 'Assessment Year cannot be less than Construction Year';
          updated.asstYr = errMsg;
          if (prev.asstYr !== errMsg) {
            toast.error(errMsg);
          }
        } else {
          const crossFieldError = t('floor.asstYrError') || 'Assessment Year cannot be less than Construction Year';
          if (prev.asstYr === crossFieldError || updated.asstYr === crossFieldError) {
            updated.asstYr = '';
          }
        }
      }
      return updated;
    });
  };

  const renderAnimatedYearInput = (
    field: 'conYr' | 'asstYr',
    id: string,
    placeholder: string,
    errorMsg: string
  ) => {
    const value = String(editingFloorForm[field] || '');
    
    return (
      <div className="relative w-full h-9 rounded-lg border border-gray-300 hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 overflow-hidden bg-white flex items-center">
        {/* Hidden but functional real input overlaying the whole field */}
        <input
          id={id}
          type="text"
          maxLength={4}
          value={value}
          onChange={(e) => handleYearChange(field, e.target.value, errorMsg)}
          onBlur={(e) => {
            const val = e.target.value;
            const validation = validateField(field, val);
            let fieldErr = '';
            if (!validation.isValid) {
              fieldErr = validation.error || errorMsg;
            }
            
            setFormErrors((prev) => {
              const updated = { ...prev, [field]: fieldErr };
              const conYrVal = String(editingFloorForm.conYr || '');
              const asstYrVal = String(editingFloorForm.asstYr || '');
              
              if (conYrVal.length === 4 && asstYrVal.length === 4) {
                const conYear = parseInt(conYrVal, 10);
                const asstYear = parseInt(asstYrVal, 10);
                if (!isNaN(conYear) && !isNaN(asstYear) && conYear > asstYear) {
                  const errMsg = t('floor.asstYrError') || 'Assessment Year cannot be less than Construction Year';
                  updated.asstYr = errMsg;
                  if (prev.asstYr !== errMsg) {
                    toast.error(errMsg);
                  }
                } else {
                  const crossFieldError = t('floor.asstYrError') || 'Assessment Year cannot be less than Construction Year';
                  if (prev.asstYr === crossFieldError || updated.asstYr === crossFieldError) {
                    updated.asstYr = '';
                  }
                }
              }
              return updated;
            });
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10 text-sm px-3 focus:outline-none"
        />
        
        {/* Visual representation of characters */}
        <div className="absolute inset-0 flex items-center px-3 gap-0.5 pointer-events-none select-none">
          {value.length === 0 ? (
            <span className="text-gray-400 text-sm font-normal">{placeholder}</span>
          ) : (
            value.split('').map((char, index) => {
              const shouldAnimate = index === lastTypedIndex[field];
              return (
                <span
                  key={`${index}-${char}`}
                  className={`inline-block text-sm font-semibold text-gray-800 ${shouldAnimate ? 'animate-digit-pop' : ''}`}
                >
                  {char}
                </span>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Is Taxable Dropdown */}
      <FieldWrapper label={t('floor.taxable')} htmlFor="floor-is-taxable" error={formErrors.isTaxable}>
        <SearchSelect
          id="floor-is-taxable"
          name="isTaxable"
          options={[
            { label: t('floor.yes'), value: 'Yes' },
            { label: t('floor.no'), value: 'No' },
          ]}
          value={(editingFloorForm.isTaxable as string) ?? 'Yes'}
          onChange={(_name, value) => {
            setEditingFloorForm({ ...editingFloorForm, isTaxable: value });
          }}
          placeholder={t('floor.selectTaxableStatus')}
          className="h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </FieldWrapper>

      {/* Floor */}
      <FieldWrapper label={t('floor.floorLabel')} htmlFor="floor-floor" required error={formErrors.floorId || formErrors.floor}>
        <div onFocusCapture={() => handleOpenDropdown('loadFloor')}>
          <SearchSelect
            id="floor-floor"
            name="floorId"
            options={[
              { label: t('floor.selectFloor'), value: "" },
              ...getSelectOptions(
                normalizeToStringArray(floorOptions),
                floorLookup,
                'floorId',
                'description',
                'floorCode',
                editingFloorForm.floorId,
                getFloorDescription
              )
            ]}
            value={String(editingFloorForm.floorId ?? '')}
            onChange={(_name, value) => {
              const desc = getFloorDescription(value, floorLookup);
              setEditingFloorForm((prev: FloorData) => ({
                ...prev,
                floorId: value,
                floor: desc || value,
                floorDescription: desc || value
              }));
              // Simple required validation: if value is empty, show error
              if (!value) {
                setFormErrors((prev) => ({ ...prev, floorId: t('floor.errors.floorRequired') || 'Floor selection is required' }));
              } else {
                setFormErrors((prev) => ({ ...prev, floorId: '', floor: '' }));
              }
            }}
            placeholder={t('floor.selectFloor')}
            className="h-9 text-sm"
          />
        </div>
      </FieldWrapper>

      {/* Sub Floor */}
      <FieldWrapper label={t('floor.subFloor')} htmlFor="floor-sub-floor" error={formErrors.subFloorId || formErrors.subFloor}>
        <div onFocusCapture={() => handleOpenDropdown('loadSubFloor')}>
          <SearchSelect
            id="floor-sub-floor"
            name="subFloorId"
            options={[
              { label: t('floor.selectSubFloor'), value: "" },
              ...getSelectOptions(
                normalizeToStringArray(subFloorOptions),
                subFloorLookup,
                'subFloorId',
                'description',
                'subFloorCode',
                editingFloorForm.subFloorId,
                getSubFloorDescription
              )
            ]}
            value={String(editingFloorForm.subFloorId ?? '')}
            onChange={(_name, value) => {
              const desc = getSubFloorDescription(value, subFloorLookup);
              setEditingFloorForm((prev: FloorData) => ({
                ...prev,
                subFloorId: value === "" ? undefined : value,
                subFloor: value === "" ? "" : (desc || value),
                subFloorDescription: value === "" ? "" : (desc || value)
              }));
              // // Simple required validation: if value is empty, show error
            }}
            placeholder={t('floor.selectSubFloor')}
            className="h-9 text-sm"
          />
        </div>
      </FieldWrapper>

      {/* Con Yr (Construction Year) */}
      <FieldWrapper label={t('roomSubmission.table.conYr')} htmlFor="floor-con-yr" required error={formErrors.conYr}>
        {renderAnimatedYearInput('conYr', 'floor-con-yr', '2020', t('floor.errors.constructionYearInvalid'))}
      </FieldWrapper>

      {/* Asst Yr (Assessment Year) */}
      <FieldWrapper
        label={t('roomSubmission.table.asstYr')}
        htmlFor="floor-asst-yr"
        required
        error={formErrors.asstYr === (t('floor.asstYrError') || 'Assessment Year cannot be less than Construction Year') ? undefined : formErrors.asstYr}
      >
        {renderAnimatedYearInput('asstYr', 'floor-asst-yr', '2024', t('floor.errors.assessmentYearInvalid'))}
      </FieldWrapper>
    </>
  );
};


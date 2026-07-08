'use client';

import React from 'react';
import { SearchSelect, AnimatedDigitInput } from '@/components/common';
import { UsageSectionProps } from '@/types/floor-details.types';
import { FloorData } from '@/types/room-details.types';
import { LookupData } from '@/types/common-details.types';
import { getSelectOptions } from '@/lib/utils/form-options.util';
import { normalizeToStringArray } from '@/lib/utils/dropdown-helpers';
import { convertSqMToSqFt } from '@/lib/utils/RoomSubmission/conversions';
import { FieldWrapper } from './SectionField';
import { checkIsUtilityCategory } from '@/lib/utils/floorSubmission/floor-utility-checks';

const limitDecimalString = (val: string, maxBefore: number = 10, maxAfter: number = 2): string => {
  let filtered = '';
  let hasDot = false;
  let beforeDotCount = 0;
  let afterDotCount = 0;

  for (const char of val) {
    if (char === '.') {
      if (!hasDot && beforeDotCount <= maxBefore) {
        filtered += char;
        hasDot = true;
      }
    } else if (/^[0-9]$/.test(char)) {
      if (!hasDot) {
        if (beforeDotCount < maxBefore) {
          filtered += char;
          beforeDotCount++;
        }
      } else {
        if (afterDotCount < maxAfter) {
          filtered += char;
          afterDotCount++;
        }
      }
    }
  }
  return filtered;
};

const handleDecimalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentValue: string) => {
  if (e.key === '.' && currentValue.includes('.')) {
    e.preventDefault();
    return;
  }
  const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', '.'];
  if (!/^[0-9]$/.test(e.key) && !controlKeys.includes(e.key)) {
    e.preventDefault();
  }
};

export const UsageSection: React.FC<UsageSectionProps & { selectedFloorType?: 'Construction' | 'OpenPlot'; isPlotCategory?: boolean }> = ({
  t,
  editingFloorForm,
  setEditingFloorForm,
  formErrors,
  setFormErrors,
  constructionTypeOptions,
  constructionLookup,
  useOptions,
  useLookup,
  subTypeOptionsFromData,
  subTypeData,
  startTransition,
  updateUrlParams,
  getConstructionDescription,
  getUseDescription,
  getSubTypeDescription,
  handleOpenDropdown,
  selectedFloorType = 'Construction',
  isPlotCategory = false,
}) => {
  const isUseEnabled = selectedFloorType === 'OpenPlot' || !!editingFloorForm.constructionTypeId;

  return (
    <>
      {/* Con Typ (Construction Type) */}
      {selectedFloorType !== 'OpenPlot' && (
        <FieldWrapper label={t('floor.conTyp')} htmlFor="floor-type" required error={formErrors.constructionTypeId || formErrors.conTyp}>
          <div onFocusCapture={() => handleOpenDropdown('loadConstruction')}>
            <SearchSelect
              id="floor-type"
              name="constructionTypeId"
              menuPlacement="top"
              options={[
                { label: t('floor.selectType'), value: "" },
                ...getSelectOptions(
                  normalizeToStringArray(constructionTypeOptions),
                  constructionLookup,
                  'constructionTypeId',
                  'description',
                  'constructionCode',
                  editingFloorForm.constructionTypeId,
                  getConstructionDescription
                )
              ]}
              value={String(editingFloorForm.constructionTypeId ?? '')}
              onChange={(_name, value) => {
                const desc = getConstructionDescription(value, constructionLookup);
                setEditingFloorForm((prev: FloorData) => ({
                  ...prev,
                  constructionTypeId: value,
                  conTyp: desc || value,
                  constructionTypeDescription: desc || value
                }));
                if (formErrors.constructionTypeId || formErrors.conTyp) {
                  setFormErrors((prev) => ({ ...prev, constructionTypeId: '', conTyp: '' }));
                }
              }}
              placeholder={t('floor.selectType')}
              className="h-9 text-sm"
            />
          </div>
        </FieldWrapper>
      )}

      {/* Use */}
      <FieldWrapper
        label={t('floor.use')}
        htmlFor="floor-use"
        required
        error={formErrors.typeOfUseId || formErrors.use}
        labelExtra={
          !isUseEnabled && (
            <span className="text-[9px] text-orange-500 font-medium px-1.5 py-0.5 bg-orange-50 rounded border border-orange-100 animate-pulse">
              {t('floor.selectConTypFirst')}
            </span>
          )
        }
      >
        <div onFocusCapture={() => isUseEnabled && handleOpenDropdown('loadUsage')}>
          <SearchSelect
            id="floor-use"
            name="typeOfUseId"
            menuPlacement="top"
            options={[
              { label: t('floor.selectUsage'), value: "" },
              ...getSelectOptions(
                normalizeToStringArray(useOptions),
                useLookup,
                'typeOfUseId',
                'description',
                'typeOfUseCode',
                editingFloorForm.typeOfUseId,
                getUseDescription
              )
            ]}
            value={String(editingFloorForm.typeOfUseId ?? '')}
            onChange={(_name, value) => {
              const desc = getUseDescription(value, useLookup);
              startTransition(() => {
                updateUrlParams({ typeOfUseId: value, loadSubType: 'true' });
              });
              const selectedUse = useLookup?.find(u => String(u.typeOfUseId || u.id || '') === String(value));
              const categoryId: number | null = selectedUse ? (selectedUse.typeOfUseCategoryId !== undefined && selectedUse.typeOfUseCategoryId !== null ? Number(selectedUse.typeOfUseCategoryId) : null) : null;
              const isUtil = checkIsUtilityCategory(categoryId);
              setEditingFloorForm((prev: FloorData) => ({
                ...prev,
                typeOfUseId: value,
                use: desc || value,
                typeOfUseDescription: desc || value,
                subTypeOfUseId: "",
                subTyp: "",
                subTypeOfUseDescription: "",
                typeOfUseCategoryId: categoryId,
                ...(isUtil ? { rooms: "0" } : {})
              }));
              setFormErrors((prev) => ({ ...prev, typeOfUseId: '', use: '', rooms: '' }));
            }}
            placeholder={!isUseEnabled ? t('floor.selectConTypFirst') : t('floor.selectUsage')}
            disabled={!isUseEnabled}
            className={`h-9 text-sm transition-colors ${!isUseEnabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : ''}`}
          />
        </div>
      </FieldWrapper>

      {/* Sub Type */}
      <FieldWrapper
        label={t('floor.subTyp')}
        htmlFor="floor-sub-typ"
        error={formErrors.subTypeOfUseId || formErrors.subTyp}
        labelExtra={
          !editingFloorForm.typeOfUseId && (
            <span className="text-[9px] text-orange-500 font-medium px-1.5 py-0.5 bg-orange-50 rounded border border-orange-100 animate-pulse">
              {t('floor.selectUseFirst')}
            </span>
          )
        }
      >
        <div onFocusCapture={() => editingFloorForm.typeOfUseId && handleOpenDropdown('loadSubType')}>
          <SearchSelect
            id="floor-sub-typ"
            name="subTypeOfUseId"
            menuPlacement="top"
            options={[
              { label: t('floor.selectSubtype'), value: "" },
              ...getSelectOptions(
                subTypeOptionsFromData,
                subTypeData,
                'subTypeOfUseId',
                'description',
                'searchKey',
                editingFloorForm.subTypeOfUseId as string | number | undefined,
                (val: string, lookup: LookupData[]): string => {
                  return getSubTypeDescription(val, lookup) || String(editingFloorForm.subTypeOfUseDescription || '');
                }
              )
            ]}
            value={String(editingFloorForm.subTypeOfUseId ?? '')}
            onChange={(_name, value) => {
              const desc = getSubTypeDescription(value, subTypeData);
              setEditingFloorForm((prev: FloorData) => ({
                ...prev,
                subTypeOfUseId: value,
                subTyp: desc || value,
                subTypeOfUseDescription: desc || value
              }));
              if (formErrors.subTypeOfUseId || formErrors.subTyp) {
                setFormErrors((prev) => ({ ...prev, subTypeOfUseId: '', subTyp: '' }));
              }
            }}
            placeholder={!editingFloorForm.typeOfUseId ? t('floor.selectUseFirst') : subTypeOptionsFromData.length === 0 ? t('floor.noSubtypesAvailable') : t('floor.selectSubtype')}
            disabled={!editingFloorForm.typeOfUseId || subTypeOptionsFromData.length === 0}
            className={`h-9 text-sm transition-colors ${!editingFloorForm.typeOfUseId || subTypeOptionsFromData.length === 0
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : ''
              }`}
          />
        </div>
      </FieldWrapper>

      {selectedFloorType === 'OpenPlot' && (
        <>
          <FieldWrapper label={t('floor.lengthMtrLabel') || 'Length (M)'} htmlFor="floor-length" required error={formErrors.length}>
            <AnimatedDigitInput
              id="floor-length"
              placeholder="0.00"
              value={String(editingFloorForm.length ?? '')}
              disabled={isPlotCategory}
              maxLength={14}
              allowedPattern={/^[0-9.]$/}
              onKeyDown={(e) => handleDecimalKeyDown(e, String(editingFloorForm.length ?? ''))}
              onChange={(val) => {
                const filtered = limitDecimalString(val, 10, 3);
                const lenVal = parseFloat(filtered) || 0;
                const widthVal = parseFloat(String(editingFloorForm.width ?? '')) || 0;
                const sqM = lenVal * widthVal;
                const sqFt = convertSqMToSqFt(sqM);

                setEditingFloorForm((prev: FloorData) => {
                  const updated: FloorData = {
                    ...prev,
                    length: filtered,
                  };
                  if (isPlotCategory || selectedFloorType === 'OpenPlot') {
                    updated.areaSqM = sqM > 0 ? sqM.toFixed(2) : '0.00';
                    updated.areaSqFt = sqFt > 0 ? sqFt.toFixed(2) : '0.00';
                  }
                  return updated;
                });

                if (formErrors.length) setFormErrors((prev) => ({ ...prev, length: '' }));
              }}
              className={`h-9 text-sm ${isPlotCategory ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </FieldWrapper>

          <FieldWrapper label={t('floor.widthMtrLabel') || 'Width (M)'} htmlFor="floor-width" required error={formErrors.width}>
            <AnimatedDigitInput
              id="floor-width"
              placeholder="0.00"
              value={String(editingFloorForm.width ?? '')}
              disabled={isPlotCategory}
              maxLength={14}
              allowedPattern={/^[0-9.]$/}
              onKeyDown={(e) => handleDecimalKeyDown(e, String(editingFloorForm.width ?? ''))}
              onChange={(val) => {
                const lenVal = parseFloat(String(editingFloorForm.length ?? '')) || 0;
                const filtered = limitDecimalString(val, 10, 3);
                const widthVal = parseFloat(filtered) || 0;
                const sqM = lenVal * widthVal;
                const sqFt = convertSqMToSqFt(sqM);

                setEditingFloorForm((prev: FloorData) => {
                  const updated: FloorData = {
                    ...prev,
                    width: filtered,
                  };
                  if (isPlotCategory || selectedFloorType === 'OpenPlot') {
                    updated.areaSqM = sqM > 0 ? sqM.toFixed(2) : '0.00';
                    updated.areaSqFt = sqFt > 0 ? sqFt.toFixed(2) : '0.00';
                  }
                  return updated;
                });

                if (formErrors.width) setFormErrors((prev) => ({ ...prev, width: '' }));
              }}
              className={`h-9 text-sm ${isPlotCategory ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </FieldWrapper>
        </>
      )}
    </>
  );
};

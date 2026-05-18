'use client';

import React from 'react';
import { SearchSelect } from '@/components/common';
import { UsageSectionProps } from '@/types/floor-details.types';
import { FloorData } from '@/types/room-details.types';
import { LookupData } from '@/types/common-details.types';
import { getSelectOptions } from '@/lib/utils/form-options.util';
import { normalizeToStringArray } from '@/lib/utils/dropdown-helpers';
import { FieldWrapper } from './SectionField';

export const UsageSection: React.FC<UsageSectionProps> = ({
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
}) => {
  return (
    <>
      {/* Con Typ (Construction Type) */}
      <FieldWrapper label={t('floor.conTyp')} htmlFor="floor-type" required error={formErrors.constructionTypeId || formErrors.conTyp}>
        <div onFocusCapture={() => handleOpenDropdown('loadConstruction')}>
          <SearchSelect
            id="floor-type"
            name="constructionTypeId"
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

      {/* Use */}
      <FieldWrapper
        label={t('floor.use')}
        htmlFor="floor-use"
        required
        error={formErrors.typeOfUseId || formErrors.use}
        labelExtra={!editingFloorForm.constructionTypeId && (
          <span className="text-[9px] text-orange-500 font-medium">
            {t('floor.selectConTypFirst')}
          </span>
        )}
      >
        <div onFocusCapture={() => handleOpenDropdown('loadUsage')}>
          <SearchSelect
            id="floor-use"
            name="typeOfUseId"
            options={[
              { label: t('floor.selectUsage'), value: "" },
              ...getSelectOptions(
                normalizeToStringArray(useOptions),
                useLookup,
                'typeOfUseId',
                'description',
                'typeOfUseCode',
                editingFloorForm.typeOfUseId as string | number | undefined,
                getUseDescription
              )
            ]}
            value={String(editingFloorForm.typeOfUseId ?? '')}
            onChange={(_name, value) => {
              const desc = getUseDescription(value, useLookup);
              setEditingFloorForm((prev: FloorData) => ({ 
                ...prev, 
                typeOfUseId: value,
                use: desc || value,
                typeOfUseDescription: desc || value,
                subTypeOfUseId: '',
                subTyp: '',
                subTypeOfUseDescription: '' 
              }));
              if (formErrors.typeOfUseId || formErrors.use) {
                setFormErrors((prev) => ({ ...prev, typeOfUseId: '', use: '' }));
              }
              startTransition(() => {
                updateUrlParams({ typeOfUseId: value, loadSubType: 'true' });
              });
            }}
            placeholder={!editingFloorForm.constructionTypeId ? t('floor.selectConTypFirst') : t('floor.selectUsage')}
            disabled={!editingFloorForm.constructionTypeId}
            className={`h-9 text-sm transition-colors ${!editingFloorForm.constructionTypeId
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : normalizeToStringArray(useOptions).length === 0 && !editingFloorForm.typeOfUseId
                ? 'bg-gray-50 border-gray-200 text-gray-400'
                : ''
              }`}
          />
        </div>
      </FieldWrapper>

      {/* Sub Typ (Subtype) */}
      <FieldWrapper
        label={t('floor.subTyp')}
        htmlFor="floor-sub-typ"
        error={formErrors.subTypeOfUseId || formErrors.subTyp}
        labelExtra={!editingFloorForm.typeOfUseId && (
          <span className="text-[9px] text-orange-500 font-medium">
            {t('floor.selectUseFirst')}
          </span>
        )}
      >
        <div onFocusCapture={() => editingFloorForm.typeOfUseId && handleOpenDropdown('loadSubType')}>
          <SearchSelect
            id="floor-sub-typ"
            name="subTypeOfUseId"
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
    </>
  );
};

'use client';

import React from 'react';
import { Input, SearchSelect } from '@/components/common';
import { BasicInfoSectionProps } from '@/types/floor-details.types';
import { FloorData } from '@/types/room-details.types';
import { getSelectOptions } from '@/lib/utils/form-options.util';
import { normalizeToStringArray } from '@/lib/utils/dropdown-helpers';
import { FieldWrapper } from './SectionField';

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
  return (
    <>
      {/* Is Taxable Dropdown */}
      <FieldWrapper label={t('floor.isTaxable')} htmlFor="floor-is-taxable" error={formErrors.isTaxable}>
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
              if (formErrors.floorId || formErrors.floor) {
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
                subFloorId: value,
                subFloor: desc || value,
                subFloorDescription: desc || value 
              }));
              if (formErrors.subFloorId || formErrors.subFloor) {
                setFormErrors((prev) => ({ ...prev, subFloorId: '', subFloor: '' }));
              }
            }}
            placeholder={t('floor.selectSubFloor')}
            className="h-9 text-sm"
          />
        </div>
      </FieldWrapper>

      {/* Con Yr (Construction Year) */}
      <FieldWrapper label={t('floor.conYr')} htmlFor="floor-con-yr" required error={formErrors.conYr}>
        <Input
          id="floor-con-yr"
          type="text"
          placeholder="2020"
          maxLength={4}
          value={editingFloorForm.conYr || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setEditingFloorForm({ ...editingFloorForm, conYr: value });
            if (formErrors.conYr) setFormErrors((prev) => ({ ...prev, conYr: '' }));
          }}
          className="h-9 text-sm"
        />
      </FieldWrapper>

      {/* Asst Yr (Assessment Year) */}
      <FieldWrapper label={t('floor.asstYr')} htmlFor="floor-asst-yr" required error={formErrors.asstYr}>
        <Input
          id="floor-asst-yr"
          type="text"
          placeholder="2024"
          maxLength={4}
          value={editingFloorForm.asstYr || ''}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setEditingFloorForm({ ...editingFloorForm, asstYr: value });
            if (formErrors.asstYr) setFormErrors((prev) => ({ ...prev, asstYr: '' }));
          }}
          className="h-9 text-sm"
        />
      </FieldWrapper>
    </>
  );
};

import { validateGrievanceCategoryForm } from '@/hooks/asset-masters/grievance-category/validation';
import { AssetGrievanceCategoryFormModel } from '@/types/asset-masters/asset-grievance-category.types';
import { describe, test, expect } from 'vitest';

const t = (key: string, values?: Record<string, string | number | Date>) => {
  if (values) {
    return `${key}_${JSON.stringify(values)}`;
  }
  return key;
};

describe('validateGrievanceCategoryForm', () => {
  const baseModel: AssetGrievanceCategoryFormModel = {
    categoryName: '',
    description: '',
    resolutionSlaDays: NaN,
    isActive: false,
  };

  test('requires categoryName', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel }, t, false);
    expect(errors.categoryName).toBe('form.errors.nameReq');
  });

  test('categoryName min length check', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'ab' }, t, false);
    expect(errors.categoryName).toBe('form.errors.nameMinLength');
  });

  test('categoryName max length check (100)', () => {
    const longName = 'a'.repeat(101);
    const errors = validateGrievanceCategoryForm({ ...baseModel, categoryName: longName }, t, false);
    expect(errors.categoryName).toBe('form.errors.nameMaxLength');
  });

  test('categoryName all zeros or invalid characters', () => {
    const errorsAllZeros = validateGrievanceCategoryForm({ ...baseModel, categoryName: '0000' }, t, false);
    expect(errorsAllZeros.categoryName).toBe('form.errors.invalidFormat_{"default":"Only alphanumeric characters and spaces are allowed"}');

    const errorsInvalidChar = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'Cat@123' }, t, false);
    expect(errorsInvalidChar.categoryName).toBe('form.errors.invalidFormat_{"default":"Only alphanumeric characters and spaces are allowed"}');
  });

  test('description min length check', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'Valid Name', description: 'ab' }, t, false);
    expect(errors.description).toBe('form.errors.descMinLength');
  });

  test('description max length check (500)', () => {
    const longDesc = 'a'.repeat(501);
    const errors = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'Valid Name', description: longDesc }, t, false);
    expect(errors.description).toBe('form.errors.descMaxLength');
  });

  test('resolutionSlaDays validation', () => {
    const errorsEmpty = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'Valid Name' }, t, false);
    expect(errorsEmpty.resolutionSlaDays).toBe('form.errors.slaReq');

    const errorsZero = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'Valid Name', resolutionSlaDays: 0 }, t, false);
    expect(errorsZero.resolutionSlaDays).toBe('form.errors.slaPositiveInteger');

    const errorsNegative = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'Valid Name', resolutionSlaDays: -5 }, t, false);
    expect(errorsNegative.resolutionSlaDays).toBe('form.errors.slaPositiveInteger');

    const errorsMax = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'Valid Name', resolutionSlaDays: 366 }, t, false);
    expect(errorsMax.resolutionSlaDays).toBe('form.errors.slaMaxDays');
  });

  test('isActive required on create', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, categoryName: 'Valid Name', resolutionSlaDays: 10, isActive: false }, t, false);
    expect(errors.isActive).toBe('form.errors.mustBeActive_{"default":"Must be active"}');
  });

  test('no errors on valid model (create & edit)', () => {
    const validModel = {
      categoryName: 'Valid Category',
      description: 'Valid Description text',
      resolutionSlaDays: 10,
      isActive: true,
    };
    const errorsCreate = validateGrievanceCategoryForm(validModel, t, false);
    expect(errorsCreate).toEqual({});

    const errorsEdit = validateGrievanceCategoryForm({ ...validModel, isActive: false }, t, true);
    expect(errorsEdit).toEqual({});
  });
});

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
    grievanceTypeCode: 'GRV_WATER_LEAK',
    grievanceTypeName: 'Water Leakage',
    grievanceTypeNameLocal: 'पाणी पुरवठा गळती',
    codeFormat: 'WTR-{YYYY}-{SEQ}',
    displaySequence: 1,
    targetTableName: 'tbl_water',
    requiresFieldCorrection: false,
    slaDays: 3,
    description: 'Water distribution problem',
    isActive: true,
  };

  test('requires grievanceTypeCode', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, grievanceTypeCode: '' }, t, false);
    expect(errors.grievanceTypeCode).toBe('form.errors.typeCodeReq');
  });

  test('grievanceTypeCode max length check (50)', () => {
    const longCode = 'a'.repeat(51);
    const errors = validateGrievanceCategoryForm({ ...baseModel, grievanceTypeCode: longCode }, t, false);
    expect(errors.grievanceTypeCode).toBe('form.errors.typeCodeMaxLength');
  });

  test('grievanceTypeCode regex validation', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, grievanceTypeCode: 'INVALID CODE!' }, t, false);
    expect(errors.grievanceTypeCode).toBe('form.errors.typeCodeInvalidFormat');
  });

  test('requires grievanceTypeName', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, grievanceTypeName: '' }, t, false);
    expect(errors.grievanceTypeName).toBe('form.errors.typeNameReq');
  });

  test('grievanceTypeName max length check (200)', () => {
    const longName = 'a'.repeat(201);
    const errors = validateGrievanceCategoryForm({ ...baseModel, grievanceTypeName: longName }, t, false);
    expect(errors.grievanceTypeName).toBe('form.errors.typeNameMaxLength');
  });

  test('requires grievanceTypeNameLocal', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, grievanceTypeNameLocal: '' }, t, false);
    expect(errors.grievanceTypeNameLocal).toBe('form.errors.typeNameLocalReq');
  });

  test('requires codeFormat', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, codeFormat: '' }, t, false);
    expect(errors.codeFormat).toBe('form.errors.codeFormatReq');
  });

  test('requires targetTableName', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, targetTableName: '' }, t, false);
    expect(errors.targetTableName).toBe('form.errors.targetTableNameReq');
  });

  test('requires slaDays', () => {
    const errorsEmpty = validateGrievanceCategoryForm({ ...baseModel, slaDays: null }, t, false);
    expect(errorsEmpty.slaDays).toBe('form.errors.slaReq');
  });

  test('slaDays validation', () => {
    const errorsNegative = validateGrievanceCategoryForm({ ...baseModel, slaDays: -5 }, t, false);
    expect(errorsNegative.slaDays).toBe('form.errors.slaMustBeNonNegative');

    const errorsMax = validateGrievanceCategoryForm({ ...baseModel, slaDays: 4000 }, t, false);
    expect(errorsMax.slaDays).toBe('form.errors.slaMaxDays');
  });

  test('requires description', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, description: '' }, t, false);
    expect(errors.description).toBe('form.errors.descReq');
  });

  test('requires requiresFieldCorrection', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, requiresFieldCorrection: undefined as unknown as boolean }, t, false);
    expect(errors.requiresFieldCorrection).toBe('form.errors.requiresFieldCorrectionReq');
  });

  test('isActive required on create', () => {
    const errors = validateGrievanceCategoryForm({ ...baseModel, isActive: false }, t, false);
    expect(errors.isActive).toBe('form.errors.mustBeActive');
  });

  test('no errors on valid model (create & edit)', () => {
    const validModel: AssetGrievanceCategoryFormModel = {
      grievanceTypeCode: 'GRV_WATER_LEAK',
      grievanceTypeName: 'Water Leakage',
      grievanceTypeNameLocal: 'पाणी पुरवठा गळती',
      codeFormat: 'WTR-{YYYY}-{SEQ}',
      displaySequence: 1,
      targetTableName: 'tbl_water',
      requiresFieldCorrection: false,
      slaDays: 3,
      description: 'Water distribution problem',
      isActive: true,
    };
    const errorsCreate = validateGrievanceCategoryForm(validModel, t, false);
    expect(errorsCreate).toEqual({});

    const errorsEdit = validateGrievanceCategoryForm({ ...validModel, isActive: false }, t, true);
    expect(errorsEdit).toEqual({});
  });
});

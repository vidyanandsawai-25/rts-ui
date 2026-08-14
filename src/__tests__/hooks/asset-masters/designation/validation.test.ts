import { validateDesignationForm } from '@/hooks/asset-masters/designation/validation';
import { DesignationFormModel } from '@/types/asset-masters/designation.types';
import { describe, test, expect } from 'vitest';

const t = (key: string, values?: Record<string, string | number | Date>) => {
  if (values) {
    return `${key}_${JSON.stringify(values)}`;
  }
  return key;
};

describe('validateDesignationForm', () => {
  const baseModel: DesignationFormModel = {
    designationCode: '',
    designationName: '',
    designationLocal: '',
    designationDescription: '',
    owningDepartmentId: null,
    isActive: false,
  };

  test('requires designationCode', () => {
    const errors = validateDesignationForm({ ...baseModel }, t, false);
    expect(errors.designationCode).toBe('form.validation.designationCodeRequired');
  });

  test('designationCode max length check (20)', () => {
    const longCode = 'A'.repeat(21);
    const errors = validateDesignationForm({ ...baseModel, designationCode: longCode }, t, false);
    expect(errors.designationCode).toBe('form.validation.designationCodeMaxLength_{"count":20}');
  });

  test('designationCode format and zeros check', () => {
    const errorsZeros = validateDesignationForm({ ...baseModel, designationCode: '0000' }, t, false);
    expect(errorsZeros.designationCode).toBe('form.validation.invalidFormat_{"default":"Invalid format"}');

    const errorsFormat = validateDesignationForm({ ...baseModel, designationCode: 'Code@123' }, t, false);
    expect(errorsFormat.designationCode).toBe('form.validation.designationCodeFormat');
  });

  test('requires designationName', () => {
    const errors = validateDesignationForm({ ...baseModel, designationCode: 'CODE1' }, t, false);
    expect(errors.designationName).toBe('form.validation.designationNameRequired');
  });

  test('designationName max length check (100)', () => {
    const longName = 'A'.repeat(101);
    const errors = validateDesignationForm({ ...baseModel, designationCode: 'CODE1', designationName: longName }, t, false);
    expect(errors.designationName).toBe('form.validation.designationNameMaxLength_{"count":100}');
  });

  test('designationName format and zeros check', () => {
    const errorsZeros = validateDesignationForm({ ...baseModel, designationCode: 'CODE1', designationName: '0000' }, t, false);
    expect(errorsZeros.designationName).toBe('form.validation.designationNameFormat');
  });

  test('requires designationLocal', () => {
    const errors = validateDesignationForm({ ...baseModel, designationCode: 'CODE1', designationName: 'Name' }, t, false);
    expect(errors.designationLocal).toBe('form.validation.designationLocalRequired');
  });

  test('designationLocal max length check (100)', () => {
    const longName = 'A'.repeat(101);
    const errors = validateDesignationForm({ ...baseModel, designationCode: 'CODE1', designationName: 'Name', designationLocal: longName }, t, false);
    expect(errors.designationLocal).toBe('form.validation.designationLocalMaxLength_{"count":100}');
  });

  test('description optional but max length check (100)', () => {
    const longDesc = 'A'.repeat(101);
    const errors = validateDesignationForm({ 
      ...baseModel, 
      designationCode: 'CODE1', 
      designationName: 'Name', 
      designationLocal: 'Local Name', 
      designationDescription: longDesc 
    }, t, false);
    expect(errors.designationDescription).toBe('form.validation.descriptionMaxLength_{"count":100}');
  });

  test('requires owningDepartmentId', () => {
    const errors = validateDesignationForm({ 
      ...baseModel, 
      designationCode: 'CODE1', 
      designationName: 'Name', 
      designationLocal: 'Local Name' 
    }, t, false);
    expect(errors.owningDepartmentId).toBe('form.validation.owningDepartmentRequired');
  });

  test('isActive required on create', () => {
    const errors = validateDesignationForm({ 
      ...baseModel, 
      designationCode: 'CODE1', 
      designationName: 'Name', 
      designationLocal: 'Local Name',
      owningDepartmentId: 1,
      isActive: false 
    }, t, false);
    expect(errors.isActive).toBe('form.validation.mustBeActive');
  });

  test('no errors on valid model (create & edit)', () => {
    const validModel = {
      designationCode: 'CODE1',
      designationName: 'Valid Name',
      designationLocal: 'Valid Local',
      designationDescription: 'Valid Desc',
      owningDepartmentId: 3,
      isActive: true,
    };
    const errorsCreate = validateDesignationForm(validModel, t, false);
    expect(errorsCreate).toEqual({});

    const errorsEdit = validateDesignationForm({ ...validModel, isActive: false }, t, true);
    expect(errorsEdit).toEqual({});
  });
});

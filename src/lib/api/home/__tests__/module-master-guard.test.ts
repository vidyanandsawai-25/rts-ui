import { describe, it, expect } from 'vitest';
import { getModuleMaster } from '../module-master.service';
import { isModuleMasterShape, normalizeModuleMaster } from '../module-master-guard';

const validItem = {
  id: 1,
  moduleCode: 'MOD1',
  moduleName: 'Module 1',
  departmentName: 'Dept',
};

const invalidItem = {
  id: 'not-a-number',
  moduleCode: '',
};

describe('isModuleMasterShape', () => {
  it('returns true for valid shape', () => {
    expect(isModuleMasterShape(validItem)).toBe(true);
  });
  it('returns false for invalid shape', () => {
    expect(isModuleMasterShape(invalidItem)).toBe(false);
    expect(isModuleMasterShape({})).toBe(false);
  });
});

describe('normalizeModuleMaster', () => {
  it('normalizes valid item', () => {
    const result = normalizeModuleMaster(validItem);
    expect(result.id).toBe(1);
    expect(result.moduleCode).toBe('MOD1');
  });
  it('throws for invalid id', () => {
    expect(() => normalizeModuleMaster({ ...validItem, id: 0 })).toThrow();
    expect(() => normalizeModuleMaster({ ...validItem, id: 'bad' })).toThrow();
  });
  it('throws for missing moduleCode', () => {
    expect(() => normalizeModuleMaster({ ...validItem, moduleCode: '' })).toThrow();
  });
});

// Integration test for getModuleMaster would require API mocking, which is not shown here.

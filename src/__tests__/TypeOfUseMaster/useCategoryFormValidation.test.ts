/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCategoryFormValidation } from '@/hooks/TypeOfUseMaster/useCategoryFormValidation';

describe('useCategoryFormValidation', () => {
  const mockT = vi.fn((key: string) => key);
  const allCategories = [
    { id: 1, typeOfUseCategoryCode: 'C01', typeOfUseCategoryName: 'Residential' },
    { id: 2, typeOfUseCategoryCode: 'C02', typeOfUseCategoryName: 'Commercial' },
  ] as any;

  it('validates code correctly', () => {
    const { result } = renderHook(() =>
      useCategoryFormValidation({
        categoryId: null,
        allCategories,
        isEdit: false,
        t: mockT,
      })
    );

    const validateCode = result.current.validationSchema.code;
    
    expect(validateCode('')).toContain('messages.createError');
    expect(validateCode('000')).toContain('messages.cannotBeAllZeros');
    expect(validateCode('A'.repeat(21))).toContain('messages.maxLength');
    expect(validateCode('!@#')).toContain('messages.onlyAlphanumeric');
    expect(validateCode('C01')).toContain('category.messages.duplicateCode');
    expect(validateCode('C03')).toBeUndefined();
  });

  it('validates name correctly', () => {
    const { result } = renderHook(() =>
      useCategoryFormValidation({
        categoryId: null,
        allCategories,
        isEdit: false,
        t: mockT,
      })
    );

    const validateName = result.current.validationSchema.name;
    
    expect(validateName('')).toContain('messages.createError');
    expect(validateName('000')).toContain('messages.cannotBeAllZeros');
    expect(validateName('A'.repeat(51))).toContain('messages.maxLength');
    expect(validateName('<script>')).toContain('messages.allowedChars');
    expect(validateName('Residential')).toContain('category.messages.duplicateName');
    expect(validateName('Industrial')).toBeUndefined();
  });

  it('allows duplicate check bypass during edit', () => {
    const { result } = renderHook(() =>
      useCategoryFormValidation({
        categoryId: 1,
        allCategories,
        isEdit: true,
        t: mockT,
      })
    );

    const validateCode = result.current.validationSchema.code;
    const validateName = result.current.validationSchema.name;
    
    expect(validateCode('C01')).toBeUndefined();
    expect(validateName('Residential')).toBeUndefined();

    expect(validateCode('C02')).toContain('category.messages.duplicateCode');
    expect(validateName('Commercial')).toContain('category.messages.duplicateName');
  });
});

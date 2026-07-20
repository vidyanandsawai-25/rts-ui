/**
 * useCategoryFormValidation Hook
 * 
 * Handles validation logic for TypeOfUseCategory forms (create/edit)
 * Provides field validators and duplicate checking
 */

import { useMemo } from 'react';
import type { TypeOfUseCategory } from '@/types/typeOfUse.types';
import type { Validator } from '@/lib/utils/validation-helpers';
import { CODE_REGEX, TEXT_ALLOWED, isAllZeros } from '@/lib/utils/validation-rules';
import { normalize } from '@/lib/utils/sanitization';

type TranslatorFunction = (key: string, values?: Record<string, string | number>) => string;

interface UseCategoryFormValidationProps {
  categoryId: number | null;
  allCategories: TypeOfUseCategory[];
  isEdit: boolean;
  t: TranslatorFunction;
}

export function useCategoryFormValidation({
  categoryId,
  allCategories,
  isEdit,
  t,
}: UseCategoryFormValidationProps) {
  
  // Duplicate check for category code
  const isDuplicateCode = (code: string): boolean => {
    const c = normalize(code);
    if (!c) return false;
    return allCategories.some((cat) => {
      if (isEdit && cat.id === categoryId) return false;
      return normalize(cat.typeOfUseCategoryCode || '') === c;
    });
  };

  // Duplicate check for category name
  const isDuplicateCategoryName = (name: string): boolean => {
    const nm = normalize(name);
    if (!nm) return false;
    return allCategories.some((cat) => {
      if (isEdit && cat.id === categoryId) return false;
      return normalize(cat.typeOfUseCategoryName || '') === nm;
    });
  };

  // Validation schema
  const validationSchema: Record<string, Validator> = useMemo(
    () => ({
      code: (value: unknown) => {
        const code = String(value ?? '').trim();
        
        if (!code) return t('category.fields.categoryCode') + ' ' + t('messages.createError');
        if (isAllZeros(code)) return t('category.fields.categoryCode') + ' ' + t('messages.cannotBeAllZeros');
        if (code.length > 20) return t('category.fields.categoryCode') + ' ' + t('messages.maxLength', { count: 20 });
        if (!CODE_REGEX.test(code)) return t('category.fields.categoryCode') + ' ' + t('messages.onlyAlphanumeric');
        if (isDuplicateCode(code)) return t('category.messages.duplicateCode');
        
        return undefined;
      },
      
      name: (value: unknown) => {
        const name = String(value ?? '').trim();
        
        if (!name) return t('category.fields.categoryName') + ' ' + t('messages.createError');
        if (isAllZeros(name)) return t('category.fields.categoryName') + ' ' + t('messages.cannotBeAllZeros');
        if (name.length > 50) return t('category.fields.categoryName') + ' ' + t('messages.maxLength', { count: 50 });
        if (!TEXT_ALLOWED.test(name)) return t('category.fields.categoryName') + ' ' + t('messages.allowedChars');
        if (isDuplicateCategoryName(name)) return t('category.messages.duplicateName');
        
        return undefined;
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, allCategories, categoryId, isEdit]
  );

  return {
    validationSchema,
    isDuplicateCode,
    isDuplicateCategoryName,
  };
}

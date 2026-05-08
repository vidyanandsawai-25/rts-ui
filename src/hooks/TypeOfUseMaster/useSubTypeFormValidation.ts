import { useMemo } from 'react';
import type { UseSubType } from '@/types/typeOfUse.types';
import type { Validator } from '@/lib/utils/validation-helpers';
import { DESCRIPTION_REGEX } from '@/lib/utils/validation-rules';

// Translator function type
type TranslatorFunction = (key: string, values?: Record<string, string | number>) => string;

interface UseSubTypeFormValidationProps {
  formData: UseSubType;
  allSubTypes: UseSubType[];
  isEdit: boolean;
  t: TranslatorFunction;
}

export function useSubTypeFormValidation({
  formData,
  allSubTypes,
  isEdit,
  t,
}: UseSubTypeFormValidationProps) {
  // Normalization helper
  const normalize = (v: string) => v.trim().toLowerCase();

  // Duplicate check helper
  const isDuplicateDescription = (desc: string): boolean => {
    const d = normalize(desc);
    if (!d) return false;
    return allSubTypes.some((s) => {
      if (isEdit && s.subTypeOfUseId === formData.subTypeOfUseId) return false;
      return normalize(s.description ?? '') === d;
    });
  };

  // Validation schema
  const validationSchema: Record<string, Validator> = useMemo(
    () => ({
      typeOfUseId: (value: unknown) => {
        const typeId = Number(value);
        if (!typeId) return t('messages.typeMissing');
        return undefined;
      },

      description: (value: unknown) => {
        const desc = String(value ?? '').trim();

        if (!desc) return t('messages.subTypeNameRequired');
        if (desc.length > 100)
          return t('messages.subTypeNameLabel') + ' ' + t('messages.maxLength', { count: 100 });
        if (!DESCRIPTION_REGEX.test(desc))
          return t('messages.subTypeNameLabel') + ' ' + t('messages.allowedChars');
        if (isDuplicateDescription(desc)) return t('messages.duplicateSubTypeName');

        return undefined;
      },

      searchSequence: (value: unknown) => {
        const seq = Number(value);
        if (!Number.isFinite(seq) || seq < 0) {
          return t('messages.searchSequenceLabel') + ' ' + t('messages.sequenceNonNegative');
        }
        return undefined;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData.subTypeOfUseId, allSubTypes, isEdit, t]
  );

  return {
    validationSchema,
    isDuplicateDescription,
  };
}

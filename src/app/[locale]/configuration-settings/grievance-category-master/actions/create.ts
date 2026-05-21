'use server';

import { revalidatePath } from 'next/cache';

import { sanitizeInput, sanitizeDescription } from '@/lib/utils/security';
import { createGrievanceCategory } from '@/lib/api/configuration-settings/grievance-category-master/grievanceCategory.service';
import type {
  CreateGrievanceCategoryRequest,
  FormState,
  Priority,
  EscalationLevel,
} from '@/types/grievance-category-master/grievanceCategory.types';
import {
  PRIORITIES,
  ESCALATION_LEVELS,
} from '@/types/grievance-category-master/grievanceCategory.types';
import { locales } from '@/i18n/config';
import { getTranslations } from 'next-intl/server';
import {
  validateGrievanceCategory,
  type ValidationTranslator,
  type GrievanceCategoryValidationInput,
} from '@/lib/utils/grievance-category-validation';
import { logger } from '@/lib/utils/logger';
import { getCurrentUserId, parsePositiveInteger } from './utils';

/**
 * Create Grievance Category Action
 */
export async function createGrievanceCategoryAction(
  locale: string,
  formData: FormData
): Promise<FormState> {
  if (!locales.includes(locale as (typeof locales)[number])) {
    return { success: false, error: 'invalidLocale' };
  }

  // Actions MUST verify the session first
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) {
    return { success: false, error: 'unauthorized' };
  }

  // Extract fields from FormData
  const categoryCode = formData.get('categoryCode') as string | null;
  const categoryName = formData.get('categoryName') as string | null;
  const departmentIdRaw = formData.get('departmentId') as string | null;
  const priority = formData.get('priority') as string | null;
  const resolutionSla = formData.get('resolutionSla') as string | null;
  const escalationLevel = formData.get('escalationLevel') as string | null;
  const description = formData.get('description') as string | null;
  const isActiveRaw = formData.get('isActive') as string | null;

  // Server-side validation using centralized utility
  const t = await getTranslations({ locale, namespace: 'grievanceCategory.form' });
  const tVal: ValidationTranslator = (key: string, replacements?: Record<string, unknown>) =>
    t(
      key as Parameters<typeof t>[0],
      replacements as Record<string, string | number | Date> | undefined
    );

  const validationInput: GrievanceCategoryValidationInput = {
    categoryCode: categoryCode,
    categoryName: categoryName,
    departmentId: departmentIdRaw,
    priority: priority as Priority | null,
    resolutionSla: resolutionSla,
    escalationLevel: escalationLevel as EscalationLevel | null,
    description: description,
    isActive: isActiveRaw === 'true',
  };

  const fieldErrors = validateGrievanceCategory(validationInput, tVal);

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  const departmentId = parsePositiveInteger(departmentIdRaw);
  const sla = parsePositiveInteger(resolutionSla);

  if (departmentId === undefined || sla === undefined) {
    return {
      success: false,
      fieldErrors: {
        ...fieldErrors,
        ...(departmentId === undefined ? { departmentId: tVal('errors.invalidDept') } : {}),
        ...(sla === undefined ? { resolutionSla: tVal('errors.slaPositiveInteger') } : {}),
      },
    };
  }

  // CRIT-3: Explicit validation guards before type casting
  if (!PRIORITIES.includes(priority as Priority)) {
    return {
      success: false,
      fieldErrors: { priority: tVal('errors.invalidPriority') },
    };
  }

  if (!ESCALATION_LEVELS.includes(escalationLevel as EscalationLevel)) {
    return {
      success: false,
      fieldErrors: { escalationLevel: tVal('errors.invalidEscalation') },
    };
  }

  const sanitizedData: CreateGrievanceCategoryRequest = {
    categoryCode: sanitizeInput(categoryCode!),
    categoryName: sanitizeInput(categoryName!),
    departmentId,
    priority: priority as Priority,
    resolutionSla: String(sla),
    escalationLevel: escalationLevel as EscalationLevel,
    description: sanitizeDescription(description),
    isActive: isActiveRaw === 'true',
  };

  try {
    const response = await createGrievanceCategory(sanitizedData);

    if (response.success) {
      revalidatePath(`/[locale]/configuration-settings/grievance-category-master`, 'page');
      return { success: true, message: response.message };
    } else {
      logger.error('API failed to create grievance category:', {
        errorDetail: response.error,
        message: response.message,
        locale,
      });
      return {
        success: false,
        error: response.error || response.message || 'Failed to create',
        message: response.message,
      };
    }
  } catch (error) {
    logger.error('Failed to create grievance category:', {
      error: error instanceof Error ? error : undefined,
      errorMessage: error instanceof Error ? error.message : String(error),
      locale,
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create',
    };
  }
}
